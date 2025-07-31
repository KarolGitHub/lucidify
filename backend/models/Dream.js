const mongoose = require("mongoose");
const CryptoJS = require("crypto-js");
const ENCRYPTION_KEY = process.env.DREAMS_ENCRYPTION_KEY;

function encryptField(value) {
  if (!ENCRYPTION_KEY) return value;
  if (!value) return value; // Return null/undefined as-is

  // Handle empty arrays
  if (Array.isArray(value) && value.length === 0) {
    return ""; // Store empty arrays as empty strings
  }

  // Always stringify arrays/objects before encrypting
  const toEncrypt =
    Array.isArray(value) || typeof value === "object"
      ? JSON.stringify(value)
      : value;
  return CryptoJS.AES.encrypt(toEncrypt, ENCRYPTION_KEY).toString();
}

function decryptField(value) {
  if (!value || !ENCRYPTION_KEY) return value;
  if (value === "") return []; // Return empty array for empty strings

  try {
    const bytes = CryptoJS.AES.decrypt(value, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    return value;
  }
}

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
    // New field for forgotten dreams
    isForgotten: {
      type: Boolean,
      default: false,
    },
    // Tags for categorization
    tags: { type: String },
    // Emotions experienced in the dream
    emotions: { type: String },
    // Themes or recurring motifs in the dream
    themes: { type: String },
    // Symbols or specific objects/entities in the dream
    symbols: { type: String },
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
dreamSchema.index({ userId: 1, themes: 1 });
dreamSchema.index({ userId: 1, symbols: 1 });
dreamSchema.index({ title: "text", description: "text" });

// Virtual for dream age (days since dream)
dreamSchema.virtual("ageInDays").get(function () {
  return Math.floor((Date.now() - this.date) / (1000 * 60 * 60 * 24));
});

// Convert arrays to strings before validation
dreamSchema.pre("validate", function (next) {
  // Convert arrays to JSON strings before validation
  if (Array.isArray(this.emotions)) {
    this.emotions =
      this.emotions.length === 0 ? "" : JSON.stringify(this.emotions);
  }
  if (Array.isArray(this.themes)) {
    this.themes = this.themes.length === 0 ? "" : JSON.stringify(this.themes);
  }
  if (Array.isArray(this.symbols)) {
    this.symbols =
      this.symbols.length === 0 ? "" : JSON.stringify(this.symbols);
  }
  if (Array.isArray(this.tags)) {
    this.tags = this.tags.length === 0 ? "" : JSON.stringify(this.tags);
  }
  next();
});

// Encrypt sensitive fields before saving
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

  // Encrypt sensitive fields before saving
  if (this.isModified("title")) {
    this.title = encryptField(this.title);
  }
  if (this.isModified("description")) {
    this.description = encryptField(this.description);
  }
  if (this.isModified("emotions")) {
    this.emotions = encryptField(this.emotions);
  }
  if (this.isModified("themes")) {
    this.themes = encryptField(this.themes);
  }
  if (this.isModified("symbols")) {
    this.symbols = encryptField(this.symbols);
  }
  if (this.isModified("tags")) {
    this.tags = encryptField(this.tags);
  }

  next();
});

// Decrypt after finding
function decryptDream(doc) {
  if (!doc) return;

  if (doc.title) doc.title = decryptField(doc.title);
  if (doc.description) doc.description = decryptField(doc.description);
  if (doc.emotions) doc.emotions = decryptField(doc.emotions);
  if (doc.themes) doc.themes = decryptField(doc.themes);
  if (doc.symbols) doc.symbols = decryptField(doc.symbols);
  if (doc.tags) doc.tags = decryptField(doc.tags);
}

dreamSchema.post("init", function (doc) {
  decryptDream(doc);
});
dreamSchema.post("find", function (docs) {
  docs.forEach(decryptDream);
});
dreamSchema.post("findOne", function (doc) {
  decryptDream(doc);
});
dreamSchema.post("findOneAndUpdate", function (doc) {
  decryptDream(doc);
});
dreamSchema.post("save", function (doc) {
  decryptDream(doc);
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
        forgottenDreams: { $sum: { $cond: ["$isForgotten", 1, 0] } },
        averageRating: { $avg: "$rating" },
        firstDream: { $min: "$date" },
        lastDream: { $max: "$date" },
      },
    },
  ]);

  const s = stats[0] || {
    totalDreams: 0,
    lucidDreams: 0,
    vividDreams: 0,
    recurringDreams: 0,
    nightmares: 0,
    forgottenDreams: 0,
    averageRating: 0,
    firstDream: null,
    lastDream: null,
  };

  // Calculate dreams per day and forget rate
  let dreamsPerDay = 0;
  let forgetRate = 0;
  if (s.firstDream && s.lastDream && s.totalDreams > 0) {
    const days = Math.max(
      1,
      Math.ceil((s.lastDream - s.firstDream) / (1000 * 60 * 60 * 24)) + 1,
    );
    dreamsPerDay = s.totalDreams / days;
    forgetRate =
      s.totalDreams > 0 ? (s.forgottenDreams / s.totalDreams) * 100 : 0;
  }

  return {
    ...s,
    dreamsPerDay,
    forgetRate,
  };
};

// Static method to find dreams with automatic decryption
dreamSchema.statics.findDecrypted = async function (
  query = {},
  projection = null,
  options = {},
) {
  const dreams = await this.find(query, projection, options);
  dreams.forEach(decryptDream);
  return dreams;
};

// Static method to find one dream with automatic decryption
dreamSchema.statics.findOneDecrypted = async function (
  query = {},
  options = {},
) {
  const dream = await this.findOne(query, null, options);
  if (dream) {
    decryptDream(dream);
  }
  return dream;
};

// Instance method to calculate lucid percentage
dreamSchema.methods.getLucidPercentage = function () {
  return this.isLucid ? 100 : 0;
};

// Instance methods for manual decryption (if needed)
dreamSchema.methods.getDecryptedTitle = function () {
  return decryptField(this.title);
};
dreamSchema.methods.getDecryptedDescription = function () {
  return decryptField(this.description);
};
dreamSchema.methods.getDecryptedEmotions = function () {
  return decryptField(this.emotions);
};
dreamSchema.methods.getDecryptedThemes = function () {
  return decryptField(this.themes);
};
dreamSchema.methods.getDecryptedSymbols = function () {
  return decryptField(this.symbols);
};
dreamSchema.methods.getDecryptedTags = function () {
  return decryptField(this.tags);
};

module.exports = mongoose.model("Dream", dreamSchema);
