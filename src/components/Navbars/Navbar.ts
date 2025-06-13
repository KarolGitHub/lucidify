import { defineComponent, ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import UserDropdown from "@/components/Dropdowns/UserDropdown/UserDropdown.vue";
import {
  searchRoutes,
  RouteMeta,
  getAuthenticatedRoutes,
  getPublicRoutes,
} from "@/router/routesMeta";
import { auth } from "@/store";

export default defineComponent({
  name: "Navbar",
  components: {
    UserDropdown,
  },
  setup() {
    const router = useRouter();

    // Reactive state
    const searchQuery = ref("");
    const showSuggestions = ref(false);
    const selectedIndex = ref(-1);
    const searchInputRef = ref<HTMLInputElement | null>(null);

    // Computed properties
    const isAuthenticated = computed(() => auth.getters.isLogged());

    const availableRoutes = computed(() => {
      if (isAuthenticated.value) {
        // Show all routes for authenticated users
        return searchRoutes(searchQuery.value);
      } else {
        // Show only public routes for non-authenticated users
        const publicRoutes = getPublicRoutes();
        if (!searchQuery.value.trim()) return publicRoutes;

        return publicRoutes.filter((route) => {
          const searchTerm = searchQuery.value.toLowerCase();
          return (
            route.name.toLowerCase().includes(searchTerm) ||
            route.description?.toLowerCase().includes(searchTerm) ||
            route.path.toLowerCase().includes(searchTerm) ||
            route.category?.toLowerCase().includes(searchTerm)
          );
        });
      }
    });

    const filteredRoutes = computed(() => availableRoutes.value);

    // Methods
    const handleSearchInput = () => {
      selectedIndex.value = -1;
      showSuggestions.value = true;
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (!showSuggestions.value || filteredRoutes.value.length === 0) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          selectedIndex.value = Math.min(
            selectedIndex.value + 1,
            filteredRoutes.value.length - 1,
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
          break;
        case "Enter":
          event.preventDefault();
          if (selectedIndex.value >= 0) {
            selectRoute(filteredRoutes.value[selectedIndex.value]);
          } else if (filteredRoutes.value.length === 1) {
            selectRoute(filteredRoutes.value[0]);
          }
          break;
        case "Escape":
          event.preventDefault();
          hideSuggestions();
          break;
      }
    };

    const handleBlur = () => {
      // Delay hiding suggestions to allow for clicks
      setTimeout(() => {
        showSuggestions.value = false;
        selectedIndex.value = -1;
      }, 150);
    };

    const selectRoute = (route: RouteMeta) => {
      searchQuery.value = "";
      showSuggestions.value = false;
      selectedIndex.value = -1;

      // Navigate to the selected route
      router.push(route.path);
    };

    const hideSuggestions = () => {
      showSuggestions.value = false;
      selectedIndex.value = -1;
    };

    const clearSearch = () => {
      searchQuery.value = "";
      showSuggestions.value = false;
      selectedIndex.value = -1;
    };

    // Keyboard shortcuts
    const handleGlobalKeydown = (event: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux) to focus search
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        if (searchInputRef.value) {
          searchInputRef.value.focus();
        }
      }
    };

    // Lifecycle
    onMounted(() => {
      document.addEventListener("keydown", handleGlobalKeydown);
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handleGlobalKeydown);
    });

    return {
      // Reactive data
      searchQuery,
      showSuggestions,
      selectedIndex,
      searchInputRef,

      // Computed
      filteredRoutes,
      isAuthenticated,

      // Methods
      handleSearchInput,
      handleKeydown,
      handleBlur,
      selectRoute,
      hideSuggestions,
      clearSearch,
    };
  },
});
