import { defineComponent, computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useDebounce, useBreakpoints, useKeyboardShortcut } from "@vueuse/core";
import { auth, dreams } from "@/store";
import { Dream } from "@/interface/Dream";
import VoiceToText from "@/components/VoiceToText";
import AIDreamAnalysis from "@/components/AIDreamAnalysis";
import DreamList from "@/components/DreamList/DreamList.vue";

// Extended Dream interface for editing
interface EditingDream extends Dream {
  tagsInput: string;
}

export default defineComponent({
  name: "DreamJournal",
  components: {
    VoiceToText,
    AIDreamAnalysis,
    DreamList,
  },
  setup() {
    const route = useRoute();
    const searchInputRef = ref<HTMLInputElement | null>(null);

    // Breakpoints for responsive design
    const breakpoints = useBreakpoints({
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    });

    const isMobile = computed(() => breakpoints.smaller("md").value);
    const isTablet = computed(() => breakpoints.between("md", "lg").value);
    const isDesktop = computed(() => breakpoints.greater("lg").value);

    // Keyboard shortcuts
    useKeyboardShortcut(["ctrl", "n"], () => {
      openNewDreamModal();
    });

    useKeyboardShortcut(["ctrl", "f"], () => {
      searchInputRef.value?.focus();
    });

    useKeyboardShortcut(["escape"], () => {
      if (showNewDreamModal.value) {
        closeNewDreamModal();
      } else if (showEditModal.value) {
        closeEditModal();
      }
    });

    // Reactive data
    const emotions = ref([
      "Joy",
      "Fear",
      "Sadness",
      "Anger",
      "Surprise",
      "Disgust",
      "Love",
      "Confusion",
      "Excitement",
      "Anxiety",
      "Peace",
      "Wonder",
    ]);

    const themes = ref([
      "Flying",
      "Being Chased",
      "Falling",
      "Water",
      "Family",
      "Work",
      "School",
      "Travel",
      "Home",
      "Nature",
      "Technology",
      "Animals",
      "Death",
      "Birth",
      "Transformation",
      "Journey",
      "Conflict",
      "Love",
      "Loss",
      "Discovery",
      "Escape",
      "Return",
      "Search",
      "Meeting",
      "Separation",
      "Reunion",
      "Power",
      "Helplessness",
      "Freedom",
      "Confinement",
      "Success",
      "Failure",
      "Growth",
      "Decay",
      "Light",
      "Darkness",
      "Music",
      "Silence",
      "Speed",
      "Slowness",
      "Size Changes",
      "Time Distortion",
      "Reality Shifts",
      "Other",
    ]);

    const symbols = ref([
      "Snake",
      "House",
      "Car",
      "Mirror",
      "Stairs",
      "Door",
      "Window",
      "Tree",
      "Ocean",
      "Mountain",
      "Bridge",
      "Road",
      "Key",
      "Clock",
      "Book",
      "Phone",
      "Computer",
      "Money",
      "Jewelry",
      "Clothing",
      "Food",
      "Fire",
      "Water",
      "Earth",
      "Air",
      "Sun",
      "Moon",
      "Stars",
      "Clouds",
      "Rain",
      "Snow",
      "Wind",
      "Lightning",
      "Thunder",
      "Bird",
      "Fish",
      "Cat",
      "Dog",
      "Horse",
      "Spider",
      "Butterfly",
      "Dragon",
      "Angel",
      "Demon",
      "Ghost",
      "Child",
      "Old Person",
      "Stranger",
      "Family Member",
      "Friend",
      "Teacher",
      "Doctor",
      "Police",
      "Soldier",
      "Artist",
      "Musician",
      "Writer",
      "Scientist",
      "Wizard",
      "King",
      "Queen",
      "Princess",
      "Prince",
      "Knight",
      "Villain",
      "Hero",
      "Other",
    ]);

    // State for editing
    const editingDream = ref<EditingDream | null>(null);
    const showEditModal = ref(false);
    const showDeleteConfirm = ref(false);
    const dreamToDelete = ref<string | null>(null);
    const highlightedDreamId = ref<string | null>(null);

    // Computed properties
    const filteredDreams = computed(() => dreams.getters.getFilteredDreams());
    const stats = computed(() => dreams.getters.getStats());
    const newDream = computed(() => dreams.getters.getNewDream());
    const filters = computed(() => dreams.getters.getFilters());
    const showNewDreamModal = computed(() =>
      dreams.getters.getShowNewDreamModal(),
    );
    const isLoading = computed(() => dreams.getters.getDreams().length === 0);

    // Debounced search
    const searchQuery = ref("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Helper function to convert ISO date to YYYY-MM-DD format for HTML date input
    const formatDateForInput = (dateString: string): string => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // +1 because months are 0-indexed
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Methods
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const viewDream = (dream: Dream) => {
      // For now, open edit modal to view dream details
      // In the future, this could navigate to a dedicated dream detail page
      editingDream.value = {
        ...dream,
        date: formatDateForInput(dream.date),
        tagsInput: dream.tags.join(", "),
      };
      showEditModal.value = true;
    };

    const handleQueryParameters = () => {
      const viewDreamId = route.query.view as string;
      const highlight = route.query.highlight as string;

      if (viewDreamId && filteredDreams.value.length > 0) {
        const dreamToView = filteredDreams.value.find(
          (dream) => dream._id === viewDreamId,
        );
        if (dreamToView) {
          // Open the dream in edit modal
          viewDream(dreamToView);

          // Set highlight for visual indication
          if (highlight) {
            highlightedDreamId.value = viewDreamId;
            // Clear highlight after a few seconds
            setTimeout(() => {
              highlightedDreamId.value = null;
            }, 3000);
          }
        }
      }
    };

    const handleSaveDream = async () => {
      await dreams.actions.saveDream();
    };

    const handleUpdateDream = async () => {
      if (!editingDream.value) return;

      // Process tags
      const tags = editingDream.value.tagsInput
        ? editingDream.value.tagsInput
            .split(",")
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag.length > 0)
        : editingDream.value.tags;

      // Convert date from YYYY-MM-DD to ISO format for backend
      const dateForBackend = editingDream.value.date
        ? new Date(editingDream.value.date).toISOString()
        : editingDream.value.date;

      const dreamData: Partial<Dream> = {
        title: editingDream.value.title,
        description: editingDream.value.description,
        date: dateForBackend,
        isLucid: editingDream.value.isLucid,
        isVivid: editingDream.value.isVivid,
        isRecurring: editingDream.value.isRecurring,
        isNightmare: editingDream.value.isNightmare,
        tags,
        emotions: editingDream.value.emotions,
        themes: editingDream.value.themes,
        symbols: editingDream.value.symbols,
      };

      if (editingDream.value._id) {
        await dreams.actions.updateDream(editingDream.value._id, dreamData);
        closeEditModal();
      }
    };

    const handleDeleteDream = async (dreamId: string) => {
      dreamToDelete.value = dreamId;
      showDeleteConfirm.value = true;
    };

    const confirmDeleteDream = async () => {
      if (dreamToDelete.value) {
        await dreams.actions.deleteDream(dreamToDelete.value);
        dreamToDelete.value = null;
        showDeleteConfirm.value = false;
      }
    };

    const cancelDeleteDream = () => {
      dreamToDelete.value = null;
      showDeleteConfirm.value = false;
    };

    const handleSearchChange = (searchQuery: string) => {
      dreams.actions.setFilters({ searchQuery });
      // Trigger search if there's a query
      if (searchQuery.trim()) {
        dreams.actions.searchDreams({ searchQuery });
      }
    };

    const handleFilterChange = (selectedFilter: string) => {
      dreams.actions.setFilters({ selectedFilter: selectedFilter as any });
      // Trigger search with new filter
      dreams.actions.searchDreams({ selectedFilter: selectedFilter as any });
    };

    const handleNewDreamChange = (field: string, value: any) => {
      dreams.actions.setNewDream({ [field]: value });
    };

    const handleEditDreamChange = (field: string, value: any) => {
      if (editingDream.value) {
        editingDream.value = { ...editingDream.value, [field]: value };
      }
    };

    const openNewDreamModal = () => {
      dreams.actions.setShowNewDreamModal(true);
    };

    const closeNewDreamModal = () => {
      dreams.actions.setShowNewDreamModal(false);
      dreams.actions.resetNewDream();
    };

    const openEditModal = (dream: Dream) => {
      editingDream.value = {
        ...dream,
        date: formatDateForInput(dream.date),
        tagsInput: dream.tags.join(", "),
      };
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      editingDream.value = null;
      showEditModal.value = false;
    };

    const resetNewDreamForm = () => {
      dreams.actions.resetNewDream();
    };

    const handleAISuggestionsApplied = (suggestion: any) => {
      console.log("AI suggestion applied:", suggestion);
      // You can add additional logic here, such as showing a notification
      // or tracking analytics for AI feature usage
    };

    // Watch for route changes to handle query parameters
    watch(() => route.query, handleQueryParameters, { immediate: true });

    // Watch for dreams loading to handle query parameters after data is available
    watch(
      () => filteredDreams.value,
      () => {
        if (filteredDreams.value.length > 0) {
          handleQueryParameters();
        }
      },
    );

    // Watch for 'new' query param to open new dream modal
    watch(
      () => route.query.new,
      (newVal) => {
        if (newVal === "1") {
          dreams.actions.setShowNewDreamModal(true);
        }
      },
      { immediate: true },
    );

    // Watch for debounced search changes
    watch(debouncedSearchQuery, (newValue) => {
      dreams.actions.setFilters({ searchQuery: newValue });
      dreams.actions.searchDreams({ searchQuery: newValue });
    });

    // Lifecycle
    onMounted(async () => {
      // Check if user is authenticated
      if (!auth.getters.isLogged()) {
        return;
      }

      await dreams.actions.loadDreams();
      await dreams.actions.loadStats();
    });

    return {
      // Data
      emotions,
      themes,
      symbols,
      editingDream,
      showEditModal,
      showDeleteConfirm,
      dreamToDelete,
      highlightedDreamId,

      // Computed
      filteredDreams,
      stats,
      newDream,
      filters,
      showNewDreamModal,
      isLoading,

      // Methods
      formatDate,
      formatDateForInput,
      viewDream,
      handleSaveDream,
      handleUpdateDream,
      handleDeleteDream,
      confirmDeleteDream,
      cancelDeleteDream,
      handleSearchChange,
      handleFilterChange,
      handleNewDreamChange,
      handleEditDreamChange,
      openNewDreamModal,
      closeNewDreamModal,
      openEditModal,
      closeEditModal,
      resetNewDreamForm,
      handleAISuggestionsApplied,

      // Debounced search
      searchQuery,
      searchInputRef,
      isMobile,
      isTablet,
      isDesktop,
    };
  },
});
