import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { realityCheckScheduler } from "@/store";
import { RealityCheckScheduler } from "@/interface/RealityCheckScheduler";
import {
  requestPermissionAndSendToken,
  getCurrentToken,
  refreshToken,
} from "@/server/firebase/firebase";

export default defineComponent({
  name: "CardRealityCheckScheduler",
  setup() {
    const store = realityCheckScheduler;

    // Local reactive state for FCM token and notification permission
    const fcmToken = ref<string | null>(null);
    const notificationPermission = ref<NotificationPermission>("default");

    // Local settings for form handling
    const localSettings = ref<RealityCheckScheduler>({
      enabled: false,
      frequency: "every_4_hours",
      customInterval: 240,
      startTime: "09:00",
      endTime: "22:00",
      message: "Are you dreaming?",
      daysOfWeek: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      timezone: "UTC",
    });

    // Days of week options
    const daysOfWeek = [
      { value: "monday", label: "Monday" },
      { value: "tuesday", label: "Tuesday" },
      { value: "wednesday", label: "Wednesday" },
      { value: "thursday", label: "Thursday" },
      { value: "friday", label: "Friday" },
      { value: "saturday", label: "Saturday" },
      { value: "sunday", label: "Sunday" },
    ];

    // Computed properties
    const loading = computed(() => store.getters.getLoading());
    const error = computed(() => store.getters.getError());
    const canReceiveNotifications = computed(
      () =>
        localSettings.value.enabled &&
        notificationPermission.value === "granted" &&
        fcmToken.value !== null,
    );

    // Methods
    const fetchSettings = async () => {
      try {
        await store.actions.fetchSettings();
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    const saveSettings = async () => {
      try {
        await store.actions.updateSettings(localSettings.value);
      } catch (error) {
        console.error("Error saving settings:", error);
      }
    };

    const requestPermission = async () => {
      try {
        const granted = await store.actions.requestNotificationPermission();
        if (granted) {
          notificationPermission.value = "granted";
          await initializeFirebaseMessaging();
        }
      } catch (error) {
        console.error("Error requesting permission:", error);
      }
    };

    const initializeFirebaseMessaging = async () => {
      try {
        console.log("Initializing Firebase messaging...");

        // Check if we already have a valid token
        const currentToken = await getCurrentToken();
        if (currentToken) {
          fcmToken.value = currentToken;
          console.log("Using existing FCM token");
          return;
        }

        // Request permission and get new token
        const newToken = await requestPermissionAndSendToken();
        if (newToken) {
          fcmToken.value = newToken;
          console.log("New FCM token obtained and sent to server");
        } else {
          console.log("Failed to obtain FCM token");
        }
      } catch (error) {
        console.error("Error initializing Firebase messaging:", error);
      }
    };

    const handleEnableChange = async () => {
      if (localSettings.value.enabled) {
        // If enabling, ensure we have notification permission and FCM token
        if (notificationPermission.value !== "granted") {
          await requestPermission();
        } else if (!fcmToken.value) {
          await initializeFirebaseMessaging();
        }
      }

      // Save settings after change
      await saveSettings();
    };

    // Method to refresh FCM token
    const refreshFCMToken = async () => {
      console.log("Refreshing FCM token...");
      try {
        const newToken = await refreshToken();
        if (newToken) {
          fcmToken.value = newToken;
          console.log("FCM token refreshed successfully");
        } else {
          console.log("Failed to refresh FCM token");
        }
      } catch (error) {
        console.error("Error refreshing FCM token:", error);
      }
    };

    // Lifecycle
    onMounted(async () => {
      await fetchSettings();

      // Check notification permission on mount
      if ("Notification" in window) {
        Notification.requestPermission().then((permission) => {
          notificationPermission.value = permission;
          store.mutations.setNotificationPermission(store.state, permission);
        });
      }
    });

    // Watch for settings changes
    watch(
      () => store.getters.getSettings(),
      (newSettings) => {
        if (newSettings) {
          localSettings.value = { ...newSettings };
        }
      },
    );

    return {
      localSettings,
      daysOfWeek,
      loading,
      error,
      notificationPermission,
      canReceiveNotifications,
      saveSettings,
      requestPermission,
      handleEnableChange,
      refreshFCMToken,
    };
  },
});
