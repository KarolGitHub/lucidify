import Vue from "./plugins/app";
import { firestorePlugin } from "vuefire";
import VueAxios from "vue-axios";
import axios from "axios";
import router from "./router";
import { messaging } from "@/server/firebase/firebase";
/* Css styles */
import "./assets/styles/index.css";
import "./assets/scss/styles.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@/assets/styles/tailwind.css";

/* plugins */
Vue.use(firestorePlugin);
Vue.use(VueAxios, axios);
Vue.use(router);
Vue.config.globalProperties.$messaging = messaging;

import "./plugins";

Vue.mount("#app");

import { useRegisterSW } from "virtual:pwa-register/vue";

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
  immediate: true,
  onRegistered(r) {
    r &&
      setInterval(async () => {
        await r.update();
      }, 60 * 60 * 1000);
  },
});

if (!import.meta.env.DEV) {
  console.debug = function () {
    return;
  };
}
