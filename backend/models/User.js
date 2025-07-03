const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [100, "Display name cannot exceed 100 characters"],
    },
    // Profile picture/avatar
    profilePicture: {
      type: String,
      trim: true,
      default: null,
      select: true, // Explicitly include in queries
    },
    // Password for JWT authentication (optional if using Firebase)
    password: {
      type: String,
      required: false,
      minlength: [6, "Password must be at least 6 characters"],
    },
    // Email verification status
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // Admin privileges
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // Dream journal preferences
    preferences: {
      defaultDreamVisibility: {
        type: String,
        enum: ["private", "public", "friends"],
        default: "private",
      },
      notificationSettings: {
        dreamReminders: {
          type: Boolean,
          default: true,
        },
        lucidDreamTips: {
          type: Boolean,
          default: true,
        },
        weeklyStats: {
          type: Boolean,
          default: true,
        },
        realityCheckScheduler: {
          enabled: {
            type: Boolean,
            default: false,
          },
          frequency: {
            type: String,
            enum: [
              "hourly",
              "every_1_5_hours",
              "every_2_hours",
              "every_4_hours",
              "every_6_hours",
              "daily",
              "custom",
            ],
            default: "every_4_hours",
          },
          customInterval: {
            type: Number, // minutes
            default: 240, // 4 hours
          },
          startTime: {
            type: String, // HH:MM format
            default: "09:00",
          },
          endTime: {
            type: String, // HH:MM format
            default: "22:00",
          },
          message: {
            type: String,
            default: "Are you dreaming?",
            maxlength: [100, "Message cannot exceed 100 characters"],
          },
          daysOfWeek: {
            type: [String],
            enum: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
            default: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
          },
          timezone: {
            type: String,
            default: "UTC",
          },
        },
      },
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "auto",
      },
      timezone: {
        type: String,
        default: "UTC",
      },
    },
    // Lucid dreaming progress tracking
    lucidProgress: {
      totalDreams: {
        type: Number,
        default: 0,
      },
      lucidDreams: {
        type: Number,
        default: 0,
      },
      firstLucidDream: {
        type: Date,
        default: null,
      },
      lastLucidDream: {
        type: Date,
        default: null,
      },
      currentStreak: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      techniques: [
        {
          name: String,
          lastUsed: Date,
          successRate: Number,
        },
      ],
    },
    // Profile information
    profile: {
      bio: {
        type: String,
        maxlength: [500, "Bio cannot exceed 500 characters"],
      },
      experienceLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "expert"],
        default: "beginner",
      },
      goals: [String],
      interests: [String],
    },
    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    // FCM tokens for notifications
    fcmTokens: [
      {
        token: String,
        deviceInfo: {
          userAgent: String,
          platform: String,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Notification logs (most recent N entries)
    notificationLogs: [
      {
        type: { type: String }, // e.g., 'reality_check', 'custom', etc.
        title: String,
        body: String,
        timestamp: { type: Date, default: Date.now },
        success: Boolean,
        error: String,
      },
    ],
    // Custom user notifications (unlimited)
    customNotifications: [
      {
        title: { type: String, required: true, maxlength: 100 },
        message: { type: String, required: true, maxlength: 200 },
        frequency: {
          type: String,
          enum: [
            "hourly",
            "every_1_5_hours",
            "every_2_hours",
            "every_4_hours",
            "every_6_hours",
            "daily",
            "custom",
          ],
          required: true,
        },
        customInterval: { type: Number }, // minutes, if frequency is 'custom'
        startTime: { type: String, default: "09:00" }, // HH:MM
        endTime: { type: String, default: "22:00" }, // HH:MM
        daysOfWeek: {
          type: [String],
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
          default: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
        timezone: { type: String, default: "UTC" },
        enabled: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    // FCM token for push notifications
    fcmToken: {
      type: String,
      sparse: true, // Allows multiple null values
    },
    fcmTokenUpdatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Ensure profilePicture is always included in JSON output
        if (ret.profilePicture === undefined) {
          ret.profilePicture = null;
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        // Ensure profilePicture is always included in object output
        if (ret.profilePicture === undefined) {
          ret.profilePicture = null;
        }
        return ret;
      },
    },
  },
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ firebaseUid: 1 });
userSchema.index({ "preferences.defaultDreamVisibility": 1 });

// Virtual for lucid dream percentage
userSchema.virtual("lucidPercentage").get(function () {
  if (this.lucidProgress.totalDreams === 0) return 0;
  return Math.round(
    (this.lucidProgress.lucidDreams / this.lucidProgress.totalDreams) * 100,
  );
});

// Method to update lucid progress
userSchema.methods.updateLucidProgress = function (isLucid) {
  this.lucidProgress.totalDreams += 1;

  if (isLucid) {
    this.lucidProgress.lucidDreams += 1;
    this.lucidProgress.currentStreak += 1;

    if (!this.lucidProgress.firstLucidDream) {
      this.lucidProgress.firstLucidDream = new Date();
    }

    this.lucidProgress.lastLucidDream = new Date();

    if (this.lucidProgress.currentStreak > this.lucidProgress.longestStreak) {
      this.lucidProgress.longestStreak = this.lucidProgress.currentStreak;
    }
  } else {
    this.lucidProgress.currentStreak = 0;
  }

  return this.save();
};

// Static method to find or create user
userSchema.statics.findOrCreate = async function (firebaseUser) {
  let user = await this.findOne({ firebaseUid: firebaseUser.uid });

  if (!user) {
    user = new this({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
      profile: {
        bio: "",
        experienceLevel: "beginner",
        goals: [],
        interests: [],
      },
      preferences: {
        defaultDreamVisibility: "private",
        notificationSettings: {
          dreamReminders: true,
          lucidDreamTips: true,
          weeklyStats: true,
          realityCheckScheduler: {
            enabled: false,
            frequency: "every_4_hours",
            customInterval: 240,
            startTime: "09:00",
            endTime: "22:00",
            message: "Are you dreaming?",
            daysOfWeek: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
            timezone: "UTC",
          },
        },
        theme: "auto",
        timezone: "UTC",
      },
      lucidProgress: {
        totalDreams: 0,
        lucidDreams: 0,
        currentStreak: 0,
        longestStreak: 0,
        techniques: [],
      },
    });
    await user.save();
  } else {
    // Ensure existing users have proper profile structure
    let needsUpdate = false;

    if (!user.profile) {
      user.profile = {
        bio: "",
        experienceLevel: "beginner",
        goals: [],
        interests: [],
      };
      needsUpdate = true;
    } else {
      if (user.profile.bio === undefined) {
        user.profile.bio = "";
        needsUpdate = true;
      }
      if (user.profile.experienceLevel === undefined) {
        user.profile.experienceLevel = "beginner";
        needsUpdate = true;
      }
      if (!Array.isArray(user.profile.goals)) {
        user.profile.goals = [];
        needsUpdate = true;
      }
      if (!Array.isArray(user.profile.interests)) {
        user.profile.interests = [];
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      await user.save();
    }
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
