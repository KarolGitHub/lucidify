import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseConfig } from "./config";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

// Handle incoming messages when the app is in the foreground
onMessage(messaging, (payload) => {
  console.log("Message received:", payload);
  // You can customize the notification here
  const notificationTitle = payload.notification?.title || "New Message";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message",
    icon: "/firebase-logo.png",
  };

  new Notification(notificationTitle, notificationOptions);
});

// Request permission and get FCM token
async function requestPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
      // Get token after permission is granted
      const currentToken = await getToken(messaging, {
        vapidKey: firebaseConfig.vapidKey,
      });

      if (currentToken) {
        console.log("Current token:", currentToken);
        // Send the token to your server
        // await sendTokenToServer(currentToken);
      } else {
        console.log("No registration token available.");
      }
    } else {
      console.log("Notification permission denied.");
    }
  } catch (err) {
    console.error("An error occurred while retrieving token:", err);
  }
}

requestPermission();

export { app, auth, db, messaging };
