const express = require("express");
const User = require("../models/User");
const { authenticateUser } = require("../middleware/auth");
const notificationService = require("../services/notificationService");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Multer setup for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads/avatars");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${req.user.firebaseUid}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});
const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// GET /api/users/profile - Get current user profile
router.get("/profile", authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({
      firebaseUid: req.user.firebaseUid,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Debug: Direct MongoDB query to bypass Mongoose
    const db = User.db;
    const collection = db.collection("users");
    const rawDoc = await collection.findOne({
      firebaseUid: req.user.firebaseUid,
    });
    console.log("Direct MongoDB document:", JSON.stringify(rawDoc, null, 2));

    // Debug: Check what's actually in the database
    console.log(
      "Raw user object from database:",
      JSON.stringify(user.toObject(), null, 2),
    );
    console.log("profilePicture field specifically:", user.profilePicture);

    // Debug: Try different query methods
    const userLean = await User.findOne({
      firebaseUid: req.user.firebaseUid,
    }).lean();
    console.log("Lean query profilePicture:", userLean.profilePicture);

    const userById = await User.findById(user._id);
    console.log("FindById profilePicture:", userById.profilePicture);

    console.log(
      "Returning user profile:",
      JSON.stringify(
        {
          displayName: user.displayName,
          profilePicture: user.profilePicture,
          profile: user.profile,
          preferences: user.preferences,
        },
        null,
        2,
      ),
    );

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// PUT /api/users/profile - Update user profile
router.put(
  "/profile",
  authenticateUser,
  [
    body("displayName")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Display name cannot exceed 100 characters"),
    body("profile.bio")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Bio cannot exceed 500 characters"),
    body("profile.experienceLevel")
      .optional()
      .isIn(["beginner", "intermediate", "advanced", "expert"])
      .withMessage("Invalid experience level"),
    body("profile.goals")
      .optional()
      .isArray()
      .withMessage("Goals must be an array"),
    body("profile.interests")
      .optional()
      .isArray()
      .withMessage("Interests must be an array"),
    body("profilePicture")
      .optional()
      .custom((value) => {
        // Allow empty string, null, or undefined
        if (!value || value === "") {
          return true;
        }
        // Allow relative paths starting with /
        if (value.startsWith("/")) {
          return true;
        }
        // Allow full URLs
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      })
      .withMessage("Profile picture must be a valid URL or relative path"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      console.log(
        "Profile update request body:",
        JSON.stringify(req.body, null, 2),
      );

      const updateData = {};

      // Handle display name
      if (req.body.displayName !== undefined) {
        updateData.displayName = req.body.displayName;
      }

      // Handle profile picture
      if (req.body.profilePicture !== undefined) {
        updateData.profilePicture = req.body.profilePicture;
      }

      // Handle profile updates
      if (req.body.profile) {
        if (req.body.profile.bio !== undefined) {
          updateData["profile.bio"] = req.body.profile.bio;
        }
        if (req.body.profile.experienceLevel !== undefined) {
          updateData["profile.experienceLevel"] =
            req.body.profile.experienceLevel;
        }
        if (req.body.profile.goals !== undefined) {
          updateData["profile.goals"] = req.body.profile.goals;
        }
        if (req.body.profile.interests !== undefined) {
          updateData["profile.interests"] = req.body.profile.interests;
        }
      }

      // Handle preferences updates
      if (req.body.preferences) {
        if (req.body.preferences.defaultDreamVisibility !== undefined) {
          updateData["preferences.defaultDreamVisibility"] =
            req.body.preferences.defaultDreamVisibility;
        }
        if (req.body.preferences.theme !== undefined) {
          updateData["preferences.theme"] = req.body.preferences.theme;
        }
        if (req.body.preferences.timezone !== undefined) {
          updateData["preferences.timezone"] = req.body.preferences.timezone;
        }
        if (req.body.preferences.notificationSettings) {
          const notifSettings = req.body.preferences.notificationSettings;
          if (notifSettings.dreamReminders !== undefined) {
            updateData["preferences.notificationSettings.dreamReminders"] =
              notifSettings.dreamReminders;
          }
          if (notifSettings.lucidDreamTips !== undefined) {
            updateData["preferences.notificationSettings.lucidDreamTips"] =
              notifSettings.lucidDreamTips;
          }
          if (notifSettings.weeklyStats !== undefined) {
            updateData["preferences.notificationSettings.weeklyStats"] =
              notifSettings.weeklyStats;
          }
        }
      }

      console.log(
        "Update data to be applied:",
        JSON.stringify(updateData, null, 2),
      );

      const user = await User.findOneAndUpdate(
        { firebaseUid: req.user.firebaseUid },
        updateData,
        { new: true, runValidators: true },
      );

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log(
        "Updated user profile:",
        JSON.stringify(
          {
            displayName: user.displayName,
            profilePicture: user.profilePicture,
            profile: user.profile,
            preferences: user.preferences,
          },
          null,
          2,
        ),
      );

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ error: "Failed to update user profile" });
    }
  },
);

// GET /api/users/settings - Get user settings
router.get("/settings", authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const settings = {
      theme: user.preferences.theme,
      timezone: user.preferences.timezone,
      defaultDreamVisibility: user.preferences.defaultDreamVisibility,
      notifications: {
        dreamReminders: user.preferences.notificationSettings.dreamReminders,
        lucidDreamTips: user.preferences.notificationSettings.lucidDreamTips,
        weeklyStats: user.preferences.notificationSettings.weeklyStats,
      },
    };

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(500).json({ error: "Failed to fetch user settings" });
  }
});

// PUT /api/users/settings - Update user settings
router.put(
  "/settings",
  authenticateUser,
  [
    body("theme")
      .optional()
      .isIn(["light", "dark", "auto"])
      .withMessage("Invalid theme"),
    body("timezone")
      .optional()
      .isString()
      .withMessage("Timezone must be a string"),
    body("defaultDreamVisibility")
      .optional()
      .isIn(["private", "public", "friends"])
      .withMessage("Invalid dream visibility setting"),
    body("notifications.dreamReminders")
      .optional()
      .isBoolean()
      .withMessage("Dream reminders must be boolean"),
    body("notifications.lucidDreamTips")
      .optional()
      .isBoolean()
      .withMessage("Lucid dream tips must be boolean"),
    body("notifications.weeklyStats")
      .optional()
      .isBoolean()
      .withMessage("Weekly stats must be boolean"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const updateData = {};

      if (req.body.theme !== undefined) {
        updateData["preferences.theme"] = req.body.theme;
      }
      if (req.body.timezone !== undefined) {
        updateData["preferences.timezone"] = req.body.timezone;
      }
      if (req.body.defaultDreamVisibility !== undefined) {
        updateData["preferences.defaultDreamVisibility"] =
          req.body.defaultDreamVisibility;
      }
      if (req.body.notifications) {
        if (req.body.notifications.dreamReminders !== undefined) {
          updateData["preferences.notificationSettings.dreamReminders"] =
            req.body.notifications.dreamReminders;
        }
        if (req.body.notifications.lucidDreamTips !== undefined) {
          updateData["preferences.notificationSettings.lucidDreamTips"] =
            req.body.notifications.lucidDreamTips;
        }
        if (req.body.notifications.weeklyStats !== undefined) {
          updateData["preferences.notificationSettings.weeklyStats"] =
            req.body.notifications.weeklyStats;
        }
      }

      const user = await User.findOneAndUpdate(
        { firebaseUid: req.user.firebaseUid },
        updateData,
        { new: true, runValidators: true },
      );

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const settings = {
        theme: user.preferences.theme,
        timezone: user.preferences.timezone,
        defaultDreamVisibility: user.preferences.defaultDreamVisibility,
        notifications: {
          dreamReminders: user.preferences.notificationSettings.dreamReminders,
          lucidDreamTips: user.preferences.notificationSettings.lucidDreamTips,
          weeklyStats: user.preferences.notificationSettings.weeklyStats,
        },
      };

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ error: "Failed to update user settings" });
    }
  },
);

// DELETE /api/users/account - Delete user account
router.delete("/account", authenticateUser, async (req, res) => {
  try {
    const firebaseUid = req.user.firebaseUid;

    console.log(`Deleting account for user: ${firebaseUid}`);

    // First, find the user to get their ID
    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete all associated dreams
    const Dream = require("../models/Dream");
    const dreamsDeleted = await Dream.deleteMany({ userId: firebaseUid });
    console.log(
      `Deleted ${dreamsDeleted.deletedCount} dreams for user ${firebaseUid}`,
    );

    // Delete FCM tokens and notification data
    try {
      await notificationService.removeFCMToken(firebaseUid);
      console.log(`Removed FCM tokens for user ${firebaseUid}`);
    } catch (error) {
      console.warn(
        `Failed to remove FCM tokens for user ${firebaseUid}:`,
        error,
      );
    }

    // Delete the user account from database
    const deletedUser = await User.findOneAndDelete({ firebaseUid });

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Note: Firebase user account deletion should be handled client-side
    // due to security restrictions. The backend will delete all associated data.
    console.log(`Successfully deleted account for user: ${firebaseUid}`);

    res.json({
      success: true,
      message: "Account and all associated data deleted successfully",
      deletedData: {
        user: true,
        dreams: dreamsDeleted.deletedCount,
        notifications: true,
      },
      note: "Please delete your Firebase account manually if needed",
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({ error: "Failed to delete user account" });
  }
});

// GET /api/users/export - Export user data
router.get("/export", authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // TODO: Include dreams and other user data in export
    const exportData = {
      user: user.toObject(),
      exportDate: new Date(),
      version: "1.0",
    };

    res.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error("Error exporting user data:", error);
    res.status(500).json({ error: "Failed to export user data" });
  }
});

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

// POST /api/users/upload-avatar - Upload user avatar
router.post(
  "/upload-avatar",
  authenticateUser,
  avatarUpload.single("avatar"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Get current user to check if they have an existing avatar
      const currentUser = await User.findOne({
        firebaseUid: req.user.firebaseUid,
      });

      // Return the public URL for the uploaded avatar
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      // Update the user's profile with the new avatar URL
      const updatedUser = await User.findOneAndUpdate(
        { firebaseUid: req.user.firebaseUid },
        { profilePicture: avatarUrl },
        { new: true },
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Debug: Check what was actually saved
      console.log(
        "Avatar upload - updatedUser.profilePicture:",
        updatedUser.profilePicture,
      );
      console.log("Avatar upload - avatarUrl that was saved:", avatarUrl);

      // Debug: Direct database query to verify what's stored
      const directUser = await User.findOne({
        firebaseUid: req.user.firebaseUid,
      }).lean();
      console.log(
        "Avatar upload - Direct DB query profilePicture:",
        directUser.profilePicture,
      );

      // Delete the old avatar file if it exists and is different from the new one
      if (
        currentUser &&
        currentUser.profilePicture &&
        currentUser.profilePicture !== avatarUrl
      ) {
        const oldAvatarPath = path.join(
          __dirname,
          "..",
          currentUser.profilePicture,
        );
        try {
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
            console.log(`Deleted old avatar: ${oldAvatarPath}`);
          }
        } catch (deleteError) {
          console.error("Error deleting old avatar file:", deleteError);
          // Don't fail the upload if we can't delete the old file
        }
      }

      console.log(
        `Avatar uploaded and saved for user ${req.user.firebaseUid}: ${avatarUrl}`,
      );

      res.json({
        success: true,
        url: avatarUrl,
        message: "Avatar uploaded and profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating user profile with avatar:", error);
      res
        .status(500)
        .json({ error: "Failed to update user profile with avatar" });
    }
  },
);

module.exports = router;
