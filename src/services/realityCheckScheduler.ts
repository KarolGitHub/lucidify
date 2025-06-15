import {
  RealityCheckScheduler,
  RealityCheckSchedulerResponse,
  FCMTokenRequest,
  FCMTokenResponse,
} from "@/interface/RealityCheckScheduler";
import apiClient from "./axios/config";

export const realityCheckSchedulerService = {
  // Get reality check scheduler settings
  async getSettings(): Promise<RealityCheckSchedulerResponse> {
    const response = await apiClient.get("users/reality-check-scheduler");
    return response.data;
  },

  // Update reality check scheduler settings
  async updateSettings(
    settings: Partial<RealityCheckScheduler>,
  ): Promise<RealityCheckSchedulerResponse> {
    const response = await apiClient.put(
      "users/reality-check-scheduler",
      settings,
    );
    return response.data;
  },

  // Store FCM token
  async storeFCMToken(token: string): Promise<FCMTokenResponse> {
    const response = await apiClient.post("users/fcm-token", { token });
    return response.data;
  },

  // Remove FCM token
  async removeFCMToken(): Promise<FCMTokenResponse> {
    const response = await apiClient.delete("users/fcm-token");
    return response.data;
  },
};
