import firebase from "firebase/compat/app";
import firebaseConfig from "@/server/firebase/config";
import { getAuth } from "firebase/auth";
import "firebase/compat/firestore";
import { FirebaseError } from "firebase/app";
const firebaseApp = firebase.initializeApp(firebaseConfig);
import { getMessaging, getToken, onMessage } from "firebase/messaging";
export const messaging = getMessaging();

onMessage(messaging, (payload) => {
  console.debug("💪 ~ file: firebase.ts:10 ~ onMessage ~ payload:", payload);
});
getToken(messaging, { vapidKey: firebaseConfig.apiKey })
  .then((currentToken) => {
    if (currentToken) {
      console.debug(
        "💪 ~ file: firebase.ts:15 ~ .then ~ currentToken:",
        currentToken
      );
    } else {
      console.debug(
        "No registration token available. Request permission to generate one."
      );
    }
  })
  .catch((err: FirebaseError) => {
    console.debug("💪 ~ file: firebase.ts:21 ~ err.message:", err.message);
  });

export const db = firebaseApp.firestore();
const auth = getAuth(firebaseApp);
export default auth;
