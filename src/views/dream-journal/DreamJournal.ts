import { defineComponent, computed, onMounted, ref } from "vue";
import { auth, dreams } from "@/store";
import { Dream } from "@/interface/Dream";

export default defineComponent({
  name: "DreamJournal",
  setup() {
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

    // Computed properties
    const filteredDreams = computed(() => dreams.getters.getFilteredDreams());
    const stats = computed(() => dreams.getters.getStats());
    const newDream = computed(() => dreams.getters.getNewDream());
    const filters = computed(() => dreams.getters.getFilters());
    const showNewDreamModal = computed(() =>
      dreams.getters.getShowNewDreamModal(),
    );
    const isLoading = computed(() => dreams.getters.getDreams().length === 0);

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
      // TODO: Navigate to dream detail view or open modal
      console.log("Viewing dream:", dream);
    };

    const handleSaveDream = async () => {
      await dreams.actions.saveDream();
    };

    const handleDeleteDream = async (dreamId: string) => {
      await dreams.actions.deleteDream(dreamId);
    };

    const handleSearchChange = (searchQuery: string) => {
      dreams.actions.setFilters({ searchQuery });
    };

    const handleFilterChange = (selectedFilter: string) => {
      dreams.actions.setFilters({ selectedFilter: selectedFilter as any });
    };

    const handleNewDreamChange = (field: string, value: any) => {
      dreams.actions.setNewDream({ [field]: value });
    };

    const openNewDreamModal = () => {
      dreams.actions.setShowNewDreamModal(true);
    };

    const closeNewDreamModal = () => {
      dreams.actions.setShowNewDreamModal(false);
      dreams.actions.resetNewDream();
    };

    const resetNewDreamForm = () => {
      dreams.actions.resetNewDream();
    };

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

      // Computed
      filteredDreams,
      stats,
      newDream,
      filters,
      showNewDreamModal,
      isLoading,

      // Methods
      formatDate,
      viewDream,
      handleSaveDream,
      handleDeleteDream,
      handleSearchChange,
      handleFilterChange,
      handleNewDreamChange,
      openNewDreamModal,
      closeNewDreamModal,
      resetNewDreamForm,
    };
  },
});
