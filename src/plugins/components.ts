import Vue from "./app";

/* components */
import Layout from "@/layout/Layout.vue";
import Skeleton from "@/components/shared/SkeletonLoading/Skeleton.vue";
import Toast from "@/components/shared/Toast/Toast.vue";
import SpinnerLoading from "@/components/Loaders/SpinnerLoading/SpinnerLoading.vue";
import FooterMain from "@/components/Footers/Footer/FooterMain.vue";

/* npm packages */
import DOMPurify from "dompurify";

/* components */
Vue.component("Skeleton", Skeleton);
Vue.component("Layout", Layout);
Vue.component("Toast", Toast);
Vue.component("SpinnerLoading", SpinnerLoading);
Vue.component("FooterMain", FooterMain);

/* directives */
Vue.directive("sane-html", (el, binding) => {
  el.innerHTML = DOMPurify.sanitize(binding.value);
});
