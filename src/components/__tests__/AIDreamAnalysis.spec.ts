import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import AIDreamAnalysis from "../AIDreamAnalysis/AIDreamAnalysis.vue";
import aiService from "@/services/aiService";

// Mock the AI service
vi.mock("@/services/aiService", () => ({
  default: {
    getStatus: vi.fn(),
    analyzeDream: vi.fn(),
    interpretDream: vi.fn(),
  },
}));

describe("AIDreamAnalysis", () => {
  let wrapper: any;
  const mockDreamData = {
    title: "Test Dream",
    description: "I was flying over mountains and felt very peaceful.",
    isLucid: true,
    isNightmare: false,
  };

  const mockEmotions = ["Joy", "Fear", "Peace"];
  const mockThemes = ["Flying", "Nature"];
  const mockSymbols = ["Mountain", "Sky"];

  beforeEach(() => {
    wrapper = mount(AIDreamAnalysis, {
      props: {
        dreamData: mockDreamData,
        availableEmotions: mockEmotions,
        availableThemes: mockThemes,
        availableSymbols: mockSymbols,
      },
    });
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("renders the component correctly", () => {
      expect(wrapper.find(".ai-analysis-container").exists()).toBe(true);
    });

    it("shows analyze button when description is long enough", () => {
      expect(wrapper.find("[data-test='analyze-button']").exists()).toBe(true);
    });

    it("doesn't show analyze button when description is too short", async () => {
      await wrapper.setProps({
        dreamData: { ...mockDreamData, description: "Short" },
      });
      expect(wrapper.find("[data-test='analyze-button']").exists()).toBe(false);
    });
  });

  describe("AI Analysis", () => {
    it("calls analyzeDream when analyze button is clicked", async () => {
      const mockAnalysis = {
        suggestedTags: ["flying", "peaceful"],
        suggestedEmotions: ["Peace"],
        suggestedThemes: ["Flying"],
        suggestedSymbols: ["Mountain"],
        confidence: 0.9,
        reasoning: "Test reasoning",
      };

      vi.mocked(aiService.analyzeDream).mockResolvedValueOnce(mockAnalysis);

      await wrapper.find("[data-test='analyze-button']").trigger("click");

      expect(aiService.analyzeDream).toHaveBeenCalledWith(
        mockDreamData.description,
        mockDreamData.title,
      );
      expect(wrapper.emitted("analysis-complete")).toBeTruthy();
    });

    it("handles analysis errors correctly", async () => {
      vi.mocked(aiService.analyzeDream).mockRejectedValueOnce(
        new Error("Analysis failed"),
      );

      await wrapper.find("[data-test='analyze-button']").trigger("click");

      expect(wrapper.find("[data-test='error-message']").exists()).toBe(true);
      expect(wrapper.find("[data-test='error-message']").text()).toContain(
        "Analysis failed",
      );
    });
  });

  describe("Dream Interpretation", () => {
    it("calls interpretDream when interpret button is clicked", async () => {
      const mockInterpretation = {
        psychologicalAnalysis: "Test analysis",
        symbolicInterpretation: "Test interpretation",
        personalGrowthInsights: ["Test insight"],
        practicalAdvice: ["Test advice"],
      };

      vi.mocked(aiService.interpretDream).mockResolvedValueOnce(
        mockInterpretation,
      );

      await wrapper.find("[data-test='interpret-button']").trigger("click");

      expect(aiService.interpretDream).toHaveBeenCalledWith(
        mockDreamData.description,
        mockDreamData.title,
        {
          isLucid: mockDreamData.isLucid,
          isNightmare: mockDreamData.isNightmare,
        },
      );
      expect(wrapper.emitted("interpretation-complete")).toBeTruthy();
    });

    it("handles interpretation errors correctly", async () => {
      vi.mocked(aiService.interpretDream).mockRejectedValueOnce(
        new Error("Interpretation failed"),
      );

      await wrapper.find("[data-test='interpret-button']").trigger("click");

      expect(wrapper.find("[data-test='error-message']").exists()).toBe(true);
      expect(wrapper.find("[data-test='error-message']").text()).toContain(
        "Interpretation failed",
      );
    });
  });

  describe("AI Status", () => {
    it("checks AI service status on mount", async () => {
      const mockStatus = {
        available: true,
        model: "gpt-4",
        configured: true,
      };

      vi.mocked(aiService.getStatus).mockResolvedValueOnce(mockStatus);

      await wrapper.vm.checkAIStatus();

      expect(aiService.getStatus).toHaveBeenCalled();
      expect(wrapper.vm.aiStatus).toEqual(mockStatus);
    });

    it("handles AI service status errors", async () => {
      vi.mocked(aiService.getStatus).mockRejectedValueOnce(
        new Error("Status check failed"),
      );

      await wrapper.vm.checkAIStatus();

      expect(wrapper.vm.aiStatus).toEqual({
        available: false,
        model: "",
        configured: false,
      });
    });
  });
});
