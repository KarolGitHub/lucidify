import { defineComponent } from "vue";
import Navbar from "@/components/Navbars/AuthNavbar.vue";
import FooterSmall from "@/components/Footers/FooterSmall/FooterSmall.vue";
import registerBg from "@/assets/img/register-bg.png";

export default defineComponent({
  name: "Auth",
  components: {
    Navbar,
    FooterSmall,
  },
  data() {
    return {
      registerBg,
    };
  },
});
