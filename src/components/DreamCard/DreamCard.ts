import { defineComponent, computed } from "vue";
import { Dream } from "@/interface/Dream";

export default defineComponent({
  name: "DreamCard",
  props: {
    dream: {
      type: Object as () => Dream,
      required: true,
    },
  },
  setup(props) {
    const formattedDate = computed(() => {
      return new Date(props.dream.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    });

    const formattedTime = computed(() => {
      return new Date(props.dream.date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    });

    const dreamPreview = computed(() => {
      return props.dream.description.length > 150
        ? props.dream.description.substring(0, 150) + "..."
        : props.dream.description;
    });

    const mood = computed(() => {
      return props.dream.emotions[0] || null;
    });

    const lucidityLevel = computed(() => {
      return props.dream.isLucid ? 10 : 0;
    });

    return {
      formattedDate,
      formattedTime,
      dreamPreview,
      mood,
      lucidityLevel,
    };
  },
});
