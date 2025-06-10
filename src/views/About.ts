import { defineComponent } from "vue";
import Navbar from "@/components/Navbars/AuthNavbar.vue";
import FooterComponent from "@/components/Footers/Footer/Footer.vue";
import aboutBg from "@/assets/img/register-bg.png";

export default defineComponent({
  name: "About",
  components: {
    Navbar,
    FooterComponent,
  },
  data() {
    return {
      aboutBg,
    };
  },
});
