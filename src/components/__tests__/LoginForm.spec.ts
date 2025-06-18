import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import LoginForm from "../Auth/LoginForm.vue";
import authService from "@/services/auth";
import { loadingStore } from "@/store";

// Mock the auth service
vi.mock("@/services/auth", () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

// Mock the loading store
vi.mock("@/store", () => ({
  loadingStore: {
    getters: {
      getLoading: () => ({ loading: false }),
    },
    actions: {
      start: vi.fn(),
      finish: vi.fn(),
    },
  },
}));

describe("LoginForm", () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(LoginForm);
    vi.clearAllMocks();
  });

  describe("Login Form", () => {
    it("renders login form by default", () => {
      expect(wrapper.find("form").exists()).toBe(true);
      expect(wrapper.find('input[type="email"]').exists()).toBe(true);
      expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    });

    it("shows error message for invalid login", async () => {
      const error = { code: "auth/wrong-password" };
      vi.mocked(authService.login).mockRejectedValueOnce(error);

      await wrapper.setData({
        email: "test@example.com",
        password: "wrongpass",
      });
      await wrapper.vm.handleLogin();

      expect(wrapper.vm.error).toBe("Incorrect password");
    });

    it("emits login-success event on successful login", async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({});

      await wrapper.setData({
        email: "test@example.com",
        password: "correctpass",
      });
      await wrapper.vm.handleLogin();

      expect(wrapper.emitted("login-success")).toBeTruthy();
    });

    it("shows loading state during login", async () => {
      vi.mocked(authService.login).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      await wrapper.setData({
        email: "test@example.com",
        password: "password",
      });
      await wrapper.vm.handleLogin();

      expect(loadingStore.actions.start).toHaveBeenCalledWith("Logging in...");
      expect(loadingStore.actions.finish).toHaveBeenCalled();
    });
  });

  describe("Register Form", () => {
    beforeEach(async () => {
      await wrapper.setData({ showRegister: true });
    });

    it("renders register form when showRegister is true", () => {
      expect(wrapper.find('input[type="email"]').exists()).toBe(true);
      expect(wrapper.findAll('input[type="password"]')).toHaveLength(2);
    });

    it("shows error when passwords do not match", async () => {
      await wrapper.setData({
        regEmail: "test@example.com",
        regPassword: "password123",
        confirmPassword: "password456",
      });
      await wrapper.vm.handleRegister();

      expect(wrapper.vm.regError).toBe("Passwords do not match");
    });

    it("shows error for weak password", async () => {
      await wrapper.setData({
        regEmail: "test@example.com",
        regPassword: "123",
        confirmPassword: "123",
      });
      await wrapper.vm.handleRegister();

      expect(wrapper.vm.regError).toBe(
        "Password must be at least 6 characters",
      );
    });

    it("emits register-success event on successful registration", async () => {
      vi.mocked(authService.register).mockResolvedValueOnce({});

      await wrapper.setData({
        regEmail: "test@example.com",
        regPassword: "password123",
        confirmPassword: "password123",
      });
      await wrapper.vm.handleRegister();

      expect(wrapper.emitted("register-success")).toBeTruthy();
      expect(wrapper.vm.showRegister).toBe(false);
    });

    it("shows loading state during registration", async () => {
      vi.mocked(authService.register).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      await wrapper.setData({
        regEmail: "test@example.com",
        regPassword: "password123",
        confirmPassword: "password123",
      });
      await wrapper.vm.handleRegister();

      expect(loadingStore.actions.start).toHaveBeenCalledWith(
        "Creating account...",
      );
      expect(loadingStore.actions.finish).toHaveBeenCalled();
    });
  });

  describe("Error Messages", () => {
    it("displays correct error message for user not found", async () => {
      const error = { code: "auth/user-not-found" };
      vi.mocked(authService.login).mockRejectedValueOnce(error);

      await wrapper.setData({
        email: "nonexistent@example.com",
        password: "password",
      });
      await wrapper.vm.handleLogin();

      expect(wrapper.vm.error).toBe("No account found with this email address");
    });

    it("displays correct error message for email already in use", async () => {
      const error = { code: "auth/email-already-in-use" };
      vi.mocked(authService.register).mockRejectedValueOnce(error);

      await wrapper.setData({
        regEmail: "existing@example.com",
        regPassword: "password123",
        confirmPassword: "password123",
      });
      await wrapper.vm.handleRegister();

      expect(wrapper.vm.regError).toBe(
        "An account with this email already exists",
      );
    });

    it("displays generic error message for unknown errors", async () => {
      const error = { message: "Unknown error" };
      vi.mocked(authService.login).mockRejectedValueOnce(error);

      await wrapper.setData({
        email: "test@example.com",
        password: "password",
      });
      await wrapper.vm.handleLogin();

      expect(wrapper.vm.error).toBe("Unknown error");
    });
  });
});
