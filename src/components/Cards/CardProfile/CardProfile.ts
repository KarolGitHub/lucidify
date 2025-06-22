import { defineComponent, ref, onMounted, computed } from "vue";
import userService, { UserProfile } from "@/services/userService";
import { auth } from "@/store";
import { notifications } from "@/store";
import { Toast } from "@/interface/Toast";

export default defineComponent({
  name: "CardProfile",
  setup() {
    const loading = ref(false);
    const userProfile = ref<UserProfile | null>(null);

    // Computed properties
    const lucidDreamPercentage = computed(() => {
      if (
        !userProfile.value ||
        userProfile.value.lucidProgress.totalDreams === 0
      ) {
        return 0;
      }
      return Math.round(
        (userProfile.value.lucidProgress.lucidDreams /
          userProfile.value.lucidProgress.totalDreams) *
          100,
      );
    });

    const experienceLevelColor = computed(() => {
      const level = userProfile.value?.profile?.experienceLevel || "beginner";
      switch (level) {
        case "beginner":
          return "bg-blue-500";
        case "intermediate":
          return "bg-green-500";
        case "advanced":
          return "bg-yellow-500";
        case "expert":
          return "bg-purple-500";
        default:
          return "bg-gray-500";
      }
    });

    const experienceLevelText = computed(() => {
      const level = userProfile.value?.profile?.experienceLevel || "beginner";
      return level.charAt(0).toUpperCase() + level.slice(1);
    });

    const memberSince = computed(() => {
      if (!userProfile.value?.createdAt) return "Unknown";
      return new Date(userProfile.value.createdAt).toLocaleDateString();
    });

    const lastLogin = computed(() => {
      if (!userProfile.value?.lastLogin) return "Never";
      return new Date(userProfile.value.lastLogin).toLocaleDateString();
    });

    // Methods
    const loadUserProfile = async () => {
      try {
        loading.value = true;
        const profile = await userService.getProfile();
        userProfile.value = profile;
      } catch (error: any) {
        console.error("Error loading user profile:", error);
      } finally {
        loading.value = false;
      }
    };

    const exportUserData = async () => {
      try {
        const data = await userService.exportData();
        // Create and download file
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lucidify-data-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error: any) {
        console.error("Error exporting data:", error);
        alert("Failed to export data: " + error.message);
      }
    };

    const deleteAccount = async () => {
      const confirmed = confirm(
        "Are you absolutely sure you want to delete your account?\n\n" +
          "This action will:\n" +
          "• Permanently delete your account\n" +
          "• Delete all your dreams and data\n" +
          "• Remove all your preferences and settings\n" +
          "• This action cannot be undone!\n\n" +
          "Type 'DELETE' to confirm:",
      );

      if (!confirmed) return;

      const confirmation = prompt(
        "Please type 'DELETE' to confirm account deletion:",
      );

      if (confirmation !== "DELETE") {
        alert("Account deletion cancelled. You must type 'DELETE' to confirm.");
        return;
      }

      try {
        // Show loading state
        const toast: Toast = {
          body: "Deleting your account and all data...",
          tittle: "Account Deletion",
          type: "info",
          show: true,
        };
        notifications.actions.presentToast(toast);

        // Delete account from backend
        await userService.deleteAccount();

        // Show success message
        const successToast: Toast = {
          body: "Account deleted successfully. You will be logged out.",
          tittle: "Account Deleted",
          type: "success",
          show: true,
        };
        notifications.actions.presentToast(successToast);

        // Wait a moment for the user to see the success message
        setTimeout(async () => {
          try {
            // Logout from Firebase and clear all auth state
            await auth.actions.logout();
          } catch (error) {
            console.error("Error during logout after account deletion:", error);
            // Force redirect even if logout fails
            window.location.href = "/auth/login";
          }
        }, 2000);
      } catch (error: any) {
        console.error("Error deleting account:", error);

        const errorToast: Toast = {
          body: `Failed to delete account: ${error.message}`,
          tittle: "Deletion Failed",
          type: "error",
          show: true,
        };
        notifications.actions.presentToast(errorToast);
      }
    };

    // Load data on mount
    onMounted(() => {
      loadUserProfile();
    });

    return {
      loading,
      userProfile,
      lucidDreamPercentage,
      experienceLevelColor,
      experienceLevelText,
      memberSince,
      lastLogin,
      exportUserData,
      deleteAccount,
    };
  },
});
