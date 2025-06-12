import axios from "axios";
import { AuthErrorHandler } from "@/utils/authErrorHandler";
import authService from "@/services/auth";

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Wait for Firebase auth state to be ready before making requests
    if (!authService.isAuthStateReady()) {
      console.log("Waiting for Firebase auth state to be ready...");
      await authService.waitForAuthState();
    }

    // Get auth token
    const token = await authService.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle authentication errors (401, 403)
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.warn("Authentication error detected in axios interceptor");

      // Only auto logout if Firebase auth state is ready and user is actually logged out
      if (authService.isAuthStateReady() && !authService.isAuthenticated()) {
        await AuthErrorHandler.handleAuthError(
          "Session expired. Please log in again.",
        );
      } else {
        console.log(
          "Auth state not ready or user still authenticated, skipping auto logout",
        );
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
