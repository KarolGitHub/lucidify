import { User } from "../../../interface/User";
import state from "./state";

const getters = {
  isLogged: (): boolean => {
    // Check both the state and localStorage to ensure we have a valid token
    const hasToken = localStorage.getItem("accessToken") !== null;
    return state.isLogged && hasToken;
  },
  getAccessToken: (): string | null => state.accessToken,
  getUser: (): User | null => state.user,
};

export default getters;
