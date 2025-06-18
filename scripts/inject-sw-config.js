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

// Ensure all required Firebase config values are present
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  vapidKey: process.env.VITE_FIREBASE_VAPID_KEY,
};

// Log the config values (excluding sensitive data)
console.log("Firebase Config Values:");
Object.entries(firebaseConfig).forEach(([key, value]) => {
  if (key === "apiKey") {
    console.log(`${key}: ${value ? "***" + value.slice(-4) : "undefined"}`);
  } else {
    console.log(`${key}: ${value || "undefined"}`);
  }
});

// Validate required config values
const requiredFields = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];
const missingFields = requiredFields.filter((field) => !firebaseConfig[field]);

if (missingFields.length > 0) {
  console.error("Missing required Firebase config values:", missingFields);
  process.exit(1);
}

// Replace the config injection line with the actual config
const configString = JSON.stringify(firebaseConfig, null, 2);
console.log("\nInjected Config:");
console.log(configString);

swContent = swContent.replace(
  "const firebaseConfig = self.__FIREBASE_CONFIG__;",
  `const firebaseConfig = ${configString};`,
);

fs.writeFileSync(swPath, swContent);

console.log("\n✅ Service worker config injected successfully");
