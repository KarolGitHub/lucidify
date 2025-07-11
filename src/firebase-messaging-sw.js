// import { firebaseConfig } from "./config";
// const firebaseConfig = require("src/server/firebase/firebase.ts");
// const { firebaseConfig } = require("src/server/firebase/firebase.ts");

// The firebaseConfig will be injected during build/dev
const firebaseConfig = {
  "apiKey": "AIzaSyAl9dvIuQWgzWdCRoi8uCDjSqNLwLtElKo",
  "authDomain": "dashboard-6d5c0.firebaseapp.compp.com",
  "projectId": "dashboard-6d5c0",
  "storageBucket": "dashboard-6d5c0.appspot.com",
  "messagingSenderId": "1023426981171",
  "appId": "1:1023426981171:web:40bd9b5850d8b49f3f2246",
  "vapidKey": "BOdP9n3XfOLmJpIBT8iCFhc8xUI96IpBKHvW9lOQekrO9ushni1QDRmv2GGwc4w7KxoSp3TAKY0WM4JdM8jwEAs"
};

// Log the config to help with debugging
console.log("Service Worker Firebase Config:", {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey
    ? "***" + firebaseConfig.apiKey.slice(-4)
    : undefined,
});

importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js",
);

try {
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully in service worker");

  // Get an instance of Firebase Messaging
  const messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log("Received background message:", payload);

    const notificationTitle = payload.notification?.title || "New Message";
    const notificationOptions = {
      body: payload.notification?.body || "You have a new message",
      icon: "/firebase-logo.png",
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });

  // Handle notification clicks
  self.addEventListener("notificationclick", function (event) {
    console.log("Notification clicked:", event);

    event.notification.close();

    // Handle different actions
    if (event.action === "check") {
      // Open reality check page
      event.waitUntil(clients.openWindow("/reality-check"));
    } else if (event.action === "record") {
      // Open dream journal with new dream modal
      event.waitUntil(clients.openWindow("/dream-journal?new=1"));
    } else if (event.action === "dismiss") {
      // Just close the notification (already done above)
      console.log("Notification dismissed");
    } else {
      // Default action - open reality check page
      event.waitUntil(clients.openWindow("/reality-check"));
    }
  });

  // Handle notification close
  self.addEventListener("notificationclose", function (event) {
    console.log("Notification closed:", event);
  });
} catch (error) {
  console.error("Error initializing Firebase in service worker:", error);
}
