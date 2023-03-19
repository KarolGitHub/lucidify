<template>
  <div class="h-full">
    <SpinnerLoading></SpinnerLoading>
    <Toast></Toast>
    <Sidebar />
    <div class="h-full relative md:ml-64 bg-blueGray-100 dark:bg-warmGray-900">
      <Navbar />
      <main class="px-4 md:px-10 mx-auto w-full -m-24">
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
