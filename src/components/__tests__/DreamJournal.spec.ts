import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import DreamJournal from "@/views/dream-journal/DreamJournal.vue";

describe("DreamJournal - Forgotten Dream Feature", () => {
  it("disables title and description when forgotten dream is checked", async () => {
    const wrapper = mount(DreamJournal, {
      global: {
        stubs: ["DreamList", "AIDreamAnalysis", "VoiceToText"],
        mocks: {
          $store: {
            state: {},
            getters: {
              getFilteredDreams: () => [],
              getStats: () => ({}),
              getNewDream: () => ({
                title: "",
                description: "",
                date: "2024-01-01",
                isLucid: false,
                isVivid: false,
                isRecurring: false,
                isNightmare: false,
                isForgotten: false,
                tagsInput: "",
                emotions: [],
                themes: [],
                symbols: [],
              }),
              getFilters: () => ({ searchQuery: "", selectedFilter: "all" }),
              getShowNewDreamModal: () => true,
              getDreams: () => [],
            },
            actions: {
              setNewDream: vi.fn(),
              saveDream: vi.fn(),
              setShowNewDreamModal: vi.fn(),
              resetNewDream: vi.fn(),
            },
          },
        },
      },
    });

    // Find and check the forgotten dream checkbox
    const checkbox = wrapper.find("#forgotten-dream-checkbox");
    await checkbox.setValue(true);

    // Title and description should be disabled
    const titleInput = wrapper.find('input[type="text"]');
    const descInput = wrapper.find("textarea");
    expect(titleInput.attributes("disabled")).toBeDefined();
    expect(descInput.attributes("disabled")).toBeDefined();
  });
});
