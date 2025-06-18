import {
  defineComponent,
  computed,
  onMounted,
  ref,
  watch,
  onUnmounted,
} from "vue";
import { useRoute } from "vue-router";
import { auth, dreams, notifications } from "@/store";
import { Dream } from "@/interface/Dream";
import { Toast } from "@/interface/Toast";
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
    const isMobile = ref(window.innerWidth <= 768);
    const isLoading = ref(false);
    const error = ref<string | undefined>(undefined);

    // State
    const selectedDream = ref<Dream | null>(null);
    const showNewDreamModal = ref(false);
    const showEditModal = ref(false);
    const showDeleteConfirm = ref(false);
    const dreamToDelete = ref<string | null>(null);
    const editingDream = ref<EditingDream | null>(null);
    const searchQuery = ref("");
    const selectedFilter = ref<
      "all" | "lucid" | "vivid" | "recurring" | "nightmare"
    >("all");

    // Computed
    const filteredDreams = computed(() => {
      let filtered = dreams.getters.getDreams();

      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(
          (dream) =>
            dream.title.toLowerCase().includes(query) ||
            dream.description.toLowerCase().includes(query) ||
            dream.tags.some((tag) => tag.toLowerCase().includes(query)),
        );
      }

      // Apply type filter
      switch (selectedFilter.value) {
        case "lucid":
          filtered = filtered.filter((dream) => dream.isLucid);
          break;
        case "vivid":
          filtered = filtered.filter((dream) => dream.isVivid);
          break;
        case "recurring":
          filtered = filtered.filter((dream) => dream.isRecurring);
          break;
        case "nightmare":
          filtered = filtered.filter((dream) => dream.isNightmare);
          break;
      }

      // Sort by date (newest first)
      return filtered.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    });

    // Methods
    const handleNewDream = () => {
      showNewDreamModal.value = true;
    };

    const handleEditDream = (dream: Dream) => {
      editingDream.value = {
        ...dream,
        tagsInput: dream.tags.join(", "),
      };
      showEditModal.value = true;
    };

    const handleViewDream = (dream: Dream) => {
      selectedDream.value = dream;
    };

    const closeEditModal = () => {
      editingDream.value = null;
      showEditModal.value = false;
    };

    const handleUpdateDream = async () => {
      if (!editingDream.value) return;

      try {
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

          // Show success toast
          const toast: Toast = {
            show: true,
            type: "success",
            tittle: "Success",
            body: "Dream updated successfully",
          };
          notifications.actions.presentToast(toast);
        }
      } catch (err: any) {
        // Show error toast
        const toast: Toast = {
          show: true,
          type: "error",
          tittle: "Error",
          body: err.message || "Failed to update dream",
        };
        notifications.actions.presentToast(toast);
      }
    };

    const handleDeleteDream = async (dreamId: string) => {
      dreamToDelete.value = dreamId;
      showDeleteConfirm.value = true;
    };

    const confirmDeleteDream = async () => {
      if (dreamToDelete.value) {
        try {
          await dreams.actions.deleteDream(dreamToDelete.value);
          dreamToDelete.value = null;
          showDeleteConfirm.value = false;

          // Show success toast
          const toast: Toast = {
            show: true,
            type: "success",
            tittle: "Success",
            body: "Dream deleted successfully",
          };
          notifications.actions.presentToast(toast);
        } catch (err: any) {
          // Show error toast
          const toast: Toast = {
            show: true,
            type: "error",
            tittle: "Error",
            body: err.message || "Failed to delete dream",
          };
          notifications.actions.presentToast(toast);
        }
      }
    };

    const cancelDeleteDream = () => {
      dreamToDelete.value = null;
      showDeleteConfirm.value = false;
    };

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger shortcuts if not in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl/Cmd + N for new dream
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        handleNewDream();
      }

      // Escape to close modals
      if (e.key === "Escape") {
        if (showNewDreamModal.value) {
          showNewDreamModal.value = false;
        }
        if (showEditModal.value) {
          closeEditModal();
        }
        if (showDeleteConfirm.value) {
          cancelDeleteDream();
        }
      }
    };

    // Window resize handler for mobile detection
    const handleResize = () => {
      isMobile.value = window.innerWidth <= 768;
    };

    // Load dreams with error handling
    const loadDreams = async () => {
      isLoading.value = true;
      error.value = undefined;

      try {
        await dreams.actions.loadDreams();
      } catch (err: any) {
        error.value = err.message || "Failed to load dreams";
        // Show error toast
        const toast: Toast = {
          show: true,
          type: "error",
          tittle: "Error",
          body: error.value,
        };
        notifications.actions.presentToast(toast);
      } finally {
        isLoading.value = false;
      }
    };

    // Lifecycle hooks
    onMounted(async () => {
      document.addEventListener("keydown", handleKeyDown);
      window.addEventListener("resize", handleResize);
      await loadDreams();
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    });

    return {
      selectedDream,
      showNewDreamModal,
      showEditModal,
      showDeleteConfirm,
      dreamToDelete,
      editingDream,
      searchQuery,
      selectedFilter,
      filteredDreams,
      isMobile,
      isLoading,
      error,
      handleNewDream,
      handleEditDream,
      handleViewDream,
      closeEditModal,
      handleUpdateDream,
      handleDeleteDream,
      confirmDeleteDream,
      cancelDeleteDream,
    };
  },
});
