import { defineComponent, ref, computed, onMounted, watch } from "vue";
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
    // Reactive state
    const aiStatus = ref<AIStatus>({
      available: false,
      model: "",
      configured: false,
    });

    const analysis = ref<AIAnalysis | null>(null);
    const interpretation = ref<AIIntepretation | null>(null);
    const insights = ref<AIInsights | null>(null);
    const completeAnalysisResult = ref<CompleteAIAnalysis | null>(null);

    const isAnalyzing = ref(false);
    const isInterpreting = ref(false);
    const isCompleteAnalyzing = ref(false);
    const error = ref("");

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

      return tabs;
    });

    const canApplySuggestions = computed(() => {
      return analysis.value && analysis.value.confidence > 0.5;
    });

    // Methods
    const checkAIStatus = async () => {
      try {
        aiStatus.value = await aiService.getStatus();
      } catch (error) {
        console.error("Failed to check AI status:", error);
        aiStatus.value = {
          available: false,
          model: "",
          configured: false,
        };
      }
    };

    const analyzeDream = async () => {
      if (!canAnalyze.value) return;

      try {
        isAnalyzing.value = true;
        error.value = "";

        analysis.value = await aiService.analyzeDream(
          props.dreamData.description,
          props.dreamData.title,
        );

        emit("analysis-complete", analysis.value);
      } catch (err: any) {
        error.value = err.message || "Failed to analyze dream";
        console.error("AI Analysis Error:", err);
      } finally {
        isAnalyzing.value = false;
      }
    };

    const interpretDream = async () => {
      if (!canAnalyze.value) return;

      try {
        isInterpreting.value = true;
        error.value = "";

        interpretation.value = await aiService.interpretDream(
          props.dreamData.description,
          props.dreamData.title,
          {
            isLucid: props.dreamData.isLucid,
            isNightmare: props.dreamData.isNightmare,
          },
        );

        emit("interpretation-complete", interpretation.value);
      } catch (err: any) {
        error.value = err.message || "Failed to interpret dream";
        console.error("AI Interpretation Error:", err);
      } finally {
        isInterpreting.value = false;
      }
    };

    const performCompleteAnalysis = async () => {
      if (!canAnalyze.value) return;

      try {
        isCompleteAnalyzing.value = true;
        error.value = "";

        const result = await aiService.completeAnalysis(
          props.dreamData.description,
          props.dreamData.title,
          {
            isLucid: props.dreamData.isLucid,
            isNightmare: props.dreamData.isNightmare,
          },
        );

        analysis.value = result.analysis;
        interpretation.value = result.interpretation;
        insights.value = result.insights;
        completeAnalysisResult.value = result;

        emit("analysis-complete", result.analysis);
        emit("interpretation-complete", result.interpretation);
        emit("insights-complete", result.insights);
      } catch (err: any) {
        error.value = err.message || "Failed to complete analysis";
        console.error("Complete AI Analysis Error:", err);
      } finally {
        isCompleteAnalyzing.value = false;
      }
    };

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
      error.value = "";
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
      aiStatus,
      analysis,
      interpretation,
      insights,
      completeAnalysisResult,
      isAnalyzing,
      isInterpreting,
      isCompleteAnalyzing,
      error,
      activeTab,

      // Computed
      canAnalyze,
      hasResults,
      availableTabs,
      canApplySuggestions,

      // Methods
      analyzeDream,
      interpretDream,
      completeAnalysis: performCompleteAnalysis,
      applyTag,
      applyEmotion,
      applyTheme,
      applySymbol,
      applyAllSuggestions,
      clearResults,
    };
  },
});
