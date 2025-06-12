import { realityCheckSchedulerService } from "@/services/realityCheckScheduler";
import { RealityCheckScheduler } from "@/interface/RealityCheckScheduler";
import mutations from "./mutations";
import { notifications } from "@/store";
import state from "./state";

export default {
  async fetchSettings(): Promise<void> {
    try {
      mutations.setLoading(state, true);
      mutations.setError(state, null);

      const response = await realityCheckSchedulerService.getSettings();
      mutations.setSettings(state, response.realityCheckScheduler);
    } catch (error: any) {
      mutations.setError(
        state,
        error.response?.data?.message || "Failed to fetch settings",
      );
      console.error("Error fetching reality check settings:", error);
    } finally {
      mutations.setLoading(state, false);
    }
  },

  async updateSettings(
    settings: Partial<RealityCheckScheduler>,
  ): Promise<void> {
    try {
      mutations.setLoading(state, true);
      mutations.setError(state, null);

      const response =
        await realityCheckSchedulerService.updateSettings(settings);
      mutations.setSettings(state, response.realityCheckScheduler);

      // Show success notification
      notifications.actions.presentToast({
        show: true,
        type: "success",
        tittle: "Success",
        body: "Reality check settings updated successfully",
      });
    } catch (error: any) {
      mutations.setError(
        state,
        error.response?.data?.message || "Failed to update settings",
      );
      console.error("Error updating reality check settings:", error);

      // Show error notification
      notifications.actions.presentToast({
        show: true,
        type: "error",
        tittle: "Error",
        body: error.response?.data?.message || "Failed to update settings",
      });
    } finally {
      mutations.setLoading(state, false);
    }
  },

  async storeFCMToken(token: string): Promise<void> {
    try {
      await realityCheckSchedulerService.storeFCMToken(token);
      mutations.setFCMToken(state, token);
    } catch (error: any) {
      console.error("Error storing FCM token:", error);
    }
  },

  async removeFCMToken(): Promise<void> {
    try {
      await realityCheckSchedulerService.removeFCMToken();
      mutations.setFCMToken(state, null);
    } catch (error: any) {
      console.error("Error removing FCM token:", error);
    }
  },

  async requestNotificationPermission(): Promise<boolean> {
    try {
      if (!("Notification" in window)) {
        throw new Error("This browser does not support notifications");
      }

      const permission = await Notification.requestPermission();
      mutations.setNotificationPermission(state, permission);

      if (permission === "granted") {
        notifications.actions.presentToast({
          show: true,
          type: "success",
          tittle: "Success",
          body: "Notification permission granted!",
        });
        return true;
      } else {
        notifications.actions.presentToast({
          show: true,
          type: "warning",
          tittle: "Permission Required",
          body: "Please enable notifications to use reality check reminders",
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error requesting notification permission:", error);
      notifications.actions.presentToast({
        show: true,
        type: "error",
        tittle: "Error",
        body: "Failed to request notification permission",
      });
      return false;
    }
  },
};
