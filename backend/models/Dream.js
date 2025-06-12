const mongoose = require("mongoose");

const dreamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Dream title is required"],
      trim: true,
      maxlength: [200, "Dream title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Dream description is required"],
      trim: true,
      maxlength: [10000, "Dream description cannot exceed 10,000 characters"],
    },
    date: {
      type: Date,
      required: [true, "Dream date is required"],
      default: Date.now,
    },
    // Dream type flags
    isLucid: {
      type: Boolean,
      default: false,
    },
    isVivid: {
      type: Boolean,
      default: false,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    isNightmare: {
      type: Boolean,
      default: false,
    },
    // Tags for categorization
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    // Emotions experienced in the dream
    emotions: [
      {
        type: String,
        enum: [
          "Joy",
          "Fear",
          "Sadness",
          "Anger",
          "Surprise",
          "Disgust",
          "Love",
          "Confusion",
          "Excitement",
          "Anxiety",
          "Peace",
          "Wonder",
          "Euphoria",
          "Terror",
          "Melancholy",
          "Rage",
          "Shock",
          "Revulsion",
          "Passion",
          "Bewilderment",
          "Thrill",
          "Dread",
          "Serenity",
          "Awe",
        ],
      },
    ],
    // Lucid dreaming specific fields
    lucidDetails: {
      awarenessLevel: {
        type: Number,
        min: 1,
        max: 10,
        default: null,
      },
      controlLevel: {
        type: Number,
        min: 1,
        max: 10,
        default: null,
      },
      techniquesUsed: [
        {
          type: String,
          enum: [
            "Reality Check",
            "MILD",
            "WILD",
            "SSILD",
            "FILD",
            "Dream Journaling",
            "Meditation",
            "Wake Back to Bed",
            "Other",
          ],
        },
      ],
      dreamSigns: [String],
      stabilizationTechniques: [String],
    },
    // Dream environment and setting
    setting: {
      location: String,
      timeOfDay: {
        type: String,
        enum: ["Morning", "Afternoon", "Evening", "Night", "Unknown"],
      },
      weather: String,
      colors: [String],
      lighting: String,
    },
    // Characters and entities in the dream
    characters: [
      {
        type: {
          type: String,
          enum: ["Person", "Animal", "Mythical", "Unknown", "Self"],
        },
        description: String,
        role: String,
        isFamiliar: Boolean,
      },
    ],
    // Dream interpretation and insights
    interpretation: {
      personalMeaning: String,
      symbols: [String],
      insights: String,
      lessons: String,
    },
    // Sleep quality and context
    sleepContext: {
      sleepDuration: Number, // in hours
      sleepQuality: {
        type: String,
        enum: ["Poor", "Fair", "Good", "Excellent"],
      },
      stressLevel: {
        type: Number,
        min: 1,
        max: 10,
      },
      medications: [String],
      substances: [String], // caffeine, alcohol, etc.
    },
    // User reference
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    // Metadata
    isPublic: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for better query performance
dreamSchema.index({ userId: 1, date: -1 });
dreamSchema.index({ userId: 1, isLucid: 1 });
dreamSchema.index({ userId: 1, tags: 1 });
dreamSchema.index({ userId: 1, emotions: 1 });
dreamSchema.index({ title: "text", description: "text" });

// Virtual for dream age (days since dream)
dreamSchema.virtual("ageInDays").get(function () {
  return Math.floor((Date.now() - this.date) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to clean up tags and handle date conversion
dreamSchema.pre("save", function (next) {
  // Clean up tags
  if (this.tags) {
    this.tags = this.tags
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)
      .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates
  }

  // Ensure date is a proper Date object
  if (this.date) {
    let parsedDate = null;

    // If it's already a Date object, use it
    if (this.date instanceof Date) {
      parsedDate = this.date;
    }
    // If it's a string, try to parse it
    else if (typeof this.date === "string") {
      // Try dd.mm.rrrr format first
      if (this.date.includes(".")) {
        const parts = this.date.split(".");
        if (parts.length === 3) {
          const [day, month, year] = parts;
          parsedDate = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
          );
        }
      }

      // If dd.mm.rrrr parsing failed, try standard Date constructor
      if (!parsedDate || isNaN(parsedDate.getTime())) {
        parsedDate = new Date(this.date);
      }
    }

    // Validate the parsed date
    if (!parsedDate || isNaN(parsedDate.getTime())) {
      return next(
        new Error(
          "Invalid date format. Please use dd.mm.rrrr format (e.g., 15.01.2024)",
        ),
      );
    }

    this.date = parsedDate;
  }

  next();
});

// Static method to get dream statistics for a user
dreamSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalDreams: { $sum: 1 },
        lucidDreams: { $sum: { $cond: ["$isLucid", 1, 0] } },
        vividDreams: { $sum: { $cond: ["$isVivid", 1, 0] } },
        recurringDreams: { $sum: { $cond: ["$isRecurring", 1, 0] } },
        nightmares: { $sum: { $cond: ["$isNightmare", 1, 0] } },
        averageRating: { $avg: "$rating" },
        firstDream: { $min: "$date" },
        lastDream: { $max: "$date" },
      },
    },
  ]);

  return (
    stats[0] || {
      totalDreams: 0,
      lucidDreams: 0,
      vividDreams: 0,
      recurringDreams: 0,
      nightmares: 0,
      averageRating: 0,
      firstDream: null,
      lastDream: null,
    }
  );
};

// Instance method to calculate lucid percentage
dreamSchema.methods.getLucidPercentage = function () {
  return this.isLucid ? 100 : 0;
};

module.exports = mongoose.model("Dream", dreamSchema);
