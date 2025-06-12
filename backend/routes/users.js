const express = require("express");
const User = require("../models/User");
const { authenticateUser } = require("../middleware/auth");
const notificationService = require("../services/notificationService");
const router = express.Router();

// Update reality check scheduler settings
router.put("/reality-check-scheduler", authenticateUser, async (req, res) => {
  try {
    const {
      enabled,
      frequency,
      customInterval,
      startTime,
      endTime,
      message,
      daysOfWeek,
      timezone,
    } = req.body;

    const updateData = {
      "preferences.notificationSettings.realityCheckScheduler.enabled": enabled,
      "preferences.notificationSettings.realityCheckScheduler.frequency":
        frequency,
      "preferences.notificationSettings.realityCheckScheduler.customInterval":
        customInterval,
      "preferences.notificationSettings.realityCheckScheduler.startTime":
        startTime,
      "preferences.notificationSettings.realityCheckScheduler.endTime": endTime,
      "preferences.notificationSettings.realityCheckScheduler.message": message,
      "preferences.notificationSettings.realityCheckScheduler.daysOfWeek":
        daysOfWeek,
      "preferences.notificationSettings.realityCheckScheduler.timezone":
        timezone,
    };

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user.firebaseUid },
      updateData,
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Schedule or unschedule notifications based on enabled status
    if (enabled) {
      await notificationService.scheduleRealityChecks(req.user.firebaseUid);
    } else {
      notificationService.stopRealityChecks(req.user.firebaseUid);
    }

    res.json({
      message: "Reality check scheduler settings updated successfully",
      realityCheckScheduler:
        user.preferences.notificationSettings.realityCheckScheduler,
    });
  } catch (error) {
    console.error("Error updating reality check scheduler settings:", error);
    res
      .status(500)
      .json({ message: "Error updating reality check scheduler settings" });
  }
});

// Get reality check scheduler settings
router.get("/reality-check-scheduler", authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      realityCheckScheduler:
        user.preferences.notificationSettings.realityCheckScheduler,
    });
  } catch (error) {
    console.error("Error fetching reality check scheduler settings:", error);
    res
      .status(500)
      .json({ message: "Error fetching reality check scheduler settings" });
  }
});

// Store FCM token for push notifications
router.post("/fcm-token", authenticateUser, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "FCM token is required" });
    }

    await notificationService.storeFCMToken(req.user.firebaseUid, token);

    res.json({ message: "FCM token stored successfully" });
  } catch (error) {
    console.error("Error storing FCM token:", error);
    res.status(500).json({ message: "Error storing FCM token" });
  }
});

// Remove FCM token
router.delete("/fcm-token", authenticateUser, async (req, res) => {
  try {
    await notificationService.removeFCMToken(req.user.firebaseUid);

    res.json({ message: "FCM token removed successfully" });
  } catch (error) {
    console.error("Error removing FCM token:", error);
    res.status(500).json({ message: "Error removing FCM token" });
  }
});

module.exports = router;
