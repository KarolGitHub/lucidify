const admin = require("firebase-admin");
const cron = require("node-cron");
const User = require("../models/User");

class NotificationService {
  constructor() {
    this.scheduledJobs = new Map();
  }

  // Store FCM token for a user
  async storeFCMToken(userId, token) {
    try {
      await User.findOneAndUpdate(
        { firebaseUid: userId },
        {
          fcmToken: token,
          fcmTokenUpdatedAt: new Date(),
        },
      );
      console.log(`FCM token stored for user: ${userId}`);
    } catch (error) {
      console.error("Error storing FCM token:", error);
      throw error;
    }
  }

  // Remove FCM token for a user
  async removeFCMToken(userId) {
    try {
      await User.findOneAndUpdate(
        { firebaseUid: userId },
        {
          $unset: { fcmToken: 1, fcmTokenUpdatedAt: 1 },
        },
      );
      console.log(`FCM token removed for user: ${userId}`);
    } catch (error) {
      console.error("Error removing FCM token:", error);
      throw error;
    }
  }

  // Send notification to a specific user
  async sendNotification(userId, title, body, data = {}) {
    try {
      const user = await User.findOne({ firebaseUid: userId });
      if (!user || !user.fcmToken) {
        console.log(`No FCM token found for user: ${userId}`);
        return false;
      }

      const message = {
        token: user.fcmToken,
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

      const response = await admin.messaging().send(message);
      console.log(`Notification sent to user ${userId}:`, response);
      return true;
    } catch (error) {
      console.error("Error sending notification:", error);

      // If token is invalid, remove it
      if (
        error.code === "messaging/invalid-registration-token" ||
        error.code === "messaging/registration-token-not-registered"
      ) {
        await this.removeFCMToken(userId);
      }

      return false;
    }
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
        `Reality check notifications scheduled for user ${userId} with cron: ${cronExpression}`,
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
      const users = await User.find({
        "preferences.notificationSettings.realityCheckScheduler.enabled": true,
        fcmToken: { $exists: true, $ne: null },
      });

      for (const user of users) {
        await this.scheduleRealityChecks(user.firebaseUid);
      }

      console.log(
        `Initialized reality check schedules for ${users.length} users`,
      );
    } catch (error) {
      console.error("Error initializing reality check schedules:", error);
    }
  }

  // Clean up all scheduled jobs
  cleanup() {
    for (const [userId, job] of this.scheduledJobs) {
      job.stop();
    }
    this.scheduledJobs.clear();
    console.log("All scheduled jobs cleaned up");
  }
}

module.exports = new NotificationService();
