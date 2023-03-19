<template>
  <nav class="top-0 absolute z-50 w-full flex flex-wrap items-center justify-between px-2 py-3 navbar-expand-lg">
    <div class="container px-4 mx-auto flex flex-wrap items-center justify-between">
      <div class="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
        <router-link
          class="text-white text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase"
          to="/">
          Vue Dashboard
        </router-link>
        <button
          class="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
          type="button" @click="setNavbarOpen">
          <i class="text-white fas fa-bars"></i>
        </button>
      </div>
      <div id="example-navbar-warning" class="lg:flex flex-grow items-center bg-white lg:bg-opacity-0 lg:shadow-none"
        :class="[navbarOpen ? 'block rounded shadow-lg' : 'hidden']">
        <ul class="flex flex-col lg:flex-row list-none lg:ml-auto">
          <li class="flex items-center">
            <PagesDropdown />
          </li>
          <li class="flex items-center">
            <a class="lg:text-white lg:hover:text-blueGray-200 text-blueGray-700 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
              :href="`https://www.facebook.com/sharer/sharer.php?u=${config.redirectUrl}`" target="_blank">
              <i class="lg:text-blueGray-200 text-blueGray-400 fab fa-facebook text-lg leading-lg" />
              <span class="lg:hidden inline-block ml-2">Share</span>
            </a>
          </li>

          <li class="flex items-center">
            <a class="lg:text-white lg:hover:text-blueGray-200 text-blueGray-700 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
              :href="`https://twitter.com/intent/tweet?url=${config.redirectUrl}&text=Start%20your%20development%20with%20a%20Free%20VueJS%203%20and%20Tailwind%20CSS%20Admin%20Dashboard.%20`"
              target="_blank">
              <i class="lg:text-blueGray-200 text-blueGray-400 fab fa-twitter text-lg leading-lg" />
              <span class="lg:hidden inline-block ml-2">Tweet</span>
            </a>
          </li>

          <li class="flex items-center">
            <a class="lg:text-white lg:hover:text-blueGray-200 text-blueGray-700 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
              :href="config.sourceCodeLink" target="_blank">
              <i class="lg:text-blueGray-200 text-blueGray-400 fab fa-github text-lg leading-lg" />
              <span class="lg:hidden inline-block ml-2">Star</span>
            </a>
          </li>

          <li class="flex items-center">
            <a class="hover:text-blueGray-500 text-blueGray-700 px-3 py-2 flex items-center text-xs uppercase font-bold"
              :href="config.linkedinLink" target="_blank">
              <i class="text-blueGray-400 fab fa-linkedin text-lg leading-lg" />
              <span class="lg:hidden inline-block ml-2">Linkedin</span>
            </a>
          </li>

          <li v-if="deferredPrompt" class="flex items-center">
            <button
              class="bg-white text-blueGray-700 active:bg-blueGray-50 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150"
              type="button" @click="install">
              <i class="fas fa-arrow-alt-circle-down"></i> Download
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import PagesDropdown from '@/components/Dropdowns/PagesDropdown/PagesDropdown.vue';
import config from "@/config";
import Cookies from "js-cookie";
import { notifications } from "@/store";

export default {
  components: {
    PagesDropdown,
  },
  data() {
    return {
      navbarOpen: false,
      deferredPrompt: null,
      config
    };
  },
  created() {
    window.addEventListener("beforeinstallprompt", e => {
      e.preventDefault();
      if (Cookies.get("add-to-home-screen") === undefined) {
        this.deferredPrompt = e;
      }
    });
  },
  methods: {
    setNavbarOpen() {
      this.navbarOpen = !this.navbarOpen;
    },
    async install() {
      await this.deferredPrompt.prompt();

      await this.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          const toast = {
            body: "App installed successfully",
            tittle: "Success",
            type: "success",
            show: true,
          };
          notifications.actions.presentToast(toast);
        }
        this.deferredPrompt = null
      })
    }
  },
};
</script>
