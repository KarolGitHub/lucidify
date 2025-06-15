import { Dream, DreamStats } from "@/interface/Dream";
import apiClient from "./axios/config";

class DreamService {
  async getDreams(userId: string): Promise<Dream[]> {
    try {
      const response = await apiClient.get(`dreams?userId=${userId}`);
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching dreams:", error);
      throw error;
    }
  }

  async createDream(
    dreamData: Omit<Dream, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Dream> {
    try {
      const response = await apiClient.post("dreams", dreamData);
      return response.data.data;
    } catch (error) {
      console.error("Error creating dream:", error);
      throw error;
    }
  }

  async updateDream(
    dreamId: string,
    dreamData: Partial<Dream>,
  ): Promise<Dream> {
    try {
      const response = await apiClient.put(`dreams/${dreamId}`, dreamData);
      return response.data.data;
    } catch (error) {
      console.error("Error updating dream:", error);
      throw error;
    }
  }

  async deleteDream(dreamId: string): Promise<void> {
    try {
      await apiClient.delete(`dreams/${dreamId}`);
    } catch (error) {
      console.error("Error deleting dream:", error);
      throw error;
    }
  }

  async getDreamStats(userId: string): Promise<DreamStats> {
    try {
      const response = await apiClient.get(
        `dreams/stats/user?userId=${userId}`,
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching dream stats:", error);
      throw error;
    }
  }

  async searchDreams(filters: any): Promise<Dream[]> {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await apiClient.get(
        `dreams/search/advanced?${queryParams}`,
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Error searching dreams:", error);
      throw error;
    }
  }
}

export default new DreamService();
