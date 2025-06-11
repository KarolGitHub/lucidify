import axios from "axios";
import { AuthErrorHandler } from "@/utils/authErrorHandler";

const apiClient = axios.create({
  // baseURL: "http://localhost:5173/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Add auth token to requests if available
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error adding auth token to request:", error);
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

      // Auto logout the user
      await AuthErrorHandler.handleAuthError(
        "Session expired. Please log in again.",
      );
    }

    return Promise.reject(error);
  },
);

export { apiClient };
