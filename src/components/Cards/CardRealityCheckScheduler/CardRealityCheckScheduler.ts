import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { realityCheckScheduler } from "@/store";
import { RealityCheckScheduler } from "@/interface/RealityCheckScheduler";

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
      await store.actions.fetchSettings();
      // Update local settings with fetched data
      const settings = store.getters.getSettings();
      if (settings) {
        localSettings.value = { ...settings };
      }
    };

    const saveSettings = async () => {
      try {
        await store.actions.updateSettings(localSettings.value);

        // If settings are enabled and we don't have a valid FCM token, try to refresh it
        if (
          localSettings.value.enabled &&
          !fcmToken.value &&
          notificationPermission.value === "granted"
        ) {
          console.log(
            "Settings enabled but no FCM token found, attempting to refresh...",
          );
          await refreshFCMToken();
        }
      } catch (error: any) {
        // If the error is related to invalid FCM token, try to refresh it
        if (
          error.response?.data?.message?.includes("token") ||
          error.response?.data?.message?.includes("notification")
        ) {
          console.log(
            "Token-related error detected, attempting to refresh FCM token...",
          );
          await refreshFCMToken();
          // Try saving settings again after token refresh
          try {
            await store.actions.updateSettings(localSettings.value);
          } catch (retryError) {
            console.error(
              "Error saving settings after token refresh:",
              retryError,
            );
          }
        }
      }
    };

    const requestPermission = async () => {
      const granted = await store.actions.requestNotificationPermission();
      if (granted) {
        // Update local notification permission
        notificationPermission.value = "granted";
        // Initialize Firebase messaging and get FCM token
        await initializeFirebaseMessaging();
      }
    };

    const handleEnableChange = async () => {
      if (
        localSettings.value.enabled &&
        notificationPermission.value !== "granted"
      ) {
        await requestPermission();
      }
    };

    const initializeFirebaseMessaging = async () => {
      try {
        // Use the already-initialized Firebase messaging from firebase.ts
        const { messaging } = await import("@/server/firebase/firebase");
        const { getToken } = await import("firebase/messaging");
        const { firebaseConfig } = await import("@/config");

        // Get FCM token using the existing messaging instance
        const token = await getToken(messaging, {
          vapidKey: firebaseConfig.vapidKey,
        });

        if (token) {
          await store.actions.storeFCMToken(token);
          // Update local FCM token
          fcmToken.value = token;
          console.log("FCM token stored successfully");
        } else {
          // Clear local FCM token if no token is available
          fcmToken.value = null;
          console.log("No FCM token available");
        }
      } catch (error) {
        console.error("Error getting FCM token:", error);
        // Clear local FCM token on error
        fcmToken.value = null;

        // If it's a token-related error, try to remove the invalid token
        if (error && typeof error === "object" && "code" in error) {
          const errorCode = (error as any).code;
          if (
            errorCode === "messaging/registration-token-not-registered" ||
            errorCode === "messaging/invalid-registration-token"
          ) {
            try {
              await store.actions.removeFCMToken();
              console.log("Invalid FCM token removed from backend");
            } catch (removeError) {
              console.error("Error removing invalid FCM token:", removeError);
            }
          }
        }
      }
    };

    // Method to refresh FCM token
    const refreshFCMToken = async () => {
      console.log("Refreshing FCM token...");
      await initializeFirebaseMessaging();
    };

    // Lifecycle
    onMounted(async () => {
      await fetchSettings();

      // Check notification permission on mount
      if ("Notification" in window) {
        notificationPermission.value = Notification.permission;
        store.mutations.setNotificationPermission(
          store.state,
          Notification.permission,
        );

        // If user has already granted permission, initialize Firebase messaging
        if (Notification.permission === "granted") {
          await initializeFirebaseMessaging();
        }
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
