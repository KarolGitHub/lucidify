// import { firebaseConfig } from "./config";
// const firebaseConfig = require("src/server/firebase/firebase.ts");
// const { firebaseConfig } = require("src/server/firebase/firebase.ts");

const firebaseConfig = {
  apiKey: "AIzaSyAl9dvIuQWgzWdCRoi8uCDjSqNLwLtElKo",
  authDomain: "dashboard-6d5c0.firebaseapp.com",
  projectId: "dashboard-6d5c0",
  storageBucket: "dashboard-6d5c0.appspot.com",
  messagingSenderId: "1023426981171",
  appId: "1:1023426981171:web:40bd9b5850d8b49f3f2246",
};
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(messaging, function (payload) {
  console.debug(
    "💪 ~ file: firebase-messaging-sw.js:9 ~ messaging.onBackgroundMessage ~ payload:",
    payload
  );
  const notificationTitle = payload.notification?.title ?? "Unexpected error";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: "./favicon-32x32.png",
    // type: 'json'
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
