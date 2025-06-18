import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const swPath = path.resolve(__dirname, "../src/firebase-messaging-sw.js");
let swContent = fs.readFileSync(swPath, "utf8");

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  vapidKey: process.env.VITE_FIREBASE_VAPID_KEY,
};

// Replace the config injection line with the actual config
swContent = swContent.replace(
  "const firebaseConfig = self.__FIREBASE_CONFIG__;",
  `const firebaseConfig = ${JSON.stringify(firebaseConfig)};`,
);

fs.writeFileSync(swPath, swContent);

console.log("✅ Service worker config injected");
