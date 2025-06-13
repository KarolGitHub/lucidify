import apiClient from "./axios/config";
import {
  AIAnalysis,
  AIIntepretation,
  AIInsights,
  CompleteAIAnalysis,
  AIStatus,
  BatchAnalysisResponse,
} from "@/interface/AI";

class AIService {
  /**
   * Check AI service status
   */
  async getStatus(): Promise<AIStatus> {
    try {
      const response = await apiClient.get("/ai/status");
      return response.data.data;
    } catch (error) {
      console.error("Failed to get AI status:", error);
      throw new Error("Failed to check AI service status");
    }
  }

  /**
   * Analyze dream and suggest tags, emotions, themes, symbols
   */
  async analyzeDream(description: string, title?: string): Promise<AIAnalysis> {
    try {
      const response = await apiClient.post("/ai/analyze", {
        description,
        title,
      });
      return response.data.data;
    } catch (error: any) {
      console.error("AI Analysis Error:", error);

      if (error.response?.data?.code === "AI_NOT_CONFIGURED") {
        throw new Error(
          "AI service is not configured. Please contact administrator.",
        );
      }

      throw new Error(
        error.response?.data?.error || "Failed to analyze dream with AI",
      );
    }
  }

  /**
   * Generate dream interpretation
   */
  async interpretDream(
    description: string,
    title?: string,
    context?: { isLucid?: boolean; isNightmare?: boolean },
  ): Promise<AIIntepretation> {
    try {
      const response = await apiClient.post("/ai/interpret", {
        description,
        title,
        context,
      });
      return response.data.data;
    } catch (error: any) {
      console.error("AI Interpretation Error:", error);

      if (error.response?.data?.code === "AI_NOT_CONFIGURED") {
        throw new Error(
          "AI service is not configured. Please contact administrator.",
        );
      }

      throw new Error(
        error.response?.data?.error || "Failed to interpret dream with AI",
      );
    }
  }

  /**
   * Generate personalized insights from dream patterns
   */
  async generateInsights(currentDream: {
    title: string;
    description: string;
  }): Promise<AIInsights> {
    try {
      const response = await apiClient.post("/ai/insights", { currentDream });
      return response.data.data;
    } catch (error: any) {
      console.error("AI Insights Error:", error);

      if (error.response?.data?.code === "AI_NOT_CONFIGURED") {
        throw new Error(
          "AI service is not configured. Please contact administrator.",
        );
      }

      throw new Error(
        error.response?.data?.error || "Failed to generate insights with AI",
      );
    }
  }

  /**
   * Complete AI analysis with all features
   */
  async completeAnalysis(
    description: string,
    title?: string,
    context?: { isLucid?: boolean; isNightmare?: boolean },
  ): Promise<CompleteAIAnalysis> {
    try {
      const response = await apiClient.post("/ai/complete-analysis", {
        description,
        title,
        context,
      });
      return response.data.data;
    } catch (error: any) {
      console.error("Complete AI Analysis Error:", error);

      if (error.response?.data?.code === "AI_NOT_CONFIGURED") {
        throw new Error(
          "AI service is not configured. Please contact administrator.",
        );
      }

      throw new Error(
        error.response?.data?.error || "Failed to complete AI analysis",
      );
    }
  }

  /**
   * Batch analyze multiple dreams
   */
  async batchAnalyze(dreamIds: string[]): Promise<BatchAnalysisResponse> {
    try {
      const response = await apiClient.post("/ai/batch-analyze", { dreamIds });
      return response.data.data;
    } catch (error: any) {
      console.error("Batch AI Analysis Error:", error);

      if (error.response?.data?.code === "AI_NOT_CONFIGURED") {
        throw new Error(
          "AI service is not configured. Please contact administrator.",
        );
      }

      throw new Error(
        error.response?.data?.error || "Failed to batch analyze dreams",
      );
    }
  }

  /**
   * Apply AI suggestions to dream data
   */
  applySuggestions(
    dreamData: any,
    analysis: AIAnalysis,
    options: {
      autoApply?: boolean;
      confidenceThreshold?: number;
    } = {},
  ) {
    const { autoApply = false, confidenceThreshold = 0.7 } = options;

    if (!autoApply || analysis.confidence < confidenceThreshold) {
      return {
        ...dreamData,
        aiSuggestions: {
          tags: analysis.suggestedTags,
          emotions: analysis.suggestedEmotions,
          themes: analysis.suggestedThemes,
          symbols: analysis.suggestedSymbols,
          confidence: analysis.confidence,
          reasoning: analysis.reasoning,
        },
      };
    }

    // Auto-apply suggestions if confidence is high enough
    return {
      ...dreamData,
      tags: [...new Set([...dreamData.tags, ...analysis.suggestedTags])],
      emotions: [
        ...new Set([...dreamData.emotions, ...analysis.suggestedEmotions]),
      ],
      themes: [...new Set([...dreamData.themes, ...analysis.suggestedThemes])],
      symbols: [
        ...new Set([...dreamData.symbols, ...analysis.suggestedSymbols]),
      ],
      aiSuggestions: {
        applied: true,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
      },
    };
  }

  /**
   * Format interpretation for display
   */
  formatInterpretation(interpretation: AIIntepretation) {
    return {
      ...interpretation,
      formattedKeySymbols: interpretation.keySymbols.map((symbol) => ({
        ...symbol,
        displayName: symbol.symbol,
        description: `${symbol.meaning} - ${symbol.personalRelevance}`,
      })),
    };
  }

  /**
   * Format insights for display
   */
  formatInsights(insights: AIInsights) {
    return {
      ...insights,
      formattedInsights: insights.personalizedInsights.map(
        (insight, index) => ({
          ...insight,
          id: index + 1,
          displayTitle: `Insight ${index + 1}`,
          actionable: insight.suggestion.length > 0,
        }),
      ),
    };
  }
}

export default new AIService();
