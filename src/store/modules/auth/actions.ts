// @ts-nocheck
import mutations from "./mutations";
import router from "@/router";
import { loadingStore, notifications } from "@/store";
// import { AuthService } from "../../../services";
import Auth from "@/server/firebase/auth";
import { Login, Register } from "@/interface/Auth";
import { Toast } from "@/interface/Toast";
// const authService = new AuthService();

export default {
  fetchAccessToken(): void {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      // If we have a token and user data, restore the full auth state
      try {
        const user = JSON.parse(userData);
        mutations.setAuth(true, user);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        // Fallback: just set token without user data
        mutations.setAuth(true);
        mutations.setAccessToken(token);
      }
    } else {
      mutations.setAuth(false);
      mutations.setAccessToken(null);
    }
  },
  async login(loginForm: Login): Promise<void> {
    try {
      const response = await Auth.login(loginForm);
      if (response.user) {
        console.debug(
          "💪 ~ file: actions.ts:15 ~ login ~ response.user",
          response.user,
        );
        const {
          uid: id,
          accessToken,
          displayName,
          email,
          emailVerified,
          phoneNumber,
          photoURL,
        } = response.user;

        const userData = {
          id,
          accessToken,
          displayName,
          email,
          emailVerified,
          phoneNumber,
          photoURL,
        };

        mutations.setAuth(true, userData);
        localStorage.setItem("accessToken", accessToken);
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
      const response = await Auth.logout();
      mutations.setAuth(false);
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
      const response = await Auth.register(registerForm);
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
