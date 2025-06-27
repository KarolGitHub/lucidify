import { reactive } from "vue";
import {
  Dream,
  DreamStats,
  NewDream,
  DreamFilters,
  EditingDream,
} from "@/interface/Dream";

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
    isForgotten: false,
    tagsInput: "",
    emotions: [],
    themes: [],
    symbols: [],
  } as NewDream,
  editingDream: null as EditingDream | null,
  filters: {
    searchQuery: "",
    selectedFilter: "all" as const,
  } as DreamFilters,
  showNewDreamModal: false,
  showEditModal: false,
  showDeleteConfirm: false,
  dreamToDelete: null as string | null,
});

export default state;
