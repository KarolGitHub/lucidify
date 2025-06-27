const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/lucidify";
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

async function cleanupInvalidTokens() {
  try {
    await connectDB();

    console.log("🧹 Starting FCM token cleanup...\n");

    // Find all users with FCM tokens
    const usersWithTokens = await User.find({
      fcmToken: { $exists: true, $ne: null },
    });

    console.log(`📊 Found ${usersWithTokens.length} users with FCM tokens`);

    let validTokens = 0;
    let invalidTokens = 0;
    let cleanedUsers = 0;

    for (const user of usersWithTokens) {
      try {
        // Basic validation: check token format
        if (!user.fcmToken || user.fcmToken.length < 100) {
          console.log(
            `⚠️ Invalid token format for user ${user.firebaseUid}: ${user.fcmToken?.substring(0, 20)}...`,
          );

          // Remove invalid token
          await User.findOneAndUpdate(
            { firebaseUid: user.firebaseUid },
            {
              $unset: { fcmToken: 1, fcmTokenUpdatedAt: 1 },
            },
          );

          invalidTokens++;
          cleanedUsers++;
          continue;
        }

        // Check if token looks like a valid FCM token (starts with common patterns)
        const isValidFormat = /^[\w-:.]{140,}$/.test(user.fcmToken);

        if (!isValidFormat) {
          console.log(
            `⚠️ Suspicious token format for user ${user.firebaseUid}: ${user.fcmToken.substring(0, 20)}...`,
          );

          // Remove suspicious token
          await User.findOneAndUpdate(
            { firebaseUid: user.firebaseUid },
            {
              $unset: { fcmToken: 1, fcmTokenUpdatedAt: 1 },
            },
          );

          invalidTokens++;
          cleanedUsers++;
          continue;
        }

        validTokens++;
        console.log(
          `✅ Valid token for user ${user.firebaseUid}: ${user.fcmToken.substring(0, 20)}...`,
        );
      } catch (error) {
        console.error(
          `❌ Error processing user ${user.firebaseUid}:`,
          error.message,
        );
      }
    }

    console.log("\n🎯 Cleanup Summary:");
    console.log(`   ✅ Valid tokens: ${validTokens}`);
    console.log(`   ❌ Invalid tokens removed: ${invalidTokens}`);
    console.log(`   🧹 Users cleaned: ${cleanedUsers}`);
    console.log(`   📊 Total processed: ${usersWithTokens.length}`);

    // Show users with reality check scheduler enabled
    const enabledUsers = await User.find({
      "preferences.notificationSettings.realityCheckScheduler.enabled": true,
    });

    console.log(`\n🔔 Reality Check Scheduler Status:`);
    console.log(`   📊 Total enabled users: ${enabledUsers.length}`);

    const enabledWithTokens = enabledUsers.filter(
      (user) => user.fcmToken && user.fcmToken.length >= 100,
    );
    console.log(
      `   ✅ Enabled users with valid tokens: ${enabledWithTokens.length}`,
    );
    console.log(
      `   ⚠️ Enabled users without valid tokens: ${enabledUsers.length - enabledWithTokens.length}`,
    );

    if (enabledUsers.length - enabledWithTokens.length > 0) {
      console.log("\n⚠️ Users with enabled scheduler but no valid tokens:");
      enabledUsers.forEach((user) => {
        if (!user.fcmToken || user.fcmToken.length < 100) {
          console.log(`   - ${user.firebaseUid} (${user.email})`);
        }
      });
    }
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run cleanup
cleanupInvalidTokens();
