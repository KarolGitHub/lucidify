import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import VoiceToText from "../VoiceToText/VoiceToText.vue";

// Mock the Web Speech API
const mockSpeechRecognition = vi.fn();
const mockSpeechRecognitionInstance = {
  continuous: false,
  interimResults: true,
  lang: "en-US",
  start: vi.fn(),
  stop: vi.fn(),
  onstart: null as (() => void) | null,
  onresult: null as ((event: any) => void) | null,
  onerror: null as ((event: any) => void) | null,
  onend: null as (() => void) | null,
};

vi.stubGlobal("SpeechRecognition", mockSpeechRecognition);
vi.stubGlobal("webkitSpeechRecognition", mockSpeechRecognition);

describe("VoiceToText", () => {
  let wrapper: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockSpeechRecognition.mockReturnValue(mockSpeechRecognitionInstance);

    // Reset instance properties
    mockSpeechRecognitionInstance.onstart = null;
    mockSpeechRecognitionInstance.onresult = null;
    mockSpeechRecognitionInstance.onerror = null;
    mockSpeechRecognitionInstance.onend = null;

    wrapper = mount(VoiceToText, {
      props: {
        modelValue: "",
        placeholder: "Start speaking...",
        continuous: false,
        interimResults: true,
        language: "en-US",
      },
    });
  });

  describe("Initialization", () => {
    it("initializes with default props", () => {
      expect(wrapper.vm.placeholder).toBe("Start speaking...");
      expect(wrapper.vm.language).toBe("en-US");
      expect(wrapper.vm.continuous).toBe(false);
      expect(wrapper.vm.interimResults).toBe(true);
    });

    it("checks for browser support on mount", () => {
      expect(wrapper.vm.isSupported).toBe(true);
    });
  });

  describe("Recording Controls", () => {
    it("starts recording when toggleRecording is called", async () => {
      await wrapper.vm.toggleRecording();
      expect(mockSpeechRecognitionInstance.start).toHaveBeenCalled();
      expect(wrapper.vm.isRecording).toBe(true);
    });

    it("stops recording when toggleRecording is called while recording", async () => {
      // Start recording
      await wrapper.vm.toggleRecording();
      // Stop recording
      await wrapper.vm.toggleRecording();
      expect(mockSpeechRecognitionInstance.stop).toHaveBeenCalled();
    });

    it("emits recording-start event when recording starts", async () => {
      await wrapper.vm.toggleRecording();
      expect(wrapper.emitted("recording-start")).toBeTruthy();
    });

    it("emits recording-stop event when recording stops", async () => {
      // Start recording
      await wrapper.vm.toggleRecording();
      // Stop recording
      await wrapper.vm.toggleRecording();
      expect(wrapper.emitted("recording-stop")).toBeTruthy();
    });
  });

  describe("Speech Recognition Events", () => {
    it("handles successful speech recognition", async () => {
      const finalTranscript = "Hello world";
      const event = {
        resultIndex: 0,
        results: [[{ transcript: finalTranscript, isFinal: true }]],
      };

      await wrapper.vm.toggleRecording();
      mockSpeechRecognitionInstance.onresult?.(event);

      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("transcript-change")).toBeTruthy();
      expect(wrapper.vm.successMessage).toBe("Voice input added successfully!");
    });

    it("handles interim results when enabled", async () => {
      const interimTranscript = "Hello";
      const event = {
        resultIndex: 0,
        results: [[{ transcript: interimTranscript, isFinal: false }]],
      };

      await wrapper.vm.toggleRecording();
      mockSpeechRecognitionInstance.onresult?.(event);

      expect(wrapper.vm.transcript).toBe(interimTranscript);
    });

    it("handles recognition errors", async () => {
      const errorEvent = { error: "not-allowed" };

      await wrapper.vm.toggleRecording();
      mockSpeechRecognitionInstance.onerror?.(errorEvent);

      expect(wrapper.vm.error).toBe(
        "Microphone access denied. Please allow microphone access and try again.",
      );
      expect(wrapper.vm.isRecording).toBe(false);
    });
  });

  describe("Settings and Configuration", () => {
    it("updates language when changed", async () => {
      const newLanguage = "es-ES";
      await wrapper.setProps({ language: newLanguage });
      expect(mockSpeechRecognitionInstance.lang).toBe(newLanguage);
    });

    it("updates continuous mode when changed", async () => {
      await wrapper.setProps({ continuous: true });
      expect(mockSpeechRecognitionInstance.continuous).toBe(true);
    });

    it("updates interim results when changed", async () => {
      await wrapper.setProps({ interimResults: false });
      expect(mockSpeechRecognitionInstance.interimResults).toBe(false);
    });
  });

  describe("Cleanup", () => {
    it("stops recording and cleans up on unmount", async () => {
      // Start recording
      await wrapper.vm.toggleRecording();
      // Unmount component
      wrapper.unmount();
      expect(mockSpeechRecognitionInstance.stop).toHaveBeenCalled();
    });
  });
});
