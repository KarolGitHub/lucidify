require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const mongoose = require("mongoose");
const Dream = require("../models/Dream");
const CryptoJS = require("crypto-js");

const ENCRYPTION_KEY = process.env.DREAMS_ENCRYPTION_KEY;

function isEncrypted(value) {
  // Heuristic: AES-encrypted strings are usually long and base64/hex-like
  return (
    typeof value === "string" &&
    value.length > 40 &&
    /^[A-Za-z0-9+/=]+$/.test(value)
  );
}

function encryptField(value) {
  if (!value || !ENCRYPTION_KEY) return value;
  // Always stringify arrays/objects before encrypting
  const toEncrypt =
    Array.isArray(value) || typeof value === "object"
      ? JSON.stringify(value)
      : value;
  return CryptoJS.AES.encrypt(toEncrypt, ENCRYPTION_KEY).toString();
}

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const dreams = await Dream.find({});
  let updated = 0;

  for (const dream of dreams) {
    let changed = false;

    ["title", "description", "emotions", "themes", "symbols", "tags"].forEach(
      (field) => {
        if (dream[field] && !isEncrypted(dream[field])) {
          dream[field] = encryptField(dream[field]);
          changed = true;
        }
      },
    );

    if (changed) {
      await dream.save();
      updated++;
    }
  }

  console.log(`Migration complete. Updated ${updated} dreams.`);
  process.exit(0);
}

migrate();
