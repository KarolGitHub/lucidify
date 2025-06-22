import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import CardRealityCheckScheduler from "../Cards/CardRealityCheckScheduler/CardRealityCheckScheduler.vue";

// Mock the store before importing the component
vi.mock("@/store", () => ({
  realityCheckScheduler: {
    getters: {
      getRealityCheckScheduler: vi.fn(() => ({
        enabled: false,
        frequency: "daily",
        time: "09:00",
        days: ["monday", "wednesday", "friday"],
        notificationEnabled: true,
        customMessage: "Are you dreaming?",
      })),
      getSettings: vi.fn(() => ({
        enabled: false,
        frequency: "daily",
        time: "09:00",
        days: ["monday", "wednesday", "friday"],
        notificationEnabled: true,
        customMessage: "Are you dreaming?",
      })),
    },
    actions: {
      updateRealityCheckScheduler: vi.fn(),
      toggleRealityCheckScheduler: vi.fn(),
    },
  },
}));

// Mock global Notification
global.Notification = {
  permission: "granted",
  requestPermission: vi.fn(() => Promise.resolve("granted")),
} as any;

// Mock notification permissions
Object.defineProperty(navigator, "permissions", {
  value: {
    query: vi.fn(() => Promise.resolve({ state: "granted" })),
  },
  writable: true,
});

describe("CardRealityCheckScheduler", () => {
  let wrapper: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    wrapper = mount(CardRealityCheckScheduler);
  });

  describe("UI Rendering", () => {
    it("renders the component correctly", () => {
      expect(wrapper.find(".card-reality-check-scheduler").exists()).toBe(true);
      expect(wrapper.find("h3").text()).toBe("Reality Check Scheduler");
    });

    it("displays the main toggle switch", () => {
      const toggle = wrapper.find('input[type="checkbox"]');
      expect(toggle.exists()).toBe(true);
    });

    it("shows frequency selector", () => {
      const frequencySelect = wrapper.find('select[name="frequency"]');
      expect(frequencySelect.exists()).toBe(true);
    });

    it("shows time picker", () => {
      const timeInput = wrapper.find('input[type="time"]');
      expect(timeInput.exists()).toBe(true);
    });

    it("displays day checkboxes", () => {
      const dayCheckboxes = wrapper.findAll(
        'input[type="checkbox"][name^="day-"]',
      );
      expect(dayCheckboxes.length).toBeGreaterThan(0);
    });

    it("shows notification toggle", () => {
      const notificationToggle = wrapper.find('input[name="notification"]');
      expect(notificationToggle.exists()).toBe(true);
    });

    it("displays custom message input", () => {
      const messageInput = wrapper.find('textarea[name="customMessage"]');
      expect(messageInput.exists()).toBe(true);
    });

    it("shows save button", () => {
      const saveButton = wrapper.find('button[type="submit"]');
      expect(saveButton.exists()).toBe(true);
      expect(saveButton.text()).toContain("Save");
    });
  });

  describe("Toggle Functionality", () => {
    it("toggles reality check scheduler when main switch is clicked", async () => {
      const toggle = wrapper.find('input[type="checkbox"]');
      await toggle.setValue(true);

      // Check if the component handles the toggle
      expect(wrapper.vm.enabled).toBe(true);
    });

    it("toggles notification when notification switch is clicked", async () => {
      const notificationToggle = wrapper.find('input[name="notification"]');
      await notificationToggle.setValue(false);

      // Check if the component handles the notification toggle
      expect(wrapper.vm.notificationEnabled).toBe(false);
    });
  });

  describe("Input Handling", () => {
    it("updates frequency when changed", async () => {
      const frequencySelect = wrapper.find('select[name="frequency"]');
      await frequencySelect.setValue("weekly");

      expect(wrapper.vm.frequency).toBe("weekly");
    });

    it("updates time when changed", async () => {
      const timeInput = wrapper.find('input[type="time"]');
      await timeInput.setValue("14:30");

      expect(wrapper.vm.time).toBe("14:30");
    });

    it("updates custom message when changed", async () => {
      const messageInput = wrapper.find('textarea[name="customMessage"]');
      await messageInput.setValue("Is this real?");

      expect(wrapper.vm.customMessage).toBe("Is this real?");
    });

    it("toggles individual days when checkboxes are clicked", async () => {
      const mondayCheckbox = wrapper.find('input[name="day-monday"]');
      await mondayCheckbox.setValue(false);

      // Check if the component handles day toggling
      expect(wrapper.vm.days).not.toContain("monday");
    });
  });

  describe("Save Action", () => {
    it("calls save action when form is submitted", async () => {
      const form = wrapper.find("form");
      await form.trigger("submit");

      // Check if save functionality is triggered
      expect(wrapper.emitted("save")).toBeTruthy();
    });

    it("shows success message after successful save", async () => {
      const form = wrapper.find("form");
      await form.trigger("submit");

      // Wait for any async operations
      await wrapper.vm.$nextTick();

      // Check if success message is displayed (implementation may vary)
      expect(wrapper.text()).toContain("Saved");
    });
  });

  describe("Notification Permissions", () => {
    it("requests notification permission when enabled", async () => {
      const notificationToggle = wrapper.find('input[name="notification"]');
      await notificationToggle.setValue(true);

      // Should check or request notification permissions
      expect(navigator.permissions.query).toHaveBeenCalledWith({
        name: "notifications",
      });
    });

    it("handles notification permission denied", async () => {
      // Mock denied permission
      Object.defineProperty(global.Notification, "permission", {
        value: "denied",
        writable: true,
      });

      const notificationToggle = wrapper.find('input[name="notification"]');
      await notificationToggle.setValue(true);

      // Should handle denied permission gracefully
      expect(wrapper.text()).toContain("Permission");
    });
  });

  describe("Error Handling", () => {
    it("handles save errors gracefully", async () => {
      // Mock save action to throw error
      wrapper.vm.saveSettings = vi
        .fn()
        .mockRejectedValueOnce(new Error("Save failed"));

      const form = wrapper.find("form");
      await form.trigger("submit");

      await wrapper.vm.$nextTick();

      // Should show error message
      expect(wrapper.text()).toContain("Error");
    });

    it("handles permission request errors", async () => {
      // Mock permission query to throw error
      navigator.permissions.query = vi.fn(() =>
        Promise.reject(new Error("Permission denied")),
      );

      const notificationToggle = wrapper.find('input[name="notification"]');
      await notificationToggle.setValue(true);

      // Should handle permission error gracefully
      expect(wrapper.text()).toContain("Permission");
    });
  });

  describe("Loading States", () => {
    it("shows loading state during save", async () => {
      // Mock async save action
      wrapper.vm.saveSettings = vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      const form = wrapper.find("form");
      await form.trigger("submit");

      // Should show loading indicator
      expect(wrapper.find(".loading").exists()).toBe(true);
    });
  });
});
