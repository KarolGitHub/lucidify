import apiClient from "./axios/config";

class NotificationService {
  async getCustomNotifications(): Promise<any[]> {
    try {
      const res = await apiClient.get("/notifications");
      return res.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  async addCustomNotification(data: any): Promise<any> {
    try {
      const res = await apiClient.post("/notifications", data);
      return res.data;
    } catch (error) {
      console.error("Error adding notification:", error);
      throw error;
    }
  }

  async updateCustomNotification(id: string, data: any): Promise<any> {
    try {
      const res = await apiClient.put(`/notifications/${id}`, data);
      return res.data;
    } catch (error) {
      console.error("Error updating notification:", error);
      throw error;
    }
  }

  async deleteCustomNotification(id: string): Promise<any> {
    try {
      const res = await apiClient.delete(`/notifications/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }
}

export default new NotificationService();
