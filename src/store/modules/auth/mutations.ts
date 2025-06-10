import state from "./state";

const mutations = {
  setAuth(stateLogin: boolean, user?: any): void {
    console.debug("💪 ~ setAuth ~ state.isLogged:", state.isLogged);
    state.isLogged = stateLogin;
    if (user) {
      state.accessToken = user.accessToken;
      state.user = { ...user };
    } else {
      state.accessToken = null;
      state.user = null;
    }
  },
  setAccessToken(accessToken: string | null): void {
    state.accessToken = accessToken;
  },
};

export default mutations;
