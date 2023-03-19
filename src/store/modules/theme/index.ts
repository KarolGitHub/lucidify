import { reactive } from "vue";
import checkDarkMode from "@/plugins/darkModeMedia";

const storageTheme = reactive({
  theme: checkDarkMode() ? "1" : "0",
});

const setTheme = (theme: string): void => {
  storageTheme.theme = theme;
  localStorage.setItem("dark", theme);
};

export { storageTheme, setTheme };
