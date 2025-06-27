import { describe, it, expect, vi, beforeEach } from "vitest";
import actions from "./actions";
import mutations from "./mutations";
import router from "@/router";
import { loadingStore, notifications } from "@/store";
import authService from "@/services/auth";
import { Login, Register } from "@/interface/Auth";

// Mock dependencies
vi.mock("./mutations");
vi.mock("@/router");
vi.mock("@/store", () => ({
  loadingStore: {
    actions: {
      setLoading: vi.fn(),
    },
  },
  notifications: {
    actions: {
      presentToast: vi.fn(),
    },
  },
}));
vi.mock("@/services/auth");

// Mock Firebase before importing any modules that use it
vi.mock("@/server/firebase/config", () => ({
  default: {
    messaging: {
      getToken: vi.fn(() => Promise.resolve("mock-fcm-token")),
    },
    auth: {
      onAuthStateChanged: vi.fn(),
    },
  },
}));

vi.mock("@/server/firebase/firebase", () => ({
  default: {
    messaging: {
      getToken: vi.fn(() => Promise.resolve("mock-fcm-token")),
    },
    auth: {
      onAuthStateChanged: vi.fn(),
    },
  },
}));

// Mock Firebase app initialization
vi.mock("@firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
  getApp: vi.fn(() => ({})),
}));

vi.mock("@firebase/messaging", () => ({
  getMessaging: vi.fn(() => ({
    getToken: vi.fn(() => Promise.resolve("mock-fcm-token")),
  })),
}));

// Mock Firebase auth
vi.mock("@firebase/auth", () => ({
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Simulate auth state change
    callback(null);
    return vi.fn(); // Return unsubscribe function
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Simulate auth state change
    callback(null);
    return vi.fn(); // Return unsubscribe function
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

describe("Auth Store Actions", () => {
  const mockUser = {
    uid: "123",
    displayName: "Test User",
    email: "test@example.com",
    emailVerified: true,
    phoneNumber: null,
    photoURL: null,
    getIdToken: vi.fn().mockResolvedValue("test-token"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("login", () => {
    it("on success, sets auth data and navigates to dashboard", async () => {
      vi.mocked(authService.login).mockResolvedValue({ user: mockUser } as any);

      const loginForm: Login = {
        email: "test@example.com",
        password: "password",
      };
      await actions.login(loginForm);

      expect(authService.login).toHaveBeenCalledWith(loginForm);
      expect(mutations.setAuth).toHaveBeenCalledWith(true, expect.any(Object));
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "accessToken",
        "test-token",
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "userData",
        expect.any(String),
      );
      expect(router.push).toHaveBeenCalledWith({ name: "Dashboard" });
      expect(notifications.actions.presentToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: "success" }),
      );
    });

    it("on failure, shows an error toast", async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error("Login failed"));

      const loginForm: Login = {
        email: "test@example.com",
        password: "password",
      };
      await actions.login(loginForm);

      expect(mutations.setAuth).not.toHaveBeenCalled();
      expect(router.push).not.toHaveBeenCalled();
      expect(notifications.actions.presentToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          body: "Incorrect email or password",
        }),
      );
    });
  });

  describe("logout", () => {
    it("clears auth data and navigates to login page", async () => {
      vi.mocked(authService.logout).mockResolvedValue(undefined);

      await actions.logout();

      expect(authService.logout).toHaveBeenCalled();
      expect(mutations.setAuth).toHaveBeenCalledWith(false);
      expect(mutations.setAccessToken).toHaveBeenCalledWith(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith("accessToken");
      expect(localStorage.removeItem).toHaveBeenCalledWith("userData");
      expect(router.push).toHaveBeenCalledWith("/auth/login");
    });
  });

  describe("register", () => {
    it("on success, shows a toast and navigates to login", async () => {
      vi.mocked(authService.register).mockResolvedValue({} as any);
      const registerForm: Register = {
        email: "test@example.com",
        password: "password",
        confirmPassword: "password",
      };

      await actions.register(registerForm);

      expect(authService.register).toHaveBeenCalledWith(registerForm);
      expect(notifications.actions.presentToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: "success" }),
      );
      expect(router.push).toHaveBeenCalledWith({ name: "login" });
    });

    it("on failure, shows an error toast with the message", async () => {
      const error = {
        code: "auth/email-already-in-use",
        message: "Email is already in use.",
      };
      vi.mocked(authService.register).mockRejectedValue(error);
      const registerForm: Register = {
        email: "test@example.com",
        password: "password",
        confirmPassword: "password",
      };

      await actions.register(registerForm);

      expect(notifications.actions.presentToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          body: error.message,
          tittle: error.code,
        }),
      );
    });
  });

  describe("fetchAccessToken", () => {
    it("restores auth state if user is authenticated in Firebase", async () => {
      vi.mocked(authService.isAuthStateReady).mockReturnValue(true);
      vi.mocked(authService.isAuthenticated).mockReturnValue(true);
      vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser as any);

      await actions.fetchAccessToken();

      expect(mutations.setAuth).toHaveBeenCalledWith(true, expect.any(Object));
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "accessToken",
        "test-token",
      );
    });

    it("clears auth state if user is not authenticated", async () => {
      vi.mocked(authService.isAuthStateReady).mockReturnValue(true);
      vi.mocked(authService.isAuthenticated).mockReturnValue(false);

      await actions.fetchAccessToken();

      expect(mutations.setAuth).toHaveBeenCalledWith(false);
      expect(mutations.setAccessToken).toHaveBeenCalledWith(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith("accessToken");
    });
  });
});
