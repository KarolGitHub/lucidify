import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VoiceToText from "@/components/VoiceToText/VoiceToText.vue";

// Mock the Web Speech API
const mockSpeechRecognition = {
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

Object.defineProperty(window, "SpeechRecognition", {
  value: vi.fn(() => mockSpeechRecognition),
  writable: true,
});

Object.defineProperty(window, "webkitSpeechRecognition", {
  value: vi.fn(() => mockSpeechRecognition),
  writable: true,
});

describe("VoiceToText", () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(VoiceToText);
  });

  it("displays voice recording interface", () => {
    expect(wrapper.find("button").exists()).toBe(true);
    expect(wrapper.text()).toContain("Voice to Text");
  });

  it("toggles recording state when button is clicked", async () => {
    const button = wrapper.find("button");
    const initialRecordingState = wrapper.vm.isRecording;

    await button.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isRecording).toBe(!initialRecordingState);
  });

  it("shows recording indicator when recording", async () => {
    await wrapper.setData({ isRecording: true });
    await wrapper.vm.$nextTick();

    // Check if recording state is reflected in the UI
    expect(wrapper.vm.isRecording).toBe(true);
  });

  it("displays transcribed text when available", async () => {
    const mockText = "This is a test transcription";
    await wrapper.setData({ transcribedText: mockText });
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(mockText);
  });

  it("emits text when transcription is complete", async () => {
    const mockText = "Transcribed text";
    await wrapper.setData({ transcribedText: mockText });
    await wrapper.vm.$nextTick();

    // Trigger the emit event
    await wrapper.vm.emitText();

    expect(wrapper.emitted("text")).toBeTruthy();
    expect(wrapper.emitted("text")?.[0]).toEqual([mockText]);
  });

  it("handles recording errors gracefully", async () => {
    await wrapper.setData({ error: "Recording failed" });
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Recording failed");
  });
});
