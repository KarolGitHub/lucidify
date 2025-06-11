import { auth } from "@/server/firebase/firebase";
import {
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential,
} from "firebase/auth";
import { AuthErrorHandler } from "@/utils/authErrorHandler";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
}

class AuthService {
  private currentUser: User | null = null;
  private authStateReady = false;
  private authStateListeners: Array<(user: User | null) => void> = [];

  constructor() {
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.authStateReady = true;

      // Notify all listeners
      this.authStateListeners.forEach((listener) => listener(user));

      console.log(
        "Auth state changed:",
        user ? `User ${user.email} logged in` : "User logged out",
      );
    });
  }

  // Get current user ID for API calls
  getCurrentUserId(): string | null {
    return this.currentUser?.uid || null;
  }

  // Get auth token for API calls
  async getAuthToken(): Promise<string | null> {
    if (!this.currentUser) {
      console.warn("No user logged in, cannot get auth token");
      return null;
    }

    try {
      const token = await this.currentUser.getIdToken();

      // Check if token is expired
      if (AuthErrorHandler.isTokenExpired(token)) {
        console.warn("Token is expired, triggering auto logout");
        await AuthErrorHandler.handleAuthError("Token expired", false);
        return null;
      }

      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  // Get current user object
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if auth state is ready
  isAuthStateReady(): boolean {
    return this.authStateReady;
  }

  // Login with email and password
  async login(credentials: LoginCredentials): Promise<UserCredential> {
    try {
      const result = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password,
      );
      console.log("Login successful:", result.user.email);
      return result;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  // Register with email and password
  async register(credentials: RegisterCredentials): Promise<UserCredential> {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password,
      );
      console.log("Registration successful:", result.user.email);
      return result;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(auth);
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }

  // Wait for auth state to be ready
  async waitForAuthState(): Promise<User | null> {
    if (this.authStateReady) {
      return this.currentUser;
    }

    return new Promise((resolve) => {
      const listener = (user: User | null) => {
        this.authStateListeners = this.authStateListeners.filter(
          (l) => l !== listener,
        );
        resolve(user);
      };
      this.authStateListeners.push(listener);
    });
  }

  // Add auth state listener
  onAuthStateChange(listener: (user: User | null) => void): () => void {
    this.authStateListeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.authStateListeners = this.authStateListeners.filter(
        (l) => l !== listener,
      );
    };
  }
}

// Export singleton instance
export default new AuthService();
