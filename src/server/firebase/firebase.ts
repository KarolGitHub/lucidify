import firebase from "firebase/compat/app";
import firebaseConfig from "@/server/firebase/config";
import { getAuth } from "firebase/auth";
import "firebase/compat/firestore";
const firebaseApp = firebase.initializeApp(firebaseConfig);

export const db = firebaseApp.firestore();
const auth = getAuth(firebaseApp);
export default auth;
