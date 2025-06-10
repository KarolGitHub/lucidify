import { defineComponent } from "vue";
import Navbar from "@/components/Navbars/Navbar.vue";
import Sidebar from "@/components/Sidebar/Sidebar.vue";
import Footer from "@/components/Footers/Footer/Footer.vue";

export default defineComponent({
  name: "Layout",
  components: {
    Navbar,
    Sidebar,
    Footer,
  },
});
