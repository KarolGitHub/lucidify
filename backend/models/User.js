const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      index: true,
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
        createdAt: {
          type: Date,
          default: Date.now,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
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
    });
    await user.save();
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
