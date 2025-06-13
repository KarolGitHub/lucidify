import { defineComponent, ref, onMounted } from "vue";
import { createPopper } from "@popperjs/core";
import { auth } from "@/store";
import userService, { UserProfile } from "@/services/userService";

export default defineComponent({
  name: "UserDropdown",
  setup() {
    const dropdownPopoverShow = ref(false);
    const userProfile = ref<UserProfile | null>(null);
    const loading = ref(false);
    const btnDropdownRef = ref<HTMLElement | null>(null);
    const popoverDropdownRef = ref<HTMLElement | null>(null);

    const loadUserProfile = async () => {
      try {
        loading.value = true;
        userProfile.value = await userService.getProfile();
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        loading.value = false;
      }
    };

    const toggleDropdown = (event: Event) => {
      event.preventDefault();
      if (dropdownPopoverShow.value) {
        dropdownPopoverShow.value = false;
      } else {
        dropdownPopoverShow.value = true;
        if (btnDropdownRef.value && popoverDropdownRef.value) {
          createPopper(btnDropdownRef.value, popoverDropdownRef.value, {
            placement: "bottom-start",
          });
        }
      }
    };

    const logout = () => {
      auth.actions.logout();
    };

    onMounted(() => {
      loadUserProfile();
    });

    return {
      dropdownPopoverShow,
      userProfile,
      loading,
      btnDropdownRef,
      popoverDropdownRef,
      toggleDropdown,
      logout,
    };
  },
});
