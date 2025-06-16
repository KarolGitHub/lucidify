<template>
  <div class="flex items-center justify-between w-full">
    <svg v-if="!darkMode" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 opacity-75 text-blueGray-700" fill="none"
      viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
    <svg v-if="darkMode" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white opacity-75" fill="none"
      viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
    <div class="text-xs font-bold uppercase dark:text-white text-blueGray-700">
      Dark Mode
    </div>
    <div>
      <label for="toogleA" class="flex items-center cursor-pointer">
        <!-- toggle -->
        <div class="relative">
          <!-- input -->
          <input v-model="darkMode" @change="changeStateTheme" id="toogleA" type="checkbox" class="hidden" />
          <!-- line -->
          <div class="h-2 bg-gray-400 rounded-full shadow-inner toggle__line w-7"></div>
          <!-- dot -->
          <div class="absolute inset-y-0 left-0 w-4 h-4 rounded-full shadow toggle__dot"></div>
        </div>
        <!-- label -->
      </label>
    </div>
    <!-- Toggle Button -->
  </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { setTheme } from "@/store/modules/theme";
import checkDarkMode from "@/plugins/darkModeMedia";

export default {
  setup() {
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

    return {
      darkMode,
      changeStateTheme,
    };
  },
};
</script>

<style scoped lang="scss">
.toggle__dot {
  top: -0.25rem;
  left: -0.25rem;
  transition: all 0.3s ease-in-out;
  background-color: #48bb78;
}

input:checked~.toggle__dot {
  transform: translateX(100%);
  background-color: white;
}
</style>
