<template>
  <div id="app">
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

<style></style>
