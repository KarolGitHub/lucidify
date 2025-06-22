import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import AIDreamAnalysis from "../AIDreamAnalysis/AIDreamAnalysis.vue";

// Mock aiService
vi.mock("@/services/aiService", () => ({
  default: {
    getStatus: vi.fn(() =>
      Promise.resolve({
        available: true,
        model: "gpt-4",
        configured: true,
      }),
    ),
    analyzeDream: vi.fn(),
    interpretDream: vi.fn(),
    generateInsights: vi.fn(),
    completeAnalysis: vi.fn(),
  },
}));

describe("AIDreamAnalysis", () => {
  const mockDreamData = {
    title: "Test Dream",
    description: "I was flying over mountains and felt very peaceful.",
    isLucid: true,
    isNightmare: false,
    emotions: [],
    themes: [],
    symbols: [],
    tags: [],
  };

  const mockAvailableEmotions = ["Joy", "Fear", "Peace"];
  const mockAvailableThemes = ["Flying", "Nature"];
  const mockAvailableSymbols = ["Mountain", "Bird"];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("renders the component correctly", () => {
      const wrapper = mount(AIDreamAnalysis, {
        props: {
          dreamData: mockDreamData,
          availableEmotions: mockAvailableEmotions,
          availableThemes: mockAvailableThemes,
          availableSymbols: mockAvailableSymbols,
        },
      });

      expect(wrapper.find(".ai-dream-analysis").exists()).toBe(true);
    });

    it("shows analyze button when description is long enough", async () => {
      const wrapper = mount(AIDreamAnalysis, {
        props: {
          dreamData: mockDreamData,
          availableEmotions: mockAvailableEmotions,
          availableThemes: mockAvailableThemes,
          availableSymbols: mockAvailableSymbols,
        },
      });

      // Wait for component to mount and AI status to load
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 0));

      const buttons = wrapper.findAll("button");
      const analyzeButton = buttons.find((button) =>
        button.text().includes("Analyze Dream"),
      );
      expect(analyzeButton).toBeTruthy();
    });

    it("doesn't show analyze button when description is too short", async () => {
      const shortDreamData = {
        ...mockDreamData,
        description: "Short",
      };

      const wrapper = mount(AIDreamAnalysis, {
        props: {
          dreamData: shortDreamData,
          availableEmotions: mockAvailableEmotions,
          availableThemes: mockAvailableThemes,
          availableSymbols: mockAvailableSymbols,
        },
      });

      // Wait for component to mount and AI status to load
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 0));

      const buttons = wrapper.findAll("button");
      const analyzeButton = buttons.find((button) =>
        button.text().includes("Analyze Dream"),
      );
      expect(analyzeButton).toBeFalsy();
    });
  });

  describe("AI Analysis", () => {
    it("calls analyzeDream when analyze button is clicked", async () => {
      const mockAnalyzeResult = {
        suggestedTags: ["Adventure"],
        suggestedEmotions: ["Joy"],
        suggestedThemes: ["Flying"],
        suggestedSymbols: ["Mountain"],
        confidence: 0.8,
        reasoning: "This dream represents freedom and peace.",
      };

      const aiService = await import("@/services/aiService");
      vi.mocked(aiService.default.analyzeDream).mockResolvedValue(
        mockAnalyzeResult,
      );

      const wrapper = mount(AIDreamAnalysis, {
        props: {
          dreamData: mockDreamData,
          availableEmotions: mockAvailableEmotions,
          availableThemes: mockAvailableThemes,
          availableSymbols: mockAvailableSymbols,
        },
      });

      // Wait for component to mount and AI status to load
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 0));

      const buttons = wrapper.findAll("button");
      const analyzeButton = buttons.find((button) =>
        button.text().includes("Analyze Dream"),
      );
      if (analyzeButton) {
        await analyzeButton.trigger("click");
        expect(aiService.default.analyzeDream).toHaveBeenCalledWith(
          mockDreamData.description,
        );
      }
    });

    it("handles analysis errors correctly", async () => {
      const aiService = await import("@/services/aiService");
      vi.mocked(aiService.default.analyzeDream).mockRejectedValue(
        new Error("Analysis failed"),
      );

      const wrapper = mount(AIDreamAnalysis, {
        props: {
          dreamData: mockDreamData,
          availableEmotions: mockAvailableEmotions,
          availableThemes: mockAvailableThemes,
          availableSymbols: mockAvailableSymbols,
        },
      });

      // Wait for component to mount and AI status to load
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 0));

      const buttons = wrapper.findAll("button");
      const analyzeButton = buttons.find((button) =>
        button.text().includes("Analyze Dream"),
      );
      if (analyzeButton) {
        await analyzeButton.trigger("click");
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.error).toBe("Failed to analyze dream");
      }
    });
  });

  describe("Dream Interpretation", () => {
    it("calls interpretDream when interpret button is clicked", async () => {
      const mockInterpretResult = {
        interpretation: {
          generalMeaning: "This dream symbolizes freedom and inner peace.",
          symbolicElements: "Flying represents liberation from constraints.",
          emotionalInsights: "You are feeling peaceful and content.",
          personalGrowth: "You are developing a sense of inner freedom.",
          practicalAdvice: "Embrace change and trust your instincts.",
        },
        keySymbols: [
          {
            symbol: "Flying",
            meaning: "Freedom and liberation",
            personalRelevance: "You seek to break free from limitations.",
          },
        ],
        confidence: 0.85,
        disclaimer: "This interpretation is for guidance only.",
      };

      const aiService = await import("@/services/aiService");
      vi.mocked(aiService.default.interpretDream).mockResolvedValue(
        mockInterpretResult,
      );

      const wrapper = mount(AIDreamAnalysis, {
        props: {
          dreamData: mockDreamData,
          availableEmotions: mockAvailableEmotions,
          availableThemes: mockAvailableThemes,
          availableSymbols: mockAvailableSymbols,
        },
      });

      // Wait for component to mount and AI status to load
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 0));

      const buttons = wrapper.findAll("button");
      const interpretButton = buttons.find((button) =>
        button.text().includes("Interpret"),
      );
      if (interpretButton) {
        await interpretButton.trigger("click");
        expect(aiService.default.interpretDream).toHaveBeenCalledWith(
          mockDreamData.description,
        );
      }
    });

    it("handles interpretation errors correctly", async () => {
      const aiService = await import("@/services/aiService");
      vi.mocked(aiService.default.interpretDream).mockRejectedValue(
        new Error("Interpretation failed"),
      );

      const wrapper = mount(AIDreamAnalysis, {
        props: {
          dreamData: mockDreamData,
          availableEmotions: mockAvailableEmotions,
          availableThemes: mockAvailableThemes,
          availableSymbols: mockAvailableSymbols,
        },
      });

      // Wait for component to mount and AI status to load
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 0));

      const buttons = wrapper.findAll("button");
      const interpretButton = buttons.find((button) =>
        button.text().includes("Interpret"),
      );
      if (interpretButton) {
        await interpretButton.trigger("click");
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.error).toBe("Failed to interpret dream");
      }
    });
  });

  describe("AI Status", () => {
    it("checks AI service status on mount", async () => {
      const aiService = await import("@/services/aiService");

      mount(AIDreamAnalysis, {
        props: {
          dreamData: mockDreamData,
          availableEmotions: mockAvailableEmotions,
          availableThemes: mockAvailableThemes,
          availableSymbols: mockAvailableSymbols,
        },
      });

      expect(aiService.default.getStatus).toHaveBeenCalled();
    });

    it("handles AI service status errors", async () => {
      const aiService = await import("@/services/aiService");
      vi.mocked(aiService.default.getStatus).mockRejectedValue(
        new Error("Status check failed"),
      );

      const wrapper = mount(AIDreamAnalysis, {
        props: {
          dreamData: mockDreamData,
          availableEmotions: mockAvailableEmotions,
          availableThemes: mockAvailableThemes,
          availableSymbols: mockAvailableSymbols,
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(wrapper.vm.error).toBe("Failed to check AI service status");
    });
  });
});
