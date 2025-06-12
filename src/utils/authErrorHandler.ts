import { auth } from "@/store";
import { Toast } from "@/interface/Toast";
import { notifications } from "@/store";
import { AxiosResponse } from "axios";

export class AuthErrorHandler {
  /**
   * Checks if a Firebase token is expired
   * Note: Firebase tokens are automatically refreshed by the SDK
   * This function is mainly for compatibility
   * @param token - The Firebase token to check
   * @returns false (Firebase handles token refresh automatically)
   */
  static isTokenExpired(token: string): boolean {
    // Firebase tokens are automatically refreshed by the SDK
    // We don't need to manually check expiration
    return false;
  }

  /**
   * Handles authentication errors by automatically logging out the user
   * @param message - The error message to log
   * @param showToast - Whether to show a toast notification (default: true)
   */
  static async handleAuthError(
    message: string,
    showToast: boolean = true,
  ): Promise<void> {
    console.warn("Authentication error:", message);

    // Show toast notification if requested
    if (showToast) {
      const toast: Toast = {
        body: "Your session has expired. Please log in again.",
        tittle: "Session Expired",
        type: "error",
        show: true,
      };
      notifications.actions.presentToast(toast);
    }

    // Auto logout the user
    try {
      await auth.actions.logout();
    } catch (error) {
      console.error("Error during auto logout:", error);
    }
  }

  /**
   * Checks if a response indicates an authentication error
   * @param response - The fetch response or axios response to check
   * @returns true if the response indicates an auth error
   */
  static isAuthError(response: Response | AxiosResponse | any): boolean {
    if (!response) return false;

    // Handle fetch Response
    if (response instanceof Response) {
      return response.status === 401 || response.status === 403;
    }

    // Handle axios response
    if (response.status) {
      return response.status === 401 || response.status === 403;
    }

    return false;
  }

  /**
   * Handles API errors with automatic logout for auth errors
   * @param response - The fetch response
   * @param errorMessage - The base error message
   * @param showToast - Whether to show a toast notification for auth errors
   */
  static async handleApiError(
    response: Response,
    errorMessage: string,
    showToast: boolean = true,
  ): Promise<never> {
    // Check for authentication errors
    if (this.isAuthError(response)) {
      await this.handleAuthError(
        "Session expired. Please log in again.",
        showToast,
      );
    }

    throw new Error(`${errorMessage}: ${response.status}`);
  }

  /**
   * Wraps an async function with automatic auth error handling
   * @param fn - The async function to wrap
   * @param errorMessage - The error message to show on failure
   */
  static async withAuthErrorHandling<T>(
    fn: () => Promise<T>,
    errorMessage: string,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (
        error.message?.includes("No authentication token available") ||
        error.message?.includes("Session expired")
      ) {
        await this.handleAuthError(error.message);
      }
      throw error;
    }
  }
}
