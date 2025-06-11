import { defineComponent, computed, onMounted, ref } from "vue";
import { auth, dreams } from "@/store";
import { Dream } from "@/interface/Dream";

// Extended Dream interface for editing
interface EditingDream extends Dream {
  tagsInput: string;
}

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

    // State for editing
    const editingDream = ref<EditingDream | null>(null);
    const showEditModal = ref(false);
    const showDeleteConfirm = ref(false);
    const dreamToDelete = ref<string | null>(null);

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
      // For now, open edit modal to view dream details
      // In the future, this could navigate to a dedicated dream detail page
      editingDream.value = {
        ...dream,
        tagsInput: dream.tags.join(", "),
      };
      showEditModal.value = true;
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

      const dreamData: Partial<Dream> = {
        title: editingDream.value.title,
        description: editingDream.value.description,
        date: editingDream.value.date,
        isLucid: editingDream.value.isLucid,
        isVivid: editingDream.value.isVivid,
        isRecurring: editingDream.value.isRecurring,
        isNightmare: editingDream.value.isNightmare,
        tags,
        emotions: editingDream.value.emotions,
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
      editingDream,
      showEditModal,
      showDeleteConfirm,
      dreamToDelete,

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
    };
  },
});
