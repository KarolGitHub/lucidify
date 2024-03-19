const firebaseConfig = require("src/server/firebase/firebase.ts");
importScripts("https://www.gstatic.com/firebasejs/8.2.7/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.7/firebase-messaging.js");
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.debug(
    "💪 ~ file: firebase-messaging-sw.js:9 ~ messaging.onBackgroundMessage ~ payload:",
    payload
  );
  const notificationTitle = payload.notification?.title ?? "Unexpected error";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: "./favicon-32x32.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
