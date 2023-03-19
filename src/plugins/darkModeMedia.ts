const checkDarkMode = () => {
  const dark = localStorage.getItem("dark");
  if (dark) {
    if (+dark) {
      return true;
    }
    return false;
  }
  if (window.matchMedia("(prefers-color-scheme: dark)")?.matches) {
    return true;
  }
  return false;
};
if (checkDarkMode()) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

export default checkDarkMode;
