import { Dream } from "@/interface/Dream";
import state from "./state";

const getters = {
  getDreams: () => state.dreams,

  getStats: () => state.stats,

  getNewDream: () => state.newDream,

  getFilters: () => state.filters,

  getShowNewDreamModal: () => state.showNewDreamModal,

  getFilteredDreams: (): Dream[] => {
    let filtered = state.dreams;

    // Apply search filter
    if (state.filters.searchQuery) {
      const query = state.filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (dream) =>
          dream.title.toLowerCase().includes(query) ||
          dream.description.toLowerCase().includes(query) ||
          dream.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Apply type filter
    switch (state.filters.selectedFilter) {
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
  },
};

export default getters;
