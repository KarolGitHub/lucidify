import { createRouter, createWebHistory } from "vue-router";
import routes from "@/router/routes";
import { auth } from "@/store";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  // Wait for auth state to be fetched
  await auth.actions.fetchAccessToken();
  const accessToken = auth.getters.getAccessToken();

  if (!accessToken && !to.fullPath.includes("/auth")) {
    next("/auth/login");
  } else if (accessToken && to.fullPath === "/auth/login") {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
