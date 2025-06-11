import { Dream, DreamStats, NewDream, DreamFilters } from "@/interface/Dream";
import state from "./state";

const mutations = {
  setDreams(dreams: Dream[]): void {
    state.dreams = dreams;
  },

  addDream(dream: Dream): void {
    state.dreams.unshift(dream);
  },

  updateDream(dreamId: string, dreamData: Partial<Dream>): void {
    const index = state.dreams.findIndex((dream) => dream._id === dreamId);
    if (index !== -1) {
      state.dreams[index] = { ...state.dreams[index], ...dreamData };
    }
  },

  removeDream(dreamId: string): void {
    state.dreams = state.dreams.filter((dream) => dream._id !== dreamId);
  },

  setStats(stats: DreamStats): void {
    state.stats = stats;
  },

  setNewDream(newDream: NewDream): void {
    state.newDream = newDream;
  },

  resetNewDream(): void {
    state.newDream = {
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      isLucid: false,
      isVivid: false,
      isRecurring: false,
      isNightmare: false,
      tagsInput: "",
      emotions: [],
    };
  },

  setFilters(filters: Partial<DreamFilters>): void {
    state.filters = { ...state.filters, ...filters };
  },

  setShowNewDreamModal(show: boolean): void {
    state.showNewDreamModal = show;
  },
};

export default mutations;
