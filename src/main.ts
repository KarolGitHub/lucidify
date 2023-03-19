import Vue from "./plugins/app";
import { firestorePlugin } from "vuefire";
import VueAxios from "vue-axios";
import axios from "axios";
import router from "./router";

/* Css styles */
import "./assets/styles/index.css";
import "./assets/scss/styles.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@/assets/styles/tailwind.css";

/* plugins */
Vue.use(firestorePlugin);
Vue.use(VueAxios, axios);
Vue.use(router);

import "./plugins";

/* mount app*/
Vue.mount("#app");

// @ts-ignore
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {},
  onOfflineReady() {},
});

function handleSWManualUpdates(
  swRegistration: ServiceWorkerRegistration | undefined
) {
  // noop
}

function handleSWRegisterError(error: any) {
  // noop
}

try {
  const updateSW = registerSW({
    immediate: true,
    onOfflineReady() {
      console.debug("onOfflineReady");
    },
    onNeedRefresh() {
      console.debug("onNeedRefresh");
    },
    onRegistered(swRegistration: ServiceWorkerRegistration) {
      swRegistration && handleSWManualUpdates(swRegistration);
    },
    onRegisterError(e: Error) {
      handleSWRegisterError(e);
    },
  });
} catch {
  console.debug("PWA disabled.");
}

if (!import.meta.env.DEV) {
  console.debug = function () {};
}
