import apiClient from "./axios/config";

export interface UserProfile {
  firebaseUid: string;
  email: string;
  displayName?: string;
  profilePicture?: string;
  emailVerified: boolean;
  isAdmin: boolean;
  preferences: {
    defaultDreamVisibility: "private" | "public" | "friends";
    notificationSettings: {
      dreamReminders: boolean;
      lucidDreamTips: boolean;
      weeklyStats: boolean;
      realityCheckScheduler: {
        enabled: boolean;
        frequency: string;
        customInterval: number;
        startTime: string;
        endTime: string;
        message: string;
        daysOfWeek: string[];
        timezone: string;
      };
    };
    theme: "light" | "dark" | "auto";
    timezone: string;
  };
  lucidProgress: {
    totalDreams: number;
    lucidDreams: number;
    firstLucidDream?: Date;
    lastLucidDream?: Date;
    currentStreak: number;
    longestStreak: number;
    techniques: Array<{
      name: string;
      lastUsed: Date;
      successRate: number;
    }>;
  };
  profile: {
    bio?: string;
    experienceLevel: "beginner" | "intermediate" | "advanced" | "expert";
    goals: string[];
    interests: string[];
  };
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileRequest {
  displayName?: string;
  preferences?: Partial<UserProfile["preferences"]>;
  profile?: Partial<UserProfile["profile"]>;
}

export interface UserSettings {
  theme: "light" | "dark" | "auto";
  timezone: string;
  defaultDreamVisibility: "private" | "public" | "friends";
  notifications: {
    dreamReminders: boolean;
    lucidDreamTips: boolean;
    weeklyStats: boolean;
  };
}

class UserService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get("/users/profile");
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to get user profile:", error);
      throw new Error(
        error.response?.data?.error || "Failed to get user profile",
      );
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: UpdateUserProfileRequest): Promise<UserProfile> {
    try {
      const response = await apiClient.put("/users/profile", updates);
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to update user profile:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update user profile",
      );
    }
  }

  /**
   * Update user settings
   */
  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const response = await apiClient.put("/users/settings", settings);
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to update user settings:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update user settings",
      );
    }
  }

  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    try {
      const response = await apiClient.get("/users/settings");
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to get user settings:", error);
      throw new Error(
        error.response?.data?.error || "Failed to get user settings",
      );
    }
  }

  /**
   * Update display name
   */
  async updateDisplayName(displayName: string): Promise<UserProfile> {
    try {
      const response = await apiClient.put("/users/profile", { displayName });
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to update display name:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update display name",
      );
    }
  }

  /**
   * Update bio
   */
  async updateBio(bio: string): Promise<UserProfile> {
    try {
      const response = await apiClient.put("/users/profile", {
        profile: { bio },
      });
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to update bio:", error);
      throw new Error(error.response?.data?.error || "Failed to update bio");
    }
  }

  /**
   * Update experience level
   */
  async updateExperienceLevel(
    level: "beginner" | "intermediate" | "advanced" | "expert",
  ): Promise<UserProfile> {
    try {
      const response = await apiClient.put("/users/profile", {
        profile: { experienceLevel: level },
      });
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to update experience level:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update experience level",
      );
    }
  }

  /**
   * Update goals
   */
  async updateGoals(goals: string[]): Promise<UserProfile> {
    try {
      const response = await apiClient.put("/users/profile", {
        profile: { goals },
      });
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to update goals:", error);
      throw new Error(error.response?.data?.error || "Failed to update goals");
    }
  }

  /**
   * Update interests
   */
  async updateInterests(interests: string[]): Promise<UserProfile> {
    try {
      const response = await apiClient.put("/users/profile", {
        profile: { interests },
      });
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to update interests:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update interests",
      );
    }
  }

  /**
   * Update theme preference
   */
  async updateTheme(theme: "light" | "dark" | "auto"): Promise<UserSettings> {
    try {
      const response = await apiClient.put("/users/settings", { theme });
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to update theme:", error);
      throw new Error(error.response?.data?.error || "Failed to update theme");
    }
  }

  /**
   * Update timezone
   */
  async updateTimezone(timezone: string): Promise<UserSettings> {
    try {
      const response = await apiClient.put("/users/settings", { timezone });
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to update timezone:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update timezone",
      );
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(
    notifications: Partial<UserSettings["notifications"]>,
  ): Promise<UserSettings> {
    try {
      const response = await apiClient.put("/users/settings", {
        notifications,
      });
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to update notification settings:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update notification settings",
      );
    }
  }

  /**
   * Update dream visibility preference
   */
  async updateDreamVisibility(
    visibility: "private" | "public" | "friends",
  ): Promise<UserSettings> {
    try {
      const response = await apiClient.put("/users/settings", {
        defaultDreamVisibility: visibility,
      });
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to update dream visibility:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update dream visibility",
      );
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    try {
      // First delete from backend
      await apiClient.delete("/users/account");

      // Then delete Firebase user account
      const { getAuth, deleteUser } = await import("firebase/auth");
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        try {
          await deleteUser(user);
          console.log("Firebase user account deleted successfully");
        } catch (firebaseError: any) {
          console.warn(
            "Failed to delete Firebase user account:",
            firebaseError,
          );
          // This might fail if user needs to re-authenticate, but that's okay
          // The backend data is already deleted
        }
      }
    } catch (error: any) {
      console.error("Failed to delete account:", error);
      throw new Error(
        error.response?.data?.error || "Failed to delete account",
      );
    }
  }

  /**
   * Export user data
   */
  async exportData(): Promise<any> {
    try {
      const response = await apiClient.get("/users/export");
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to export user data:", error);
      throw new Error(
        error.response?.data?.error || "Failed to export user data",
      );
    }
  }
}

export default new UserService();
