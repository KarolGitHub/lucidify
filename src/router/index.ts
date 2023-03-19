import { createRouter, createWebHistory } from "vue-router";
import routes from "@/router/routes";
import { auth } from "@/store";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  auth.actions.fetchAccessToken();
  const accessToken = auth.getters.getAccessToken();

  if (!accessToken && !to.fullPath.includes("/auth")) {
    next("/auth/login");
  }
  if (accessToken && to.fullPath === "/auth/login") {
    next("/dashboard");
  }
  next();
});

export default router;
