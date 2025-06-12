// @ts-nocheck
import mutations from "./mutations";
import router from "@/router";
import { loadingStore, notifications } from "@/store";
import authService from "@/services/auth";
import { Login, Register } from "@/interface/Auth";
import { Toast } from "@/interface/Toast";

export default {
  async fetchAccessToken(): Promise<void> {
    // Wait for Firebase auth state to be ready
    if (!authService.isAuthStateReady()) {
      console.log("Waiting for Firebase auth state to be ready...");
      await authService.waitForAuthState();
    }

    // Check if user is authenticated via Firebase
    if (authService.isAuthenticated()) {
      const user = authService.getCurrentUser();
      if (user) {
        const userData = {
          id: user.uid,
          accessToken: await user.getIdToken(),
          displayName: user.displayName,
          email: user.email,
          emailVerified: user.emailVerified,
          phoneNumber: user.phoneNumber,
          photoURL: user.photoURL,
        };

        mutations.setAuth(true, userData);
        localStorage.setItem("accessToken", userData.accessToken);
        localStorage.setItem("userData", JSON.stringify(userData));
        console.log("Auth state restored from Firebase");
      }
    } else {
      // User is not authenticated, clear state
      mutations.setAuth(false);
      mutations.setAccessToken(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      console.log("No authenticated user found");
    }
  },

  async login(loginForm: Login): Promise<void> {
    try {
      const response = await authService.login(loginForm);
      if (response.user) {
        console.debug(
          "💪 ~ file: actions.ts:15 ~ login ~ response.user",
          response.user,
        );

        const token = await response.user.getIdToken();
        const userData = {
          id: response.user.uid,
          accessToken: token,
          displayName: response.user.displayName,
          email: response.user.email,
          emailVerified: response.user.emailVerified,
          phoneNumber: response.user.phoneNumber,
          photoURL: response.user.photoURL,
        };

        mutations.setAuth(true, userData);
        localStorage.setItem("accessToken", token);
        localStorage.setItem("userData", JSON.stringify(userData));

        await router.push({
          name: "Dashboard",
        });
        const toast: Toast = {
          body: "Logged in successfully",
          tittle: "Success",
          type: "success",
          show: true,
        };
        notifications.actions.presentToast(toast);
      }
    } catch (e: any) {
      const toast: Toast = {
        body: "Incorrect email or password",
        tittle: "Error",
        type: "error",
        show: true,
      };
      notifications.actions.presentToast(toast);
    }
  },

  async logout(): Promise<void> {
    try {
      await authService.logout();
      mutations.setAuth(false);
      mutations.setAccessToken(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      await router.push("/auth/login");
      const toast: Toast = {
        body: "Logged out successfully",
        tittle: "Success",
        type: "success",
        show: true,
      };
      notifications.actions.presentToast(toast);
    } catch (e: any) {
      const toast: Toast = {
        body: "Unexpected error",
        tittle: "Error",
        type: "error",
        show: true,
      };
      notifications.actions.presentToast(toast);
    }
  },

  async register(registerForm: Register): Promise<void> {
    try {
      const response = await authService.register(registerForm);
      const toast: Toast = {
        body: "Registration completed successfully",
        tittle: "Success",
        type: "success",
        show: true,
      };
      notifications.actions.presentToast(toast);

      await router.push({
        name: "login",
      });
    } catch (e: any) {
      const toast: Toast = {
        body: e.message,
        tittle: e.code,
        type: "error",
        show: true,
      };
      notifications.actions.presentToast(toast);
    }
  },
};
