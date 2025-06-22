const admin = require("firebase-admin");
const cron = require("node-cron");
const User = require("../models/User");

class NotificationService {
  constructor() {
    this.scheduledJobs = new Map();
    this.lastNotificationTime = new Map(); // Track last notification time per user
    this.notificationCooldown = 5 * 60 * 1000; // 5 minutes cooldown
  }

  // Store FCM token for a user (add to fcmTokens array if not present)
  async storeFCMToken(userId, token, deviceInfo = {}) {
    try {
      await User.findOneAndUpdate(
        { firebaseUid: userId, "fcmTokens.token": { $ne: token } },
        {
          $push: {
            fcmTokens: {
              token,
              deviceInfo,
              createdAt: new Date(),
              isActive: true,
            },
          },
          fcmTokenUpdatedAt: new Date(),
        },
        { upsert: false },
      );
      console.log(`FCM token stored for user: ${userId}`);
    } catch (error) {
      console.error("Error storing FCM token:", error);
      throw error;
    }
  }

  // Remove a specific FCM token for a user
  async removeFCMToken(userId, token) {
    try {
      await User.findOneAndUpdate(
        { firebaseUid: userId },
        {
          $pull: { fcmTokens: { token } },
        },
      );
      console.log(
        `FCM token removed for user: ${userId} (token: ${token?.substring?.(0, 20)})`,
      );
    } catch (error) {
      console.error("Error removing FCM token:", error);
      throw error;
    }
  }

  // Send notification to all active tokens for a user
  async sendNotification(userId, title, body, data = {}) {
    try {
      const user = await User.findOne({ firebaseUid: userId });
      if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
        console.log(`No FCM tokens found for user: ${userId}`);
        return false;
      }

      // Check cooldown to prevent duplicate notifications
      const lastNotification = this.lastNotificationTime.get(userId);
      const now = Date.now();
      if (
        lastNotification &&
        now - lastNotification < this.notificationCooldown
      ) {
        console.log(
          `⏰ Skipping notification for user ${userId}: Cooldown period active`,
        );
        return false;
      }

      // Send to only the most recent token to prevent duplicates
      const activeTokens = user.fcmTokens.filter(
        (tokenObj) => tokenObj.isActive !== false,
      );
      if (activeTokens.length === 0) {
        console.log(`No active FCM tokens found for user: ${userId}`);
        return false;
      }

      // Sort by creation date and use the most recent token
      const sortedTokens = activeTokens.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      const mostRecentToken = sortedTokens[0];

      console.log(
        `Attempting to send notification to user: ${userId} with token: ${mostRecentToken.token.substring(0, 20)}...`,
      );

      const message = {
        token: mostRecentToken.token,
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
        android: {
          priority: "high",
          notification: {
            channelId: "reality-check",
            priority: "high",
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
      };

      try {
        const response = await admin.messaging().send(message);
        console.log(
          `✅ Notification sent successfully to user ${userId}:`,
          response,
        );

        // Update last notification time
        this.lastNotificationTime.set(userId, now);
        return true;
      } catch (error) {
        console.error(
          `❌ Error sending notification to user ${userId}:`,
          error.message,
        );
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          errorInfo: error.errorInfo,
        });
        // If token is invalid, remove only this token
        if (
          error.code === "messaging/invalid-registration-token" ||
          error.code === "messaging/registration-token-not-registered"
        ) {
          console.log(`🔄 Removing invalid FCM token for user: ${userId}`);
          await this.removeFCMToken(userId, mostRecentToken.token);
        }
        return false;
      }
    } catch (error) {
      console.error(`❌ Error sending notification to user ${userId}:`, error);
      return false;
    }
  }

  // Validate FCM token format
  validateFCMToken(token) {
    if (!token || typeof token !== "string") {
      return false;
    }

    // FCM tokens are typically 140+ characters long and contain alphanumeric characters, hyphens, and underscores
    return /^[\w-:.]{140,}$/.test(token);
  }

  // Check if current time is within the scheduled window
  isWithinTimeWindow(settings) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes since midnight

    const [startHour, startMinute] = settings.startTime.split(":").map(Number);
    const [endHour, endMinute] = settings.endTime.split(":").map(Number);

    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;

    // Handle overnight schedules (e.g., 22:00 to 06:00)
    if (endTimeMinutes < startTimeMinutes) {
      return currentTime >= startTimeMinutes || currentTime <= endTimeMinutes;
    }

    return currentTime >= startTimeMinutes && currentTime <= endTimeMinutes;
  }

  // Check if current day is in the allowed days
  isAllowedDay(settings) {
    const now = new Date();
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const currentDay = dayNames[now.getDay()];
    return settings.daysOfWeek.includes(currentDay);
  }

  // Schedule reality check notifications for a user
  async scheduleRealityChecks(userId) {
    try {
      // Stop existing job if any
      this.stopRealityChecks(userId);

      const user = await User.findOne({ firebaseUid: userId });
      if (
        !user ||
        !user.preferences.notificationSettings.realityCheckScheduler.enabled
      ) {
        console.log(`⏹️ Reality check scheduler disabled for user: ${userId}`);
        return;
      }

      // Validate FCM token before scheduling
      if (!user.fcmTokens || user.fcmTokens.length === 0) {
        console.log(
          `⚠️ Skipping reality check scheduling for user ${userId}: No active FCM tokens`,
        );
        return;
      }

      const settings =
        user.preferences.notificationSettings.realityCheckScheduler;

      // Calculate interval in minutes
      let intervalMinutes;
      switch (settings.frequency) {
        case "hourly":
          intervalMinutes = 60;
          break;
        case "every_1_5_hours":
          intervalMinutes = 90; // 1.5 hours = 90 minutes
          break;
        case "every_2_hours":
          intervalMinutes = 120;
          break;
        case "every_4_hours":
          intervalMinutes = 240;
          break;
        case "every_6_hours":
          intervalMinutes = 360;
          break;
        case "daily":
          intervalMinutes = 1440; // 24 hours
          break;
        case "custom":
          intervalMinutes = settings.customInterval;
          break;
        default:
          intervalMinutes = 240;
      }

      // Create cron expression
      const cronExpression = this.createCronExpression(
        settings,
        intervalMinutes,
      );

      const job = cron.schedule(
        cronExpression,
        async () => {
          // Check if we're within the allowed time window and day
          if (
            !this.isWithinTimeWindow(settings) ||
            !this.isAllowedDay(settings)
          ) {
            console.log(
              `⏰ Skipping reality check for user ${userId}: Outside scheduled window`,
            );
            return;
          }

          await this.sendRealityCheckNotification(userId, settings);
        },
        {
          scheduled: false,
          timezone: settings.timezone || "UTC",
        },
      );

      job.start();
      this.scheduledJobs.set(userId, job);

      console.log(
        `✅ Reality check notifications scheduled for user ${userId} with cron: ${cronExpression}`,
      );
    } catch (error) {
      console.error("Error scheduling reality checks:", error);
    }
  }

  // Stop reality check notifications for a user
  stopRealityChecks(userId) {
    const job = this.scheduledJobs.get(userId);
    if (job) {
      job.stop();
      this.scheduledJobs.delete(userId);
      console.log(`Reality check notifications stopped for user: ${userId}`);
    }
  }

  // Create cron expression based on settings
  createCronExpression(settings, intervalMinutes) {
    const [startHour, startMinute] = settings.startTime.split(":").map(Number);
    const [endHour, endMinute] = settings.endTime.split(":").map(Number);

    // Convert days of week to cron format (0 = Sunday, 1 = Monday, etc.)
    const dayMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const days = settings.daysOfWeek.map((day) => dayMap[day]).join(",");

    if (intervalMinutes >= 1440) {
      // Daily or longer intervals
      return `${startMinute} ${startHour} * * ${days}`;
    } else if (intervalMinutes >= 60) {
      // Hourly intervals
      const hours = Math.floor(intervalMinutes / 60);
      return `${startMinute} ${startHour}-${endHour}/${hours} * * ${days}`;
    } else {
      // Minute intervals (less than 1 hour)
      return `*/${intervalMinutes} ${startHour}-${endHour} * * ${days}`;
    }
  }

  // Send a reality check notification
  async sendRealityCheckNotification(userId, settings) {
    const title = "Reality Check";
    const body = settings.message || "Are you dreaming?";

    await this.sendNotification(userId, title, body, {
      type: "reality-check",
      timestamp: new Date().toISOString(),
    });
  }

  // Initialize reality check schedules for all enabled users
  async initializeAllSchedules() {
    try {
      console.log("🔍 Finding users with enabled reality check scheduler...");

      const users = await User.find({
        "preferences.notificationSettings.realityCheckScheduler.enabled": true,
        fcmTokens: { $exists: true, $ne: [] },
      });

      console.log(
        `📊 Found ${users.length} users with enabled reality check scheduler`,
      );

      let scheduledCount = 0;
      let skippedCount = 0;

      for (const user of users) {
        try {
          // Validate FCM tokens using the new validation method
          for (const tokenObj of user.fcmTokens) {
            const token = tokenObj.token;
            if (!token || !this.validateFCMToken(token)) {
              console.log(
                `⚠️ Skipping user ${user.firebaseUid}: Invalid FCM token format`,
              );
              skippedCount++;
              continue;
            }
          }

          await this.scheduleRealityChecks(user.firebaseUid);
          scheduledCount++;
          console.log(
            `✅ Scheduled reality checks for user: ${user.firebaseUid}`,
          );
        } catch (error) {
          console.error(
            `❌ Error scheduling reality checks for user ${user.firebaseUid}:`,
            error.message,
          );
          skippedCount++;
        }
      }

      console.log(`🎯 Reality check initialization complete:`);
      console.log(`   ✅ Successfully scheduled: ${scheduledCount} users`);
      console.log(`   ⚠️ Skipped: ${skippedCount} users`);
      console.log(`   📊 Total processed: ${users.length} users`);
    } catch (error) {
      console.error("❌ Error initializing reality check schedules:", error);
    }
  }

  // Clean up all scheduled jobs
  cleanup() {
    for (const [userId, job] of this.scheduledJobs) {
      job.stop();
    }
    this.scheduledJobs.clear();
    this.lastNotificationTime.clear();
    console.log("All scheduled jobs cleaned up");
  }
}

module.exports = new NotificationService();
