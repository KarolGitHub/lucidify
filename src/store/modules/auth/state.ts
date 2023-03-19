import { reactive } from "vue";
import { User } from "../../../interface/User";

interface storageAuth {
  isLogged: boolean;
  accessToken: string | null;
  user: User | null;
}

const state = reactive<storageAuth>({
  isLogged: false,
  accessToken: null,
  user: null,
});

export default state;
