<template>
  <div class="h-full">
    <SpinnerLoading></SpinnerLoading>
    <Toast></Toast>
    <navbar />
    <main>
      <section class="relative w-full h-full py-40 min-h-screen">
        <div class="absolute top-0 w-full h-full bg-blueGray-800 bg-no-repeat bg-cover"
          :style="`background-image: url('${registerBg}');`"></div>
        <router-view />
        <footer-small absolute />
      </section>
    </main>
  </div>
</template>
<script>
import Navbar from '@/components/Navbars/AuthNavbar.vue';
import FooterSmall from '@/components/Footers/FooterSmall/FooterSmall.vue';

import registerBg from '@/assets/img/register-bg.png';

export default {
  components: {
    Navbar,
    FooterSmall,
  },
  data() {
    return {
      registerBg,
    };
  },
};
</script>
