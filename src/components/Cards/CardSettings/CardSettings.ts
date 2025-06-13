import { defineComponent, ref, reactive, onMounted, computed } from "vue";
import userService, { UserProfile, UserSettings } from "@/services/userService";

export default defineComponent({
  name: "CardSettings",
  setup() {
    // Reactive data
    const loading = ref(false);
    const saving = ref(false);
    const error = ref<string | null>(null);
    const success = ref<string | null>(null);

    const userProfile = ref<UserProfile | null>(null);
    const userSettings = ref<UserSettings | null>(null);

    // Form data
    const formData = reactive({
      displayName: "",
      email: "",
      profilePicture: "",
      bio: "",
      experienceLevel: "beginner" as
        | "beginner"
        | "intermediate"
        | "advanced"
        | "expert",
      goals: [] as string[],
      interests: [] as string[],
      theme: "auto" as "light" | "dark" | "auto",
      timezone: "UTC",
      defaultDreamVisibility: "private" as "private" | "public" | "friends",
      notifications: {
        dreamReminders: true,
        lucidDreamTips: true,
        weeklyStats: true,
      },
    });

    // Avatar upload state
    const avatarUploadProgress = ref(0);
    const avatarUploadError = ref<string | null>(null);

    // Computed properties
    const hasChanges = computed(() => {
      if (!userProfile.value || !userSettings.value) return false;

      // Check if goals have actually changed
      const currentGoals = userProfile.value.profile?.goals || [];
      const goalsChanged =
        formData.goals.length !== currentGoals.length ||
        formData.goals.some((goal, index) => goal !== currentGoals[index]) ||
        currentGoals.some((goal, index) => goal !== formData.goals[index]);

      // Check if interests have actually changed
      const currentInterests = userProfile.value.profile?.interests || [];
      const interestsChanged =
        formData.interests.length !== currentInterests.length ||
        formData.interests.some(
          (interest, index) => interest !== currentInterests[index],
        ) ||
        currentInterests.some(
          (interest, index) => interest !== formData.interests[index],
        );

      return (
        formData.displayName !== (userProfile.value.displayName || "") ||
        formData.profilePicture !== (userProfile.value.profilePicture || "") ||
        formData.bio !== (userProfile.value.profile?.bio || "") ||
        formData.experienceLevel !==
          (userProfile.value.profile?.experienceLevel || "beginner") ||
        goalsChanged ||
        interestsChanged ||
        formData.theme !== userSettings.value.theme ||
        formData.timezone !== userSettings.value.timezone ||
        formData.defaultDreamVisibility !==
          userSettings.value.defaultDreamVisibility ||
        formData.notifications.dreamReminders !==
          userSettings.value.notifications.dreamReminders ||
        formData.notifications.lucidDreamTips !==
          userSettings.value.notifications.lucidDreamTips ||
        formData.notifications.weeklyStats !==
          userSettings.value.notifications.weeklyStats
      );
    });

    // Methods
    const loadUserData = async () => {
      try {
        loading.value = true;
        error.value = null;

        const [profile, settings] = await Promise.all([
          userService.getProfile(),
          userService.getSettings(),
        ]);

        userProfile.value = profile;
        userSettings.value = settings;

        // Populate form data
        formData.displayName = profile.displayName || "";
        formData.email = profile.email;
        formData.profilePicture = profile.profilePicture || "";
        formData.bio = profile.profile?.bio || "";
        formData.experienceLevel =
          profile.profile?.experienceLevel || "beginner";
        formData.goals = profile.profile?.goals || [];
        formData.interests = profile.profile?.interests || [];
        formData.theme = settings.theme;
        formData.timezone = settings.timezone;
        formData.defaultDreamVisibility = settings.defaultDreamVisibility;
        formData.notifications = { ...settings.notifications };
      } catch (err: any) {
        error.value = err.message || "Failed to load user data";
        console.error("Error loading user data:", err);
      } finally {
        loading.value = false;
      }
    };

    const saveProfile = async () => {
      try {
        saving.value = true;
        error.value = null;
        success.value = null;

        const updates: any = {};

        // Profile updates
        if (formData.displayName !== (userProfile.value?.displayName || "")) {
          updates.displayName = formData.displayName;
        }

        if (
          formData.profilePicture !== (userProfile.value?.profilePicture || "")
        ) {
          updates.profilePicture = formData.profilePicture;
        }

        if (formData.bio !== (userProfile.value?.profile?.bio || "")) {
          updates.profile = { ...updates.profile, bio: formData.bio };
        }

        if (
          formData.experienceLevel !==
          (userProfile.value?.profile?.experienceLevel || "beginner")
        ) {
          updates.profile = {
            ...updates.profile,
            experienceLevel: formData.experienceLevel,
          };
        }

        // Check if goals have actually changed (compare content, not just length)
        const currentGoals = userProfile.value?.profile?.goals || [];
        const goalsChanged =
          formData.goals.length !== currentGoals.length ||
          formData.goals.some((goal, index) => goal !== currentGoals[index]) ||
          currentGoals.some((goal, index) => goal !== formData.goals[index]);

        if (goalsChanged) {
          updates.profile = { ...updates.profile, goals: formData.goals };
        }

        // Check if interests have actually changed (compare content, not just length)
        const currentInterests = userProfile.value?.profile?.interests || [];
        const interestsChanged =
          formData.interests.length !== currentInterests.length ||
          formData.interests.some(
            (interest, index) => interest !== currentInterests[index],
          ) ||
          currentInterests.some(
            (interest, index) => interest !== formData.interests[index],
          );

        if (interestsChanged) {
          updates.profile = {
            ...updates.profile,
            interests: formData.interests,
          };
        }

        // Settings updates
        const settingsUpdates: any = {};
        if (formData.theme !== userSettings.value?.theme) {
          settingsUpdates.theme = formData.theme;
        }

        if (formData.timezone !== userSettings.value?.timezone) {
          settingsUpdates.timezone = formData.timezone;
        }

        if (
          formData.defaultDreamVisibility !==
          userSettings.value?.defaultDreamVisibility
        ) {
          settingsUpdates.defaultDreamVisibility =
            formData.defaultDreamVisibility;
        }

        const notificationChanges = {
          dreamReminders:
            formData.notifications.dreamReminders !==
            userSettings.value?.notifications.dreamReminders,
          lucidDreamTips:
            formData.notifications.lucidDreamTips !==
            userSettings.value?.notifications.lucidDreamTips,
          weeklyStats:
            formData.notifications.weeklyStats !==
            userSettings.value?.notifications.weeklyStats,
        };

        if (Object.values(notificationChanges).some(Boolean)) {
          settingsUpdates.notifications = formData.notifications;
        }

        // Make API calls
        const promises = [];

        if (Object.keys(updates).length > 0) {
          promises.push(userService.updateProfile(updates));
        }

        if (Object.keys(settingsUpdates).length > 0) {
          promises.push(userService.updateSettings(settingsUpdates));
        }

        if (promises.length > 0) {
          await Promise.all(promises);
          await loadUserData(); // Reload data to get updated values
          success.value = "Settings saved successfully!";

          // Clear success message after 3 seconds
          setTimeout(() => {
            success.value = null;
          }, 3000);
        }
      } catch (err: any) {
        error.value = err.message || "Failed to save settings";
        console.error("Error saving settings:", err);
      } finally {
        saving.value = false;
      }
    };

    const addGoal = () => {
      const goal = prompt("Enter a new goal:");
      if (goal && goal.trim()) {
        formData.goals.push(goal.trim());
      }
    };

    const removeGoal = (index: number) => {
      formData.goals.splice(index, 1);
    };

    const addInterest = () => {
      const interest = prompt("Enter a new interest:");
      if (interest && interest.trim()) {
        formData.interests.push(interest.trim());
      }
    };

    const removeInterest = (index: number) => {
      formData.interests.splice(index, 1);
    };

    const resetForm = () => {
      if (userProfile.value && userSettings.value) {
        formData.displayName = userProfile.value.displayName || "";
        formData.profilePicture = userProfile.value.profilePicture || "";
        formData.bio = userProfile.value.profile?.bio || "";
        formData.experienceLevel =
          userProfile.value.profile?.experienceLevel || "beginner";
        formData.goals = [...(userProfile.value.profile?.goals || [])];
        formData.interests = [...(userProfile.value.profile?.interests || [])];
        formData.theme = userSettings.value.theme;
        formData.timezone = userSettings.value.timezone;
        formData.defaultDreamVisibility =
          userSettings.value.defaultDreamVisibility;
        formData.notifications = { ...userSettings.value.notifications };
      }
    };

    const handleImageError = () => {
      // Clear the invalid image URL
      formData.profilePicture = "";
    };

    // Avatar file upload handler
    const onAvatarFileChange = async (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (!input.files || !input.files[0]) return;
      const file = input.files[0];
      avatarUploadProgress.value = 0;
      avatarUploadError.value = null;
      try {
        const formDataObj = new FormData();
        formDataObj.append("avatar", file);
        // Use fetch for progress tracking
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/users/upload-avatar");
        xhr.withCredentials = true;
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            avatarUploadProgress.value = Math.round((e.loaded / e.total) * 100);
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200) {
            const res = JSON.parse(xhr.responseText);
            if (res.success && res.url) {
              formData.profilePicture = res.url;
              avatarUploadProgress.value = 100;
              avatarUploadError.value = null;
            } else {
              avatarUploadError.value = res.error || "Upload failed";
              avatarUploadProgress.value = 0;
            }
          } else {
            avatarUploadError.value = xhr.statusText || "Upload failed";
            avatarUploadProgress.value = 0;
          }
        };
        xhr.onerror = () => {
          avatarUploadError.value = "Upload failed";
          avatarUploadProgress.value = 0;
        };
        xhr.send(formDataObj);
      } catch (err: any) {
        avatarUploadError.value = err.message || "Upload failed";
        avatarUploadProgress.value = 0;
      }
    };

    // Load data on mount
    onMounted(() => {
      loadUserData();
    });

    return {
      // Reactive data
      loading,
      saving,
      error,
      success,
      formData,
      hasChanges,
      avatarUploadProgress,
      avatarUploadError,

      // Methods
      saveProfile,
      addGoal,
      removeGoal,
      addInterest,
      removeInterest,
      resetForm,
      loadUserData,
      handleImageError,
      onAvatarFileChange,
    };
  },
});
