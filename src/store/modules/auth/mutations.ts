import state from "./state";

const mutations = {
  setAuth(stateLogin: boolean, user?: any): void {
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
