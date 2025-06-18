import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import UserManagement from "../UserManagement/UserManagement.vue";
import { auth } from "@/store";
import { User } from "@/interface/User";

// Mock the auth store
vi.mock("@/store", () => ({
  auth: {
    getters: {
      getUser: () => ({
        firebaseUid: "test-user-123",
        email: "test@example.com",
        displayName: "Test User",
        preferences: {
          defaultDreamVisibility: "private",
          notificationSettings: {
            dreamReminders: true,
            lucidDreamTips: true,
            weeklyStats: true,
          },
          theme: "light",
          timezone: "UTC",
        },
        profile: {
          bio: "Test bio",
          experienceLevel: "beginner",
          goals: ["Lucid dreaming"],
          interests: ["Dream analysis"],
        },
      }),
      isLogged: () => true,
    },
    actions: {
      updateUser: vi.fn(),
      updatePreferences: vi.fn(),
      updateProfile: vi.fn(),
      logout: vi.fn(),
    },
  },
}));

describe("UserManagement", () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(UserManagement);
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("renders user information correctly", () => {
      expect(wrapper.find("[data-test='user-email']").text()).toBe(
        "test@example.com",
      );
      expect(wrapper.find("[data-test='user-name']").text()).toBe("Test User");
    });

    it("loads user preferences", () => {
      expect(wrapper.vm.preferences.defaultDreamVisibility).toBe("private");
      expect(wrapper.vm.preferences.notificationSettings.dreamReminders).toBe(
        true,
      );
    });

    it("loads user profile", () => {
      expect(wrapper.vm.profile.bio).toBe("Test bio");
      expect(wrapper.vm.profile.experienceLevel).toBe("beginner");
    });
  });

  describe("Profile Updates", () => {
    it("updates user profile successfully", async () => {
      const updatedProfile = {
        bio: "Updated bio",
        experienceLevel: "intermediate",
        goals: ["Lucid dreaming", "Dream control"],
        interests: ["Dream analysis", "Meditation"],
      };

      vi.mocked(auth.actions.updateProfile).mockResolvedValueOnce(
        updatedProfile,
      );

      await wrapper.vm.updateProfile(updatedProfile);

      expect(auth.actions.updateProfile).toHaveBeenCalledWith(updatedProfile);
      expect(wrapper.vm.profile).toEqual(updatedProfile);
      expect(wrapper.vm.successMessage).toBe("Profile updated successfully");
    });

    it("handles profile update errors", async () => {
      vi.mocked(auth.actions.updateProfile).mockRejectedValueOnce(
        new Error("Update failed"),
      );

      await wrapper.vm.updateProfile({ bio: "New bio" });

      expect(wrapper.vm.errorMessage).toBe("Failed to update profile");
    });
  });

  describe("Preferences Updates", () => {
    it("updates user preferences successfully", async () => {
      const updatedPreferences = {
        defaultDreamVisibility: "public",
        notificationSettings: {
          dreamReminders: false,
          lucidDreamTips: true,
          weeklyStats: true,
        },
        theme: "dark",
        timezone: "EST",
      };

      vi.mocked(auth.actions.updatePreferences).mockResolvedValueOnce(
        updatedPreferences,
      );

      await wrapper.vm.updatePreferences(updatedPreferences);

      expect(auth.actions.updatePreferences).toHaveBeenCalledWith(
        updatedPreferences,
      );
      expect(wrapper.vm.preferences).toEqual(updatedPreferences);
      expect(wrapper.vm.successMessage).toBe(
        "Preferences updated successfully",
      );
    });

    it("handles preferences update errors", async () => {
      vi.mocked(auth.actions.updatePreferences).mockRejectedValueOnce(
        new Error("Update failed"),
      );

      await wrapper.vm.updatePreferences({ theme: "dark" });

      expect(wrapper.vm.errorMessage).toBe("Failed to update preferences");
    });
  });

  describe("Account Management", () => {
    it("logs out user successfully", async () => {
      vi.mocked(auth.actions.logout).mockResolvedValueOnce();

      await wrapper.vm.handleLogout();

      expect(auth.actions.logout).toHaveBeenCalled();
      expect(wrapper.emitted("logout-success")).toBeTruthy();
    });

    it("handles logout errors", async () => {
      vi.mocked(auth.actions.logout).mockRejectedValueOnce(
        new Error("Logout failed"),
      );

      await wrapper.vm.handleLogout();

      expect(wrapper.vm.errorMessage).toBe("Failed to log out");
    });
  });

  describe("Form Validation", () => {
    it("validates profile form correctly", async () => {
      const invalidProfile = {
        bio: "", // Empty bio should fail
        experienceLevel: "invalid-level", // Invalid level should fail
        goals: [], // Empty goals should fail
        interests: [], // Empty interests should fail
      };

      await wrapper.vm.updateProfile(invalidProfile);

      expect(wrapper.vm.errorMessage).toBe(
        "Please fill in all required fields",
      );
      expect(auth.actions.updateProfile).not.toHaveBeenCalled();
    });

    it("validates preferences form correctly", async () => {
      const invalidPreferences = {
        defaultDreamVisibility: "invalid-visibility",
        notificationSettings: {
          dreamReminders: "invalid-value", // Should be boolean
          lucidDreamTips: true,
          weeklyStats: true,
        },
        theme: "invalid-theme",
        timezone: "", // Empty timezone should fail
      };

      await wrapper.vm.updatePreferences(invalidPreferences);

      expect(wrapper.vm.errorMessage).toBe("Invalid preferences values");
      expect(auth.actions.updatePreferences).not.toHaveBeenCalled();
    });
  });
});
