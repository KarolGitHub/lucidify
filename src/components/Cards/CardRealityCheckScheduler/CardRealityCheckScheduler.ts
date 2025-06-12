import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { realityCheckScheduler } from "@/store";
import { RealityCheckScheduler } from "@/interface/RealityCheckScheduler";

export default defineComponent({
  name: "CardRealityCheckScheduler",
  setup() {
    const store = realityCheckScheduler;

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
    const notificationPermission = computed(() =>
      store.getters.getNotificationPermission(),
    );
    const canReceiveNotifications = computed(() =>
      store.getters.canReceiveNotifications(),
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
        // Check if Firebase messaging is available
        if ("serviceWorker" in navigator && "firebase" in window) {
          const { initializeApp } = await import("firebase/app");
          const { getMessaging, getToken, onMessage } = await import(
            "firebase/messaging"
          );
          const { firebaseConfig } = await import("@/config");

          // Initialize Firebase
          const app = initializeApp(firebaseConfig);
          const messaging = getMessaging(app);

          // Get FCM token
          const token = await getToken(messaging, {
            vapidKey: firebaseConfig.vapidKey,
          });

          if (token) {
            await store.actions.storeFCMToken(token);
          }

          // Handle foreground messages
          onMessage(messaging, (payload) => {
            console.log("Message received in foreground:", payload);
            // You can show a custom notification here
          });
        }
      } catch (error) {
        console.error("Error initializing Firebase messaging:", error);
      }
    };

    // Lifecycle
    onMounted(async () => {
      await fetchSettings();

      // Check notification permission on mount
      if ("Notification" in window) {
        store.mutations.setNotificationPermission(
          store.state,
          Notification.permission,
        );
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
