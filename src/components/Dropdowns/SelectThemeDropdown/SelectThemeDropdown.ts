import { ref } from "vue";
import { setTheme } from "@/store/modules/theme";
import checkDarkMode from "@/plugins/darkModeMedia";

const darkMode = ref<boolean>(checkDarkMode());

const changeStateTheme = (): void => {
  if (darkMode.value) {
    document.documentElement.classList.add("dark");
    setTheme("1");
    return;
  }
  document.documentElement.classList.remove("dark");
  setTheme("0");
};

export default {
  setup() {
    return {
      darkMode,
      changeStateTheme,
    };
  },
};
