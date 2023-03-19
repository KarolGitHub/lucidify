import { User } from "../../../interface/User";
import state from "./state";

const getters = {
  isLogged: (): boolean => state.isLogged,
  getAccessToken: (): string | null => state.accessToken,
  getUser: (): User | null => state.user,
};

export default getters;
