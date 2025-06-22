import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import { firebaseConfig } from "./config";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: any = null;

// Check if messaging is supported
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
    console.log("Firebase Messaging is supported");
  } else {
    console.log("Firebase Messaging is not supported in this browser");
  }
});

// Helper: Send FCM token to backend
async function sendTokenToServer(token: string) {
  try {
    const response = await fetch("/api/users/fcm-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add auth header if needed
      },
      body: JSON.stringify({
        token,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          isPWA:
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (response.ok) {
      console.log("FCM token sent to backend successfully");
    } else {
      console.error(
        "Failed to send FCM token to backend:",
        response.statusText,
      );
    }
  } catch (err) {
    console.error("Failed to send FCM token to backend:", err);
  }
}

// Store the last sent token in memory
let lastSentToken: string | null = null;

// Handle incoming messages when the app is in the foreground
if (messaging) {
  onMessage(messaging, (payload) => {
    console.log("Message received:", payload);
    // You can customize the notification here
    const notificationTitle = payload.notification?.title || "New Message";
    const notificationOptions = {
      body: payload.notification?.body || "You have a new message",
      icon: "/android-chrome-192x192.png",
      badge: "/android-chrome-192x192.png",
      tag: "reality-check", // Prevent duplicate notifications
      data: payload.data || {},
    };

    // Only show notification if permission is granted and app is in foreground
    if (Notification.permission === "granted") {
      new Notification(notificationTitle, notificationOptions);
    }
  });
}

// Request permission and get FCM token
async function requestPermissionAndSendToken() {
  try {
    if (!messaging) {
      console.log("Messaging not supported or not initialized");
      return null;
    }

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
        return currentToken;
      } else if (!currentToken) {
        console.log("No registration token available.");
        return null;
      } else {
        console.log("Token already sent to server");
        return currentToken;
      }
    } else {
      console.log("Notification permission denied.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token:", err);
    return null;
  }
}

// Function to get current FCM token without requesting permission
async function getCurrentToken(): Promise<string | null> {
  try {
    if (!messaging) {
      console.log("Messaging not supported or not initialized");
      return null;
    }

    const currentToken = await getToken(messaging, {
      vapidKey: firebaseConfig.vapidKey,
    });

    return currentToken;
  } catch (err) {
    console.error("Error getting current token:", err);
    return null;
  }
}

// Function to refresh FCM token
async function refreshToken(): Promise<string | null> {
  try {
    if (!messaging) {
      console.log("Messaging not supported or not initialized");
      return null;
    }

    // Get fresh token
    const currentToken = await getToken(messaging, {
      vapidKey: firebaseConfig.vapidKey,
    });

    if (currentToken && currentToken !== lastSentToken) {
      await sendTokenToServer(currentToken);
      lastSentToken = currentToken;
      return currentToken;
    }

    return currentToken;
  } catch (err) {
    console.error("Error refreshing token:", err);
    return null;
  }
}

export {
  app,
  auth,
  db,
  messaging,
  requestPermissionAndSendToken,
  getCurrentToken,
  refreshToken,
  sendTokenToServer,
};
