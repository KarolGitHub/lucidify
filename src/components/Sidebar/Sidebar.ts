import { defineComponent } from "vue";
import NotificationDropdown from "@/components/Dropdowns/NotificationDropdown/NotificationDropdown.vue";
import UserDropdown from "@/components/Dropdowns/UserDropdown/UserDropdown.vue";
import SelectThemeDropdown from "@/components/Dropdowns/SelectThemeDropdown/SelectThemeDropdown.vue";
import { messaging } from "@/server/firebase/firebase";
import { onMessage, getToken } from "firebase/messaging";
import { firebaseConfig } from "@/config";
import apiClient from "@/services/axios/config";

interface Notification {
  id: number;
  title: string;
  body: string;
  timestamp: Date;
  data?: any;
}

interface TokenData {
  token: string;
  userId: string | null;
  userEmail: string | null;
  deviceInfo: {
    userAgent: string;
    platform: string;
    timestamp: string;
  };
}

export default defineComponent({
  name: "Sidebar",
  components: {
    NotificationDropdown,
    UserDropdown,
    SelectThemeDropdown,
  },
  data() {
    return {
      collapseShow: "hidden" as string,
      fcmToken: null as string | null,
      notifications: [] as Notification[],
    };
  },
  async mounted() {
    // Set up message listener for foreground messages
    this.setupMessageListener();

    // Get FCM token
    await this.getFCMToken();

    // Request notification permission
    this.requestNotificationPermission();
  },
  methods: {
    toggleCollapseShow(classes?: string) {
      // If no classes provided, toggle between open and closed
      if (!classes) {
        this.collapseShow =
          this.collapseShow === "hidden" ? "bg-white m-2 py-3 px-6" : "hidden";
      } else {
        // If classes provided, set to that state
        this.collapseShow = classes;
      }
    },

    setupMessageListener() {
      onMessage(messaging, (payload) => {
        // Add notification to the list
        this.notifications.unshift({
          id: Date.now(),
          title: payload.notification?.title || "New Message",
          body: payload.notification?.body || "You have a new notification",
          timestamp: new Date(),
          data: payload.data,
        });

        // Show browser notification if permission is granted
        if (Notification.permission === "granted") {
          new Notification(payload.notification?.title || "New Message", {
            body: payload.notification?.body,
            icon: "/favicon.ico", // You can customize this
            data: payload.data,
          });
        }
      });
    },

    async getFCMToken() {
      try {
        // Option 1: With VAPID key (recommended for production)
        const currentToken = await getToken(messaging, {
          vapidKey: firebaseConfig.vapidKey,
        });

        // Option 2: Without VAPID key (for testing only - remove this in production)
        // const currentToken = await getToken(messaging);

        if (currentToken) {
          this.fcmToken = currentToken;

          // Send this token to your backend to store it
          await this.sendTokenToServer(currentToken);
        } else {
          console.debug(
            "No registration token available. Request permission to generate one.",
          );
        }
      } catch (err: any) {
        console.debug("💪 ~ Sidebar ~ Error getting token:", err);

        // If VAPID key fails, try without it (for testing)
        if (err.message.includes("applicationServerKey")) {
          console.debug("Trying without VAPID key...");
          try {
            const fallbackToken = await getToken(messaging);
            if (fallbackToken) {
              this.fcmToken = fallbackToken;
              console.debug(
                "💪 ~ Sidebar ~ Fallback FCM Token:",
                fallbackToken,
              );
            }
          } catch (fallbackErr) {
            console.debug("💪 ~ Sidebar ~ Fallback error:", fallbackErr);
          }
        }
      }
    },

    async requestNotificationPermission() {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("Notification permission granted.");
          // Retry getting token after permission is granted
          await this.getFCMToken();
        } else {
          console.log("Notification permission denied.");
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    },

    // Method to send token to your backend
    async sendTokenToServer(token: string) {
      try {
        // Get current user info if you have authentication
        const user = (this as any).$store?.state?.auth?.user || null;

        const tokenData: TokenData = {
          token: token,
          userId: user?.uid || null,
          userEmail: user?.email || null,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            timestamp: new Date().toISOString(),
          },
        };

        const response = await apiClient.post("fcm-tokens", tokenData);

        if (response.status >= 200 && response.status < 300) {
          const result = response.data;
          console.log("FCM token sent successfully:", result);
        } else {
          console.error("Failed to send FCM token to server:", response.status);
        }
      } catch (error) {
        console.error("Error sending FCM token to server:", error);
      }
    },

    testNotification() {
      // Test browser notification
      if (Notification.permission === "granted") {
        new Notification("Test Notification", {
          body: "This is a test notification from Lucidify!",
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "test-notification",
          requireInteraction: false,
        });
      } else {
        alert(
          "Notification permission not granted. Please enable notifications.",
        );
      }

      // Log current FCM token
      if (this.fcmToken) {
        console.log("Current FCM Token:", this.fcmToken);
      } else {
        console.log("No FCM token available");
      }
    },
  },
});
