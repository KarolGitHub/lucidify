import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import firebaseConfig from "./config";

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(firebaseApp);

// Initialize Firestore and get a reference to the service
export const db = getFirestore(firebaseApp);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(firebaseApp);

// Handle incoming messages
onMessage(messaging, (payload) => {
  console.debug("💪 ~ file: firebase.ts:10 ~ onMessage ~ payload:", payload);
});

// Request permission and get token
function requestPermission() {
  console.log("Requesting permission...");
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification permission granted.");
      // Get token after permission is granted
      getToken(messaging, { vapidKey: firebaseConfig.vapidKey })
        .then((currentToken) => {
          if (currentToken) {
            console.debug(
              "💪 ~ file: firebase.ts:15 ~ .then ~ currentToken:",
              currentToken,
            );
          } else {
            console.debug(
              "No registration token available. Request permission to generate one.",
            );
          }
        })
        .catch((err) => {
          console.debug(
            "💪 ~ file: firebase.ts:21 ~ err.message:",
            err.message,
          );
        });
    }
  });
}

// Request permission on load
requestPermission();

export default auth;
