import { defineComponent, ref, onMounted, onUnmounted, watch } from "vue";

export default defineComponent({
  name: "VoiceToText",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "Start speaking...",
    },
    language: {
      type: String,
      default: "en-US",
    },
    continuous: {
      type: Boolean,
      default: false,
    },
    interimResults: {
      type: Boolean,
      default: true,
    },
    showSettings: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "update:modelValue",
    "transcript-change",
    "recording-start",
    "recording-stop",
  ],
  setup(props, { emit }) {
    const isRecording = ref(false);
    const isSupported = ref(false);
    const isProcessing = ref(false);
    const transcript = ref("");
    const error = ref("");
    const successMessage = ref("");
    const recordingTime = ref(0);
    const continuousMode = ref(props.continuous);
    const interimResults = ref(props.interimResults);
    const selectedLanguage = ref(props.language);

    let recognition: SpeechRecognition | null = null;
    let recordingTimer: NodeJS.Timeout | null = null;

    // Check if Web Speech API is supported
    const checkSupport = () => {
      isSupported.value =
        "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
      if (!isSupported.value) {
        error.value =
          "Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.";
      }
    };

    // Initialize speech recognition
    const initSpeechRecognition = () => {
      if (!isSupported.value) return;

      const SpeechRecognition =
        window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition = new SpeechRecognition();

      recognition.continuous = continuousMode.value;
      recognition.interimResults = interimResults.value;
      recognition.lang = selectedLanguage.value;

      recognition.onstart = () => {
        isRecording.value = true;
        isProcessing.value = false;
        error.value = "";
        successMessage.value = "";
        recordingTime.value = 0;
        emit("recording-start");

        // Start recording timer
        recordingTimer = setInterval(() => {
          recordingTime.value++;
        }, 1000);
      };

      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        transcript.value = finalTranscript || interimTranscript;

        if (finalTranscript) {
          // Emit the final transcript
          const newValue =
            props.modelValue + (props.modelValue ? " " : "") + finalTranscript;
          emit("update:modelValue", newValue);
          emit("transcript-change", finalTranscript);

          // Show success message
          successMessage.value = "Voice input added successfully!";
          setTimeout(() => {
            successMessage.value = "";
          }, 3000);
        }
      };

      recognition.onerror = (event) => {
        isRecording.value = false;
        isProcessing.value = false;
        stopRecordingTimer();

        switch (event.error) {
          case "not-allowed":
            error.value =
              "Microphone access denied. Please allow microphone access and try again.";
            break;
          case "no-speech":
            error.value = "No speech detected. Please try again.";
            break;
          case "audio-capture":
            error.value = "Audio capture error. Please check your microphone.";
            break;
          case "network":
            error.value =
              "Network error. Please check your internet connection.";
            break;
          case "service-not-allowed":
            error.value =
              "Speech recognition service not allowed. Please check your browser settings.";
            break;
          default:
            error.value = `Error: ${event.error}`;
        }
      };

      recognition.onend = () => {
        isRecording.value = false;
        isProcessing.value = false;
        transcript.value = "";
        stopRecordingTimer();
        emit("recording-stop");
      };
    };

    // Stop recording timer
    const stopRecordingTimer = () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
      }
    };

    // Toggle recording
    const toggleRecording = () => {
      if (!isSupported.value || !recognition || isProcessing.value) return;

      if (isRecording.value) {
        recognition.stop();
      } else {
        try {
          isProcessing.value = true;
          recognition.start();
        } catch (err) {
          isProcessing.value = false;
          error.value = "Failed to start recording. Please try again.";
        }
      }
    };

    // Get button title
    const getButtonTitle = () => {
      if (!isSupported.value) {
        return "Voice recording not supported";
      }
      if (isProcessing.value) {
        return "Processing...";
      }
      return isRecording.value ? "Stop recording" : "Start voice recording";
    };

    // Format time
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Watch for prop changes
    watch(continuousMode, (newValue) => {
      if (recognition) {
        recognition.continuous = newValue;
      }
    });

    watch(interimResults, (newValue) => {
      if (recognition) {
        recognition.interimResults = newValue;
      }
    });

    watch(selectedLanguage, (newValue) => {
      if (recognition) {
        recognition.lang = newValue;
      }
    });

    // Cleanup
    const cleanup = () => {
      if (recognition && isRecording.value) {
        recognition.stop();
      }
      stopRecordingTimer();
    };

    onMounted(() => {
      checkSupport();
      initSpeechRecognition();
    });

    onUnmounted(() => {
      cleanup();
    });

    return {
      isRecording,
      isSupported,
      isProcessing,
      transcript,
      error,
      successMessage,
      recordingTime,
      continuousMode,
      interimResults,
      selectedLanguage,
      toggleRecording,
      getButtonTitle,
      formatTime,
    };
  },
});
