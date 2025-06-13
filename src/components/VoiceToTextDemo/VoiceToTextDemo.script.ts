import { defineComponent, ref } from "vue";
import VoiceToText from "../VoiceToText";

export default defineComponent({
  name: "VoiceToTextDemo",
  components: {
    VoiceToText,
  },
  setup() {
    const basicText = ref("");
    const advancedText = ref("");
    const dreamDescription = ref("");

    const handleRecordingStart = () => {
      console.log("Recording started");
    };

    const handleRecordingStop = () => {
      console.log("Recording stopped");
    };

    return {
      basicText,
      advancedText,
      dreamDescription,
      handleRecordingStart,
      handleRecordingStop,
    };
  },
});
