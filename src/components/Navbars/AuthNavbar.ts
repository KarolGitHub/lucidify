import { defineComponent } from "vue";
import PagesDropdown from "@/components/Dropdowns/PagesDropdown/PagesDropdown.vue";
import config from "@/config";
import Cookies from "js-cookie";
import { notifications } from "@/store";

interface Toast {
  body: string;
  tittle: string;
  type: string;
  show: boolean;
}

export default defineComponent({
  name: "AuthNavbar",
  components: {
    PagesDropdown,
  },
  data() {
    return {
      navbarOpen: false,
      deferredPrompt: null as any,
      config,
    };
  },
  created() {
    window.addEventListener("beforeinstallprompt", (e: any) => {
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

      await this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          const toast: Toast = {
            body: "App installed successfully",
            tittle: "Success",
            type: "success",
            show: true,
          };
          notifications.actions.presentToast(toast);
        }
        this.deferredPrompt = null;
      });
    },
  },
});
