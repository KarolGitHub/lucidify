import { Dream, DreamStats } from "@/interface/Dream";
import authService from "./auth";
import { AuthErrorHandler } from "@/utils/authErrorHandler";

class DreamService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await authService.getAuthToken();
    if (!token) {
      // Auto logout when no token is available
      await AuthErrorHandler.handleAuthError(
        "No authentication token available",
      );
      throw new Error("No authentication token available");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getDreams(userId: string): Promise<Dream[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.apiBaseUrl}/api/dreams?userId=${userId}`,
        {
          method: "GET",
          headers,
        },
      );

      if (!response.ok) {
        await AuthErrorHandler.handleApiError(
          response,
          "Failed to fetch dreams",
        );
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching dreams:", error);
      throw error;
    }
  }

  async createDream(
    dreamData: Omit<Dream, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Dream> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.apiBaseUrl}/api/dreams`, {
        method: "POST",
        headers,
        body: JSON.stringify(dreamData),
      });

      if (!response.ok) {
        await AuthErrorHandler.handleApiError(
          response,
          "Failed to create dream",
        );
      }

      const result = await response.json();
      return result.data;
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
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.apiBaseUrl}/api/dreams/${dreamId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(dreamData),
      });

      if (!response.ok) {
        await AuthErrorHandler.handleApiError(
          response,
          "Failed to update dream",
        );
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error updating dream:", error);
      throw error;
    }
  }

  async deleteDream(dreamId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.apiBaseUrl}/api/dreams/${dreamId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        await AuthErrorHandler.handleApiError(
          response,
          "Failed to delete dream",
        );
      }
    } catch (error) {
      console.error("Error deleting dream:", error);
      throw error;
    }
  }

  async getDreamStats(userId: string): Promise<DreamStats> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.apiBaseUrl}/api/dreams/stats/user?userId=${userId}`,
        {
          method: "GET",
          headers,
        },
      );

      if (!response.ok) {
        await AuthErrorHandler.handleApiError(
          response,
          "Failed to fetch dream stats",
        );
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching dream stats:", error);
      throw error;
    }
  }

  async searchDreams(filters: any): Promise<Dream[]> {
    try {
      const headers = await this.getAuthHeaders();
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(
        `${this.apiBaseUrl}/api/dreams/search/advanced?${queryParams}`,
        {
          method: "GET",
          headers,
        },
      );

      if (!response.ok) {
        await AuthErrorHandler.handleApiError(
          response,
          "Failed to search dreams",
        );
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error searching dreams:", error);
      throw error;
    }
  }
}

export default new DreamService();
