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
      await store.actions.updateSettings(localSettings.value);
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
        }
      } catch (error) {
        console.error("Error getting FCM token:", error);
      }
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
    };
  },
});
