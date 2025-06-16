import { defineComponent, computed } from "vue";
import authService from "@/services/auth";
import { loadingStore } from "@/store";

export default defineComponent({
  name: "LoginForm",
  data() {
    return {
      email: "",
      password: "",
      regEmail: "",
      regPassword: "",
      confirmPassword: "",
      error: "",
      regError: "",
      showRegister: false,
    };
  },
  computed: {
    isLoading() {
      return loadingStore.getters.getLoading().loading;
    },
    isRegistering() {
      return loadingStore.getters.getLoading().loading;
    },
  },
  methods: {
    async handleLogin() {
      try {
        loadingStore.actions.start("Logging in...");
        this.error = "";

        await authService.login({
          email: this.email,
          password: this.password,
        });

        // Login successful - emit event or redirect
        this.$emit("login-success");
      } catch (error: any) {
        console.error("Login error:", error);
        this.error = this.getErrorMessage(error);
      } finally {
        loadingStore.actions.finish();
      }
    },

    async handleRegister() {
      if (this.regPassword !== this.confirmPassword) {
        this.regError = "Passwords do not match";
        return;
      }

      if (this.regPassword.length < 6) {
        this.regError = "Password must be at least 6 characters";
        return;
      }

      try {
        loadingStore.actions.start("Creating account...");
        this.regError = "";

        await authService.register({
          email: this.regEmail,
          password: this.regPassword,
        });

        // Registration successful - switch back to login
        this.showRegister = false;
        this.email = this.regEmail;
        this.regEmail = "";
        this.regPassword = "";
        this.confirmPassword = "";

        this.$emit("register-success");
      } catch (error: any) {
        console.error("Registration error:", error);
        this.regError = this.getErrorMessage(error);
      } finally {
        loadingStore.actions.finish();
      }
    },

    getErrorMessage(error: any): string {
      if (error.code === "auth/user-not-found") {
        return "No account found with this email address";
      }
      if (error.code === "auth/wrong-password") {
        return "Incorrect password";
      }
      if (error.code === "auth/email-already-in-use") {
        return "An account with this email already exists";
      }
      if (error.code === "auth/weak-password") {
        return "Password is too weak";
      }
      if (error.code === "auth/invalid-email") {
        return "Invalid email address";
      }
      return error.message || "An error occurred. Please try again.";
    },
  },
});
