import { RealityCheckScheduler } from "@/interface/RealityCheckScheduler";

export default {
  setSettings(state: any, settings: RealityCheckScheduler): void {
    state.settings = settings;
  },

  setLoading(state: any, loading: boolean): void {
    state.loading = loading;
  },

  setError(state: any, error: string | null): void {
    state.error = error;
  },

  setFCMToken(state: any, token: string | null): void {
    state.fcmToken = token;
  },

  setNotificationPermission(
    state: any,
    permission: NotificationPermission,
  ): void {
    state.notificationPermission = permission;
  },

  updateSettings(
    state: any,
    partialSettings: Partial<RealityCheckScheduler>,
  ): void {
    state.settings = { ...state.settings, ...partialSettings };
  },
};
