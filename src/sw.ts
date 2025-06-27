/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
declare let self: ServiceWorkerGlobalScope;

const manifest = self.__WB_MANIFEST;

precacheAndRoute(manifest);

self.skipWaiting();
clientsClaim();

cleanupOutdatedCaches();

// Firebase configuration - this will be injected during build
const firebaseConfig = {
  apiKey: "AIzaSyAl9dvIuQWgzWdCRoi8uCDjSqNLwLtElKo",
  authDomain: "dashboard-6d5c0.firebaseapp.compp.com",
  projectId: "dashboard-6d5c0",
  storageBucket: "dashboard-6d5c0.appspot.com",
  messagingSenderId: "1023426981171",
  appId: "1:1023426981171:web:40bd9b5850d8b49f3f2246",
  vapidKey:
    "BOdP9n3XfOLmJpIBT8iCFhc8xUI96IpBKHvW9lOQekrO9ushni1QDRmv2GGwc4w7KxoSp3TAKY0WM4JdM8jwEAs",
};

// Import Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js",
);

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully in service worker");

  // Get messaging instance
  const messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log("Received background message:", payload);

    const notificationTitle = payload.notification?.title || "Reality Check";
    const notificationOptions = {
      body: payload.notification?.body || "Are you dreaming?",
      icon: "/android-chrome-192x192.png",
      badge: "/android-chrome-192x192.png",
      tag: "reality-check", // Prevent duplicate notifications
      requireInteraction: false,
      actions: [
        {
          action: "check",
          title: "Perform Check",
          icon: "/android-chrome-192x192.png",
        },
        {
          action: "record",
          title: "Record Dream",
          icon: "/android-chrome-192x192.png",
        },
        {
          action: "dismiss",
          title: "Dismiss",
          icon: "/android-chrome-192x192.png",
        },
      ],
      data: payload.data || {},
    };

    return self.registration.showNotification(
      notificationTitle,
      notificationOptions,
    );
  });
} catch (error) {
  console.error("Error initializing Firebase in service worker:", error);
}

// Handle notification clicks
self.addEventListener("notificationclick", function (event) {
  console.log("Notification clicked:", event);

  event.notification.close();

  // Handle different actions
  if (event.action === "check") {
    // Open reality check page
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes("/reality-check") && "focus" in client) {
            return client.focus();
          }
        }
        // Open new window if app is not open
        return clients.openWindow("/reality-check");
      }),
    );
  } else if (event.action === "record") {
    // Open dream journal with new dream modal
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes("/dream-journal") && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow("/dream-journal?new=1");
      }),
    );
  } else if (event.action === "dismiss") {
    // Just close the notification (already done above)
    console.log("Notification dismissed");
  } else {
    // Default action - open reality check page
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes("/reality-check") && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow("/reality-check");
      }),
    );
  }
});

// Handle notification close
self.addEventListener("notificationclose", function (event) {
  console.log("Notification closed:", event);
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
