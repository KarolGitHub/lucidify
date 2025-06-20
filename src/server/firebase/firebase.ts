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

// Helper: Send FCM token to backend
async function sendTokenToServer(token: string) {
  try {
    await fetch("/api/users/fcm-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add auth header if needed
      },
      body: JSON.stringify({ token }),
    });
    console.log("FCM token sent to backend");
  } catch (err) {
    console.error("Failed to send FCM token to backend:", err);
  }
}

// Store the last sent token in memory
let lastSentToken: string | null = null;

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
async function requestPermissionAndSendToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
      // Get token after permission is granted
      const currentToken = await getToken(messaging, {
        vapidKey: firebaseConfig.vapidKey,
      });
      if (currentToken && currentToken !== lastSentToken) {
        await sendTokenToServer(currentToken);
        lastSentToken = currentToken;
      } else if (!currentToken) {
        console.log("No registration token available.");
      }
    } else {
      console.log("Notification permission denied.");
    }
  } catch (err) {
    console.error("An error occurred while retrieving token:", err);
  }
}

// Call on page load
requestPermissionAndSendToken();

// Also check token and send to backend when window regains focus (token may have rotated)
window.addEventListener("focus", () => {
  requestPermissionAndSendToken();
});

export { app, auth, db, messaging };
