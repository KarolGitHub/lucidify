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
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("🔗 Connected to MongoDB");
    console.log(
      "🔐 Using encryption key:",
      ENCRYPTION_KEY ? "✅ Present" : "❌ Missing",
    );

    // Use direct MongoDB operations to bypass Mongoose validation
    const db = mongoose.connection.db;
    const collection = db.collection("dreams");

    const dreams = await collection.find({}).toArray();
    console.log(`📊 Found ${dreams.length} dreams to process`);

    let updated = 0;
    let errors = 0;

    for (const dream of dreams) {
      try {
        let changed = false;
        const updateData = {};

        [
          "title",
          "description",
          "emotions",
          "themes",
          "symbols",
          "tags",
        ].forEach((field) => {
          if (dream[field] && !isEncrypted(dream[field])) {
            updateData[field] = encryptField(dream[field]);
            changed = true;
            console.log(`🔐 Encrypting ${field} for dream ${dream._id}`);
          }
        });

        if (changed) {
          // Use direct MongoDB update to bypass Mongoose validation
          await collection.updateOne({ _id: dream._id }, { $set: updateData });
          updated++;
          console.log(`✅ Updated dream ${dream._id}`);
        } else {
          console.log(
            `⏭️  Dream ${dream._id} already encrypted or no changes needed`,
          );
        }
      } catch (error) {
        console.error(`❌ Error processing dream ${dream._id}:`, error.message);
        errors++;
      }
    }

    console.log(`\n🎉 Migration complete!`);
    console.log(`✅ Updated: ${updated} dreams`);
    console.log(`❌ Errors: ${errors} dreams`);
    console.log(`📊 Total processed: ${dreams.length} dreams`);

    process.exit(0);
  } catch (error) {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  }
}

migrate();
