<template>
  <div class="h-full">
    <SpinnerLoading></SpinnerLoading>
    <Toast></Toast>
    <Sidebar />
    <div class="relative h-full md:ml-64 bg-blueGray-100 dark:bg-warmGray-900">
      <Navbar />
      <main class="w-full px-4 mx-auto md:px-10">
        <router-view />
      </main>
      <Footer />
    </div>
  </div>
</template>
<script>
import Navbar from '@/components/Navbars/Navbar.vue';
import Sidebar from '@/components/Sidebar/Sidebar.vue';
import Footer from '@/components/Footers/Footer/Footer.vue';

export default {
  name: 'Layout',
  components: {
    Navbar,
    Sidebar,
    Footer,
  },
};
</script>
