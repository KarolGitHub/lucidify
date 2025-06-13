import { defineComponent, ref, onMounted } from "vue";
import userService, { UserProfile } from "@/services/userService";

export default defineComponent({
  setup() {
    const isActiveMenuUser = ref(false);
    const userProfile = ref<UserProfile | null>(null);
    const loading = ref(false);

    const changeStatusMenu = () =>
      (isActiveMenuUser.value = !isActiveMenuUser.value);

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

    onMounted(() => {
      loadUserProfile();
    });

    return {
      isActiveMenuUser,
      changeStatusMenu,
      userProfile,
      loading,
    };
  },
});

// export default class HeaderNavbar extends Vue {
// }
