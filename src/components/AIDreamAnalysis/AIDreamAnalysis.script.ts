import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { useAsyncState } from "@vueuse/core";
import aiService from "@/services/aiService";
import {
  AIAnalysis,
  AIIntepretation,
  AIInsights,
  CompleteAIAnalysis,
  AIStatus,
} from "@/interface/AI";

export default defineComponent({
  name: "AIDreamAnalysis",
  props: {
    dreamData: {
      type: Object,
      required: true,
    },
    availableEmotions: {
      type: Array as () => string[],
      default: () => [],
    },
    availableThemes: {
      type: Array as () => string[],
      default: () => [],
    },
    availableSymbols: {
      type: Array as () => string[],
      default: () => [],
    },
  },
  emits: [
    "update:dreamData",
    "suggestions-applied",
    "analysis-complete",
    "interpretation-complete",
    "insights-complete",
  ],
  setup(props, { emit }) {
    // Error state
    const error = ref("");

    // Async state for AI operations
    const {
      state: aiStatus,
      isLoading: isCheckingStatus,
      execute: checkAIStatus,
    } = useAsyncState(
      async () => {
        const status = await aiService.getStatus();
        return status;
      },
      { available: false, model: "", configured: false },
    );

    const {
      state: analysis,
      isLoading: isAnalyzing,
      execute: analyzeDream,
    } = useAsyncState(async () => {
      if (!props.dreamData.description)
        throw new Error("No dream description provided");
      return await aiService.analyzeDream(props.dreamData.description);
    }, null);

    const {
      state: interpretation,
      isLoading: isInterpreting,
      execute: interpretDream,
    } = useAsyncState(async () => {
      if (!props.dreamData.description)
        throw new Error("No dream description provided");
      return await aiService.interpretDream(props.dreamData.description);
    }, null);

    const {
      state: insights,
      isLoading: isGeneratingInsights,
      execute: generateInsights,
    } = useAsyncState(async () => {
      if (!props.dreamData.description)
        throw new Error("No dream description provided");
      return await aiService.generateInsights(props.dreamData.description);
    }, null);

    const {
      state: completeAnalysisResult,
      isLoading: isCompleteAnalyzing,
      execute: completeAnalysis,
    } = useAsyncState(async () => {
      if (!props.dreamData.description)
        throw new Error("No dream description provided");
      return await aiService.completeAnalysis(props.dreamData.description);
    }, null);

    const activeTab = ref("analysis");

    // Computed properties
    const canAnalyze = computed(() => {
      return (
        aiStatus.value.available &&
        props.dreamData.description &&
        props.dreamData.description.trim().length >= 10
      );
    });

    const hasResults = computed(() => {
      return (
        analysis.value ||
        interpretation.value ||
        insights.value ||
        completeAnalysisResult.value
      );
    });

    const availableTabs = computed(() => {
      const tabs = [];

      if (analysis.value) {
        tabs.push({
          id: "analysis",
          label: "Analysis",
          icon: "fas fa-magic",
        });
      }

      if (interpretation.value) {
        tabs.push({
          id: "interpretation",
          label: "Interpretation",
          icon: "fas fa-brain",
        });
      }

      if (insights.value) {
        tabs.push({
          id: "insights",
          label: "Insights",
          icon: "fas fa-lightbulb",
        });
      }

      if (completeAnalysisResult.value) {
        tabs.push({
          id: "complete",
          label: "Complete Analysis",
          icon: "fas fa-star",
        });
      }

      return tabs;
    });

    const canApplySuggestions = computed(() => {
      return analysis.value && analysis.value.confidence > 0.5;
    });

    // Methods
    const applyTag = (tag: string) => {
      const updatedData = {
        ...props.dreamData,
        tags: [...new Set([...props.dreamData.tags, tag])],
      };
      emit("update:dreamData", updatedData);
      emit("suggestions-applied", { type: "tag", value: tag });
    };

    const applyEmotion = (emotion: string) => {
      if (!props.availableEmotions.includes(emotion)) return;

      const updatedData = {
        ...props.dreamData,
        emotions: [...new Set([...props.dreamData.emotions, emotion])],
      };
      emit("update:dreamData", updatedData);
      emit("suggestions-applied", { type: "emotion", value: emotion });
    };

    const applyTheme = (theme: string) => {
      if (!props.availableThemes.includes(theme)) return;

      const updatedData = {
        ...props.dreamData,
        themes: [...new Set([...props.dreamData.themes, theme])],
      };
      emit("update:dreamData", updatedData);
      emit("suggestions-applied", { type: "theme", value: theme });
    };

    const applySymbol = (symbol: string) => {
      if (!props.availableSymbols.includes(symbol)) return;

      const updatedData = {
        ...props.dreamData,
        symbols: [...new Set([...props.dreamData.symbols, symbol])],
      };
      emit("update:dreamData", updatedData);
      emit("suggestions-applied", { type: "symbol", value: symbol });
    };

    const applyAllSuggestions = () => {
      if (!analysis.value) return;

      let updatedData = { ...props.dreamData };

      // Apply tags
      analysis.value.suggestedTags.forEach((tag) => {
        updatedData.tags = [...new Set([...updatedData.tags, tag])];
      });

      // Apply emotions
      analysis.value.suggestedEmotions.forEach((emotion) => {
        if (props.availableEmotions.includes(emotion)) {
          updatedData.emotions = [
            ...new Set([...updatedData.emotions, emotion]),
          ];
        }
      });

      // Apply themes
      analysis.value.suggestedThemes.forEach((theme) => {
        if (props.availableThemes.includes(theme)) {
          updatedData.themes = [...new Set([...updatedData.themes, theme])];
        }
      });

      // Apply symbols
      analysis.value.suggestedSymbols.forEach((symbol) => {
        if (props.availableSymbols.includes(symbol)) {
          updatedData.symbols = [...new Set([...updatedData.symbols, symbol])];
        }
      });

      emit("update:dreamData", updatedData);
      emit("suggestions-applied", { type: "all", analysis: analysis.value });
    };

    const clearResults = () => {
      analysis.value = null;
      interpretation.value = null;
      insights.value = null;
      completeAnalysisResult.value = null;
      activeTab.value = "analysis";
    };

    // Lifecycle
    onMounted(() => {
      checkAIStatus();
    });

    // Watch for dream data changes
    watch(
      () => props.dreamData.description,
      (newDescription) => {
        if (newDescription && newDescription.trim().length < 10) {
          clearResults();
        }
      },
    );

    return {
      // State
      error,
      aiStatus,
      analysis,
      interpretation,
      insights,
      completeAnalysisResult,
      activeTab,

      // Loading states
      isCheckingStatus,
      isAnalyzing,
      isInterpreting,
      isGeneratingInsights,
      isCompleteAnalyzing,

      // Methods
      analyzeDream,
      interpretDream,
      generateInsights,
      completeAnalysis,
      checkAIStatus,

      // Computed
      canAnalyze,
      hasResults,
      availableTabs,
      canApplySuggestions,

      // Methods
      applyTag,
      applyEmotion,
      applyTheme,
      applySymbol,
      applyAllSuggestions,
      clearResults,
    };
  },
});
