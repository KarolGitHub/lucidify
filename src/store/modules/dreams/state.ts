import { reactive } from "vue";
import { Dream, DreamStats, NewDream, DreamFilters } from "@/interface/Dream";

const state = reactive({
  dreams: [] as Dream[],
  stats: null as DreamStats | null,
  newDream: {
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    isLucid: false,
    isVivid: false,
    isRecurring: false,
    isNightmare: false,
    tagsInput: "",
    emotions: [],
  } as NewDream,
  filters: {
    searchQuery: "",
    selectedFilter: "all" as const,
  } as DreamFilters,
  showNewDreamModal: false,
});

export default state;
