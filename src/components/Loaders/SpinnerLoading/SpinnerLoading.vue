<template>
  <div v-if="storageLoading.loading"
    class="fixed top-0 bottom-0 left-0 right-0 z-50 flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-gray-700 opacity-75">
    <div class="w-12 h-12 mb-4 ease-linear border-4 border-t-4 border-gray-200 rounded-full loader"></div>
    <h2 class="text-xl font-semibold text-center text-white">
      {{ storageLoading.message }}
    </h2>
    <p class="w-1/3 text-center text-white">
      This may take a few seconds, please don't close this page.
    </p>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { loadingStore } from "@/store";

export default defineComponent({
  name: "SpinnerLoading",
  setup() {
    const storageLoading = computed(() => loadingStore.getters.getLoading());

    return {
      storageLoading,
    };
  },
});
</script>

<style scoped lang="scss">
.loader {
  border-top-color: #3498db;
  -webkit-animation: spinner 1.5s linear infinite;
  animation: spinner 1.5s linear infinite;
}

@-webkit-keyframes spinner {
  0% {
    -webkit-transform: rotate(0deg);
  }

  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
