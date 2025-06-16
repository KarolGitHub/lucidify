<template>
  <transition name="slide-fade">
    <div @click="onCloseToast" v-if="toast.show"
      class="alert-toast z-2 fixed bottom-0 right-0 m-8 w-5/6 md:w-full max-w-sm">
      <input type="checkbox" class="hidden" id="footertoast" />

      <label :class="{ 'bg-green-500': toast.type === 'success', 'bg-red-500': toast.type === 'error' }"
        class="close cursor-pointer flex items-start justify-between w-full p-2 h-auto rounded shadow-lg text-white"
        title="close" for="footertoast">
        {{ toast.body }}

        <svg class="fill-current text-white" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
          viewBox="0 0 18 18">
          <path
            d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z">
          </path>
        </svg>
      </label>
    </div>
  </transition>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { Toast } from "@/interface/Toast";
import { notifications } from "@/store";

export default defineComponent({
  name: "Toast",
  setup() {
    const toast = computed<Toast>(() => notifications.getters.getToastState());
    const onCloseToast = () => {
      const toastLocal = {
        show: false,
        title: "",
        body: "",
        type: "",
      };
      notifications.actions.presentToast(toastLocal);
    };
    return {
      toast,
      onCloseToast,
    };
  },
});
</script>

<style scoped lang="scss">
.slide-fade-enter-active {
  transition: all 0.9s ease;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to

/* .slide-fade-leave-active below version 2.1.8 */
  {
  transform: translateX(10px);
  opacity: 0;
}
</style>
