import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.FIREBASE_APP_ID,
  vapidKey: import.meta.env.FIREBASE_VAPID_KEY,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Function to convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Function to get FCM token
export async function getFCMToken() {
  try {
    const vapidKey = import.meta.env.FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      throw new Error("VAPID key is not defined in environment variables");
    }

    const currentToken = await getToken(messaging, {
      vapidKey: vapidKey,
    });

    if (currentToken) {
      console.log("Current FCM token:", currentToken);
      return currentToken;
    } else {
      console.log("No registration token available.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token:", err);
    return null;
  }
}

export { app, messaging };
