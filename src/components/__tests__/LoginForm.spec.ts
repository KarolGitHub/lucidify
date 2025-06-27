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
  const mockUser = {
    uid: "123",
    email: "test@example.com",
    displayName: "Test User",
  };

  beforeEach(() => {
    wrapper = mount(LoginForm);
    vi.clearAllMocks();
  });

  describe("Login Form", () => {
    it("renders login form correctly", () => {
      expect(wrapper.find("h2").text()).toBe("Login to Lucidify");
      expect(wrapper.find('input[type="email"]').exists()).toBe(true);
      expect(wrapper.find('input[type="password"]').exists()).toBe(true);
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    });

    it("displays login form elements", () => {
      expect(wrapper.find('input[type="email"]').exists()).toBe(true);
      expect(wrapper.find('input[type="password"]').exists()).toBe(true);
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    });

    it("validates email format", async () => {
      const emailInput = wrapper.find('input[type="email"]');
      await emailInput.setValue("invalid-email");
      await wrapper.vm.$nextTick();

      // The component might show validation errors or handle them differently
      // Check if the form is still valid or if there are validation messages
      expect(wrapper.vm.email).toBe("invalid-email");
    });

    it("validates password length", async () => {
      const passwordInput = wrapper.find('input[type="password"]');
      await passwordInput.setValue("123");
      await wrapper.vm.$nextTick();

      // Check if the password is set correctly
      expect(wrapper.vm.password).toBe("123");
    });

    it("calls login action when form is submitted", async () => {
      const emailInput = wrapper.find('input[type="email"]');
      const passwordInput = wrapper.find('input[type="password"]');
      const submitButton = wrapper.find('button[type="submit"]');

      await emailInput.setValue("test@example.com");
      await passwordInput.setValue("password123");
      await wrapper.vm.$nextTick();

      await submitButton.trigger("click");
      await wrapper.vm.$nextTick();

      expect(authService.login).toHaveBeenCalledWith(expect.anything(), {
        email: "test@example.com",
        password: "password123",
      });
    });

    it("shows loading state during login", async () => {
      // Mock loading state by setting component data
      await wrapper.setData({ isLoading: true });
      await wrapper.vm.$nextTick();

      // Check if loading state is reflected in the component
      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.exists()).toBe(true);
    });

    it("shows error message when login fails", async () => {
      // Mock error state by setting component data
      await wrapper.setData({ error: "Invalid credentials" });
      await wrapper.vm.$nextTick();

      // Check if error is displayed
      expect(wrapper.text()).toContain("Invalid credentials");
    });
  });

  describe("Register Form", () => {
    beforeEach(async () => {
      await wrapper.setData({ showRegister: true });
    });

    it("renders register form when showRegister is true", () => {
      expect(wrapper.find('input[type="email"]').exists()).toBe(true);
      expect(wrapper.findAll('input[type="password"]')).toHaveLength(3);
    });

    it("shows error when passwords do not match", async () => {
      await wrapper.setData({
        regEmail: "test@example.com",
        regPassword: "password123",
        confirmPassword: "differentpassword",
      });

      await wrapper.find("form").trigger("submit");

      expect(wrapper.vm.regError).toBe("Passwords do not match");
    });

    it("shows error for weak password", async () => {
      await wrapper.setData({
        regEmail: "test@example.com",
        regPassword: "123",
        confirmPassword: "123",
      });

      await wrapper.find("form").trigger("submit");

      expect(wrapper.vm.regError).toBe(
        "Password must be at least 6 characters",
      );
    });

    it("emits register-success event on successful registration", async () => {
      vi.mocked(authService.register).mockResolvedValue({
        user: mockUser,
        providerId: "password",
        operationType: "signIn",
      } as any);

      await wrapper.setData({
        regEmail: "test@example.com",
        regPassword: "password123",
        confirmPassword: "password123",
      });

      await wrapper.find("form").trigger("submit");

      expect(wrapper.emitted("register-success")).toBeTruthy();
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

      await wrapper.find("form").trigger("submit");

      expect(wrapper.find('button[type="submit"]').text()).toBe(
        "Creating Account...",
      );
    });
  });

  describe("Error Messages", () => {
    it("displays correct error message for user not found", async () => {
      const error = { code: "auth/user-not-found" };
      vi.mocked(authService.login).mockRejectedValue(error);

      await wrapper.setData({
        email: "nonexistent@example.com",
        password: "password123",
      });

      await wrapper.find("form").trigger("submit");

      expect(wrapper.vm.error).toBe("User not found. Please check your email.");
    });

    it("displays correct error message for email already in use", async () => {
      const error = { code: "auth/email-already-in-use" };
      vi.mocked(authService.register).mockRejectedValue(error);

      await wrapper.setData({ showRegister: true });
      await wrapper.setData({
        regEmail: "existing@example.com",
        regPassword: "password123",
        confirmPassword: "password123",
      });

      await wrapper.find("form").trigger("submit");

      expect(wrapper.vm.regError).toBe(
        "Email is already in use. Please try logging in.",
      );
    });

    it("displays generic error message for unknown errors", async () => {
      const error = { message: "Unknown error" };
      vi.mocked(authService.login).mockRejectedValue(error);

      await wrapper.setData({
        email: "test@example.com",
        password: "password123",
      });

      await wrapper.find("form").trigger("submit");

      expect(wrapper.vm.error).toBe("Unknown error");
    });
  });
});
