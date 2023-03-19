import { defineComponent, ref } from "vue";
import config from "@/config";

export default defineComponent({
  name: "FooterSmall",
  props: {
    absolute: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const date = ref<number>(new Date().getFullYear());
    const {
      blogLink,
      contactLink,
      githubLink,
      linkedinLink,
      portfolioLink,
      aboutLink,
    } = config;
    return {
      blogLink,
      contactLink,
      githubLink,
      linkedinLink,
      portfolioLink,
      aboutLink,
      date,
    };
  },
});
