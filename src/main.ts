import Vue from "./plugins/app";
import { firestorePlugin } from "vuefire";
import VueAxios from "vue-axios";
// import { register } from "register-service-worker";
import axios from "axios";
import router from "./router";
import { messaging } from "@/server/firebase/firebase";
import { auth } from "@/store";
/* Css styles */
import "./assets/styles/index.css";
import "./assets/scss/styles.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@/assets/styles/tailwind.css";
import "@/assets/styles/utilities.css";

/* plugins */
Vue.use(firestorePlugin);
Vue.use(VueAxios, axios);
Vue.use(router);
Vue.config.globalProperties.$messaging = messaging;

import "./plugins";

// Initialize authentication state from localStorage
auth.actions.fetchAccessToken();

Vue.mount("#app");

// register("/firebase-messaging-sw.js");
import { useRegisterSW } from "virtual:pwa-register/vue";

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
  immediate: true,
  onRegistered(r) {
    r &&
      setInterval(
        async () => {
          await r.update();
        },
        60 * 60 * 1000,
      );
  },
});

if (!import.meta.env.DEV) {
  console.debug = function () {
    return;
  };
}
