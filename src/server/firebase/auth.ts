// import { SurePromise } from "@/interface/SurePromise";
import auth from "@/server/firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { Login, Register } from "../../interface/Auth";

export default class Auth {
  static async login(userForm: Login): Promise<UserCredential> {
    const { email, password } = userForm;
    return await signInWithEmailAndPassword(auth, email, password);
  }
  static async logout(): Promise<void> {
    return await signOut(auth);
  }
  static async register(registerForm: Register): Promise<UserCredential> {
    const { email, password } = registerForm;
    return await createUserWithEmailAndPassword(auth, email, password);
  }
  static onAuthStateChanged(): void {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
      } else {
        // User is signed out
      }
    });
  }
}
