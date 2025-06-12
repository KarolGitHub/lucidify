import { User } from "../../../interface/User";
import state from "./state";
import authService from "@/services/auth";

const getters = {
  isLogged: (): boolean => {
    // Check both the store state and Firebase auth state
    const hasToken = localStorage.getItem("accessToken") !== null;
    const isFirebaseAuthenticated = authService.isAuthenticated();
    return state.isLogged && hasToken && isFirebaseAuthenticated;
  },
  getAccessToken: (): string | null => state.accessToken,
  getUser: (): User | null => state.user,
};

export default getters;
