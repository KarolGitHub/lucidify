import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import DreamJournal from "../../views/dream-journal/DreamJournal.vue";
import { dreams } from "@/store";
import { Dream } from "@/interface/Dream";

// Mock the dreams store
vi.mock("@/store", () => ({
  dreams: {
    getters: {
      getDreams: () => [
        {
          _id: "1",
          title: "Flying Dream",
          description: "I was flying over mountains",
          date: "2024-03-20",
          isLucid: true,
          isVivid: true,
          isRecurring: false,
          isNightmare: false,
          tags: ["flying", "mountains"],
          emotions: ["Joy", "Peace"],
          themes: ["Flying", "Nature"],
          symbols: ["Mountain", "Sky"],
        },
      ],
      getFilteredDreams: () => [
        {
          _id: "1",
          title: "Flying Dream",
          description: "I was flying over mountains",
          date: "2024-03-20",
          isLucid: true,
          isVivid: true,
          isRecurring: false,
          isNightmare: false,
          tags: ["flying", "mountains"],
          emotions: ["Joy", "Peace"],
          themes: ["Flying", "Nature"],
          symbols: ["Mountain", "Sky"],
        },
      ],
      getStats: () => ({
        totalDreams: 1,
        lucidDreams: 1,
        vividDreams: 1,
        recurringDreams: 0,
        nightmares: 0,
        lucidPercentage: 100,
      }),
      getNewDream: () => ({
        title: "",
        description: "",
        date: new Date().toISOString(),
        isLucid: false,
        isVivid: false,
        isRecurring: false,
        isNightmare: false,
        tags: [],
        emotions: [],
        themes: [],
        symbols: [],
      }),
      getFilters: () => ({
        searchQuery: "",
        selectedFilter: "all",
      }),
      getShowNewDreamModal: () => false,
    },
    actions: {
      loadDreams: vi.fn(),
      loadStats: vi.fn(),
      saveDream: vi.fn(),
      updateDream: vi.fn(),
      deleteDream: vi.fn(),
      setFilters: vi.fn(),
      searchDreams: vi.fn(),
      setNewDream: vi.fn(),
      resetNewDream: vi.fn(),
      setShowNewDreamModal: vi.fn(),
    },
  },
}));

describe("DreamJournal", () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(DreamJournal);
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("loads dreams and stats on mount", () => {
      expect(dreams.actions.loadDreams).toHaveBeenCalled();
      expect(dreams.actions.loadStats).toHaveBeenCalled();
    });

    it("renders dream list correctly", () => {
      expect(wrapper.find("[data-test='dream-list']").exists()).toBe(true);
      expect(wrapper.findAll("[data-test='dream-card']")).toHaveLength(1);
    });

    it("displays dream statistics", () => {
      expect(wrapper.find("[data-test='dream-stats']").exists()).toBe(true);
      expect(wrapper.find("[data-test='total-dreams']").text()).toBe("1");
      expect(wrapper.find("[data-test='lucid-dreams']").text()).toBe("1");
    });
  });

  describe("Dream Management", () => {
    it("opens new dream modal", async () => {
      await wrapper.vm.openNewDreamModal();
      expect(dreams.actions.setShowNewDreamModal).toHaveBeenCalledWith(true);
    });

    it("saves new dream successfully", async () => {
      const newDream = {
        title: "New Dream",
        description: "Dream description",
        date: new Date().toISOString(),
        isLucid: true,
        isVivid: true,
        isRecurring: false,
        isNightmare: false,
        tags: ["test"],
        emotions: ["Joy"],
        themes: ["Flying"],
        symbols: ["Sky"],
      };

      vi.mocked(dreams.actions.saveDream).mockResolvedValueOnce(newDream);

      await wrapper.vm.handleSaveDream();

      expect(dreams.actions.saveDream).toHaveBeenCalled();
      expect(wrapper.vm.showNewDreamModal).toBe(false);
    });

    it("updates existing dream successfully", async () => {
      const updatedDream = {
        _id: "1",
        title: "Updated Dream",
        description: "Updated description",
      };

      vi.mocked(dreams.actions.updateDream).mockResolvedValueOnce(updatedDream);

      await wrapper.vm.handleUpdateDream();

      expect(dreams.actions.updateDream).toHaveBeenCalled();
      expect(wrapper.vm.showEditModal).toBe(false);
    });

    it("deletes dream successfully", async () => {
      vi.mocked(dreams.actions.deleteDream).mockResolvedValueOnce();

      await wrapper.vm.handleDeleteDream("1");
      await wrapper.vm.confirmDeleteDream();

      expect(dreams.actions.deleteDream).toHaveBeenCalledWith("1");
      expect(wrapper.vm.showDeleteConfirm).toBe(false);
    });
  });

  describe("Search and Filtering", () => {
    it("filters dreams by search query", async () => {
      const searchQuery = "flying";
      await wrapper.vm.handleSearchChange(searchQuery);

      expect(dreams.actions.setFilters).toHaveBeenCalledWith({ searchQuery });
      expect(dreams.actions.searchDreams).toHaveBeenCalledWith({ searchQuery });
    });

    it("filters dreams by type", async () => {
      const filter = "lucid";
      await wrapper.vm.handleFilterChange(filter);

      expect(dreams.actions.setFilters).toHaveBeenCalledWith({
        selectedFilter: filter,
      });
      expect(dreams.actions.searchDreams).toHaveBeenCalledWith({
        selectedFilter: filter,
      });
    });
  });

  describe("Dream Form Validation", () => {
    it("validates required fields", async () => {
      const invalidDream = {
        title: "",
        description: "",
        date: "",
      };

      await wrapper.vm.handleNewDreamChange("title", invalidDream.title);
      await wrapper.vm.handleNewDreamChange(
        "description",
        invalidDream.description,
      );
      await wrapper.vm.handleSaveDream();

      expect(wrapper.vm.errorMessage).toBe(
        "Please fill in all required fields",
      );
      expect(dreams.actions.saveDream).not.toHaveBeenCalled();
    });

    it("validates dream date", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      await wrapper.vm.handleNewDreamChange("date", futureDate.toISOString());
      await wrapper.vm.handleSaveDream();

      expect(wrapper.vm.errorMessage).toBe(
        "Dream date cannot be in the future",
      );
      expect(dreams.actions.saveDream).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("handles save dream errors", async () => {
      vi.mocked(dreams.actions.saveDream).mockRejectedValueOnce(
        new Error("Save failed"),
      );

      await wrapper.vm.handleSaveDream();

      expect(wrapper.vm.errorMessage).toBe("Failed to save dream");
    });

    it("handles update dream errors", async () => {
      vi.mocked(dreams.actions.updateDream).mockRejectedValueOnce(
        new Error("Update failed"),
      );

      await wrapper.vm.handleUpdateDream();

      expect(wrapper.vm.errorMessage).toBe("Failed to update dream");
    });

    it("handles delete dream errors", async () => {
      vi.mocked(dreams.actions.deleteDream).mockRejectedValueOnce(
        new Error("Delete failed"),
      );

      await wrapper.vm.handleDeleteDream("1");
      await wrapper.vm.confirmDeleteDream();

      expect(wrapper.vm.errorMessage).toBe("Failed to delete dream");
    });
  });
});
