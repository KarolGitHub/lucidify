import {
  Dream,
  DreamStats,
  DreamFilters,
  EditingDream,
} from "@/interface/Dream";
import { loadingStore, notifications, auth } from "@/store";
import { Toast } from "@/interface/Toast";
import dreamService from "@/services/dreams";
import mutations from "./mutations";
import state from "./state";
import { AuthErrorHandler } from "@/utils/authErrorHandler";

export default {
  async loadDreams(): Promise<void> {
    try {
      loadingStore.actions.start("Loading dreams...");

      const userId = auth.getters.getUser()?.id;
      if (!userId) {
        const toast: Toast = {
          body: "You must be logged in to view dreams.",
          tittle: "Authentication Required",
          type: "error",
          show: true,
        };
        notifications.actions.presentToast(toast);
        mutations.setDreams([]);
        return;
      }

      const dreams = await dreamService.getDreams(userId);
      mutations.setDreams(dreams);
    } catch (error: any) {
      console.error("Error loading dreams:", error);

      // Don't show error toast if it's an auth error (auto logout will handle it)
      if (
        !error.message?.includes("No authentication token available") &&
        !error.message?.includes("Session expired")
      ) {
        const toast: Toast = {
          body: "Failed to load dreams. Please check your connection.",
          tittle: "Error",
          type: "error",
          show: true,
        };
        notifications.actions.presentToast(toast);
      }
      mutations.setDreams([]);
    } finally {
      loadingStore.actions.finish();
    }
  },

  async loadStats(): Promise<void> {
    try {
      const userId = auth.getters.getUser()?.id;
      if (!userId) {
        return;
      }

      const stats = await dreamService.getDreamStats(userId);
      mutations.setStats(stats);
    } catch (error: any) {
      console.error("Error loading dream stats:", error);

      // Don't show error toast if it's an auth error (auto logout will handle it)
      if (
        !error.message?.includes("No authentication token available") &&
        !error.message?.includes("Session expired")
      ) {
        const toast: Toast = {
          body: "Failed to load dream statistics.",
          tittle: "Error",
          type: "error",
          show: true,
        };
        notifications.actions.presentToast(toast);
      }
    }
  },

  async saveDream(): Promise<void> {
    try {
      loadingStore.actions.start("Saving dream...");

      const userId = auth.getters.getUser()?.id;
      if (!userId) {
        const toast: Toast = {
          body: "You must be logged in to save dreams.",
          tittle: "Authentication Required",
          type: "error",
          show: true,
        };
        notifications.actions.presentToast(toast);
        return;
      }

      // Process tags
      const tags = state.newDream.tagsInput
        .split(",")
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);

      const dreamData: Omit<Dream, "_id" | "createdAt" | "updatedAt"> = {
        title: state.newDream.title,
        description: state.newDream.description,
        date: state.newDream.date,
        isLucid: state.newDream.isLucid,
        isVivid: state.newDream.isVivid,
        isRecurring: state.newDream.isRecurring,
        isNightmare: state.newDream.isNightmare,
        isForgotten: state.newDream.isForgotten,
        tags,
        emotions: state.newDream.emotions,
        themes: state.newDream.themes,
        symbols: state.newDream.symbols,
        userId,
      };

      const newDream = await dreamService.createDream(dreamData);
      mutations.addDream(newDream);
      mutations.setShowNewDreamModal(false);
      mutations.resetNewDream();

      // Reload stats
      await this.loadStats();

      const toast: Toast = {
        body: "Dream saved successfully!",
        tittle: "Success",
        type: "success",
        show: true,
      };
      notifications.actions.presentToast(toast);
    } catch (error: any) {
      console.error("Error saving dream:", error);

      // Don't show error toast if it's an auth error (auto logout will handle it)
      if (
        !error.message?.includes("No authentication token available") &&
        !error.message?.includes("Session expired")
      ) {
        const toast: Toast = {
          body: "Failed to save dream. Please try again.",
          tittle: "Error",
          type: "error",
          show: true,
        };
        notifications.actions.presentToast(toast);
      }
    } finally {
      loadingStore.actions.finish();
    }
  },

  async updateDream(dreamId: string, dreamData: Partial<Dream>): Promise<void> {
    try {
      loadingStore.actions.start("Updating dream...");

      const updatedDream = await dreamService.updateDream(dreamId, dreamData);
      mutations.updateDream(dreamId, updatedDream);

      const toast: Toast = {
        body: "Dream updated successfully!",
        tittle: "Success",
        type: "success",
        show: true,
      };
      notifications.actions.presentToast(toast);
    } catch (error: any) {
      console.error("Error updating dream:", error);

      // Don't show error toast if it's an auth error (auto logout will handle it)
      if (
        !error.message?.includes("No authentication token available") &&
        !error.message?.includes("Session expired")
      ) {
        const toast: Toast = {
          body: "Failed to update dream. Please try again.",
          tittle: "Error",
          type: "error",
          show: true,
        };
        notifications.actions.presentToast(toast);
      }
    } finally {
      loadingStore.actions.finish();
    }
  },

  async deleteDream(dreamId: string): Promise<void> {
    try {
      loadingStore.actions.start("Deleting dream...");

      await dreamService.deleteDream(dreamId);
      mutations.removeDream(dreamId);
      await this.loadStats();

      const toast: Toast = {
        body: "Dream deleted successfully!",
        tittle: "Success",
        type: "success",
        show: true,
      };
      notifications.actions.presentToast(toast);
    } catch (error: any) {
      console.error("Error deleting dream:", error);

      // Don't show error toast if it's an auth error (auto logout will handle it)
      if (
        !error.message?.includes("No authentication token available") &&
        !error.message?.includes("Session expired")
      ) {
        const toast: Toast = {
          body: "Failed to delete dream. Please try again.",
          tittle: "Error",
          type: "error",
          show: true,
        };
        notifications.actions.presentToast(toast);
      }
    } finally {
      loadingStore.actions.finish();
    }
  },

  async searchDreams(filters: any): Promise<void> {
    try {
      loadingStore.actions.start("Searching dreams...");

      const userId = auth.getters.getUser()?.id;
      if (!userId) {
        const toast: Toast = {
          body: "You must be logged in to search dreams.",
          tittle: "Authentication Required",
          type: "error",
          show: true,
        };
        notifications.actions.presentToast(toast);
        return;
      }

      const dreams = await dreamService.searchDreams({ ...filters, userId });
      mutations.setDreams(dreams);
    } catch (error: any) {
      console.error("Error searching dreams:", error);

      // Don't show error toast if it's an auth error (auto logout will handle it)
      if (
        !error.message?.includes("No authentication token available") &&
        !error.message?.includes("Session expired")
      ) {
        const toast: Toast = {
          body: "Failed to search dreams. Please try again.",
          tittle: "Error",
          type: "error",
          show: true,
        };
        notifications.actions.presentToast(toast);
      }
    } finally {
      loadingStore.actions.finish();
    }
  },

  setFilters(filters: Partial<DreamFilters>): void {
    mutations.setFilters(filters);
  },

  setNewDream(
    newDream: Partial<{
      title: string;
      description: string;
      date: string;
      isLucid: boolean;
      isVivid: boolean;
      isRecurring: boolean;
      isNightmare: boolean;
      tagsInput: string;
      emotions: string[];
    }>,
  ): void {
    mutations.setNewDream({ ...state.newDream, ...newDream });
  },

  resetNewDream(): void {
    mutations.resetNewDream();
  },

  setShowNewDreamModal(show: boolean): void {
    mutations.setShowNewDreamModal(show);
  },

  setEditingDream(editingDream: Partial<EditingDream> | null): void {
    if (editingDream) {
      mutations.setEditingDream({
        ...state.editingDream,
        ...editingDream,
      } as EditingDream);
    } else {
      mutations.resetEditingDream();
    }
  },

  resetEditingDream(): void {
    mutations.resetEditingDream();
  },

  setShowEditModal(show: boolean): void {
    mutations.setShowEditModal(show);
  },

  setShowDeleteConfirm(show: boolean): void {
    mutations.setShowDeleteConfirm(show);
  },

  setDreamToDelete(dreamId: string | null): void {
    mutations.setDreamToDelete(dreamId);
  },
};
