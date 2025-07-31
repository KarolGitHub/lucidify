require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const mongoose = require("mongoose");
const Dream = require("../models/Dream");
const CryptoJS = require("crypto-js");

const ENCRYPTION_KEY = process.env.DREAMS_ENCRYPTION_KEY;

// Old decryptField logic (the buggy one)
function oldDecryptField(value) {
  if (!value || !ENCRYPTION_KEY) return value;
  if (value === "") return [];
  try {
    const bytes = CryptoJS.AES.decrypt(value, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    return value;
  }
}

async function fixDreams() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("🔗 Connected to MongoDB");

  const dreams = await Dream.find({});
  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const dream of dreams) {
    let updated = false;
    try {
      // Only fix if the field is a string (encrypted) and not already an array
      ["tags", "emotions", "themes", "symbols"].forEach((field) => {
        if (
          typeof dream[field] === "string" &&
          dream[field] &&
          !Array.isArray(dream[field])
        ) {
          const decrypted = oldDecryptField(dream[field]);
          if (Array.isArray(decrypted)) {
            dream[field] = decrypted;
            updated = true;
          }
        }
      });
      // Also fix title/description if they are encrypted JSON strings
      ["title", "description"].forEach((field) => {
        if (
          typeof dream[field] === "string" &&
          dream[field] &&
          dream[field].startsWith("[")
        ) {
          // Try to parse as JSON array, fallback to string
          try {
            const parsed = JSON.parse(dream[field]);
            if (typeof parsed === "string") {
              dream[field] = parsed;
              updated = true;
            }
          } catch {}
        }
      });
      if (updated) {
        await dream.save();
        fixed++;
        console.log(`✅ Fixed dream ${dream._id}`);
      } else {
        skipped++;
      }
    } catch (err) {
      errors++;
      console.error(`❌ Error fixing dream ${dream._id}:`, err.message);
    }
  }
  console.log("\n🎉 Migration complete!");
  console.log(`✅ Fixed: ${fixed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  process.exit(0);
}

fixDreams();
