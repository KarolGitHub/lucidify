<template>
  <div id="app" class="h-screen">
    <router-view />
    <SpinnerLoading />
    <Toast />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SpinnerLoading from '@/components/Loaders/SpinnerLoading/SpinnerLoading.vue'
import Toast from '@/components/shared/Toast/Toast.vue'

export default defineComponent({
  name: 'App',
  components: {
    SpinnerLoading,
    Toast
  }
})
</script>

<style>
/* Ensure proper height handling */
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Ensure router-view takes full available height */
#app>.router-view {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
