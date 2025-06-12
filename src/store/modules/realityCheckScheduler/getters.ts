import state from "./state";

const getters = {
  getSettings: () => state.settings,
  getLoading: () => state.loading,
  getError: () => state.error,
  getFCMToken: () => state.fcmToken,
  getNotificationPermission: () => state.notificationPermission,
  isEnabled: () => state.settings.enabled,
  canReceiveNotifications: () =>
    state.settings.enabled &&
    state.notificationPermission === "granted" &&
    state.fcmToken !== null,
};

export default getters;
