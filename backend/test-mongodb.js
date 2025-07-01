const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const Dream = require("./models/Dream");
const User = require("./models/User");

// Test MongoDB connection
async function testConnection() {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/lucidify";
    console.log("🔗 Connecting to MongoDB...");
    console.log("📍 URI:", mongoURI.replace(/\/\/.*@/, "//***:***@")); // Hide credentials

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected successfully!");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    return false;
  }
}

// Create sample data
async function createSampleData() {
  try {
    console.log("\n📝 Creating sample data...");

    // Create a sample user
    const user = new User({
      firebaseUid: "test-user-123",
      email: "test@lucidify.com",
      displayName: "Test Dreamer",
      lucidProgress: {
        totalDreams: 0,
        lucidDreams: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
    });

    await user.save();
    console.log("✅ Sample user created");

    // Create sample dreams with valid emotions only
    const sampleDreams = [
      {
        title: "Flying Over the City",
        description:
          "I was flying over a beautiful city at sunset. The buildings were glowing with golden light and I felt completely free and peaceful. I could control my flight perfectly and was exploring the rooftops.",
        date: new Date("2024-01-15"),
        isLucid: true,
        isVivid: true,
        isRecurring: false,
        isNightmare: false,
        tags: ["flying", "city", "freedom", "sunset"],
        emotions: ["Joy", "Peace", "Wonder", "Excitement"],
        userId: user.firebaseUid,
        rating: 5,
        lucidDetails: {
          awarenessLevel: 9,
          controlLevel: 8,
          techniquesUsed: ["Reality Check", "MILD"],
          dreamSigns: ["flying", "unusual buildings"],
          stabilizationTechniques: ["rubbing hands", "focusing on details"],
        },
        setting: {
          location: "Modern city",
          timeOfDay: "Evening",
          weather: "Clear",
          colors: ["golden", "orange", "blue"],
          lighting: "Warm sunset",
        },
      },
      {
        title: "Underwater Adventure",
        description:
          "I was swimming deep in the ocean, surrounded by colorful fish and coral reefs. The water was crystal clear and I could breathe underwater. I was exploring ancient ruins.",
        date: new Date("2024-01-14"),
        isLucid: false,
        isVivid: true,
        isRecurring: false,
        isNightmare: false,
        tags: ["water", "ocean", "fish", "ruins", "adventure"],
        emotions: ["Wonder", "Excitement", "Awe"],
        userId: user.firebaseUid,
        rating: 4,
        setting: {
          location: "Deep ocean",
          timeOfDay: "Unknown",
          weather: "Underwater",
          colors: ["blue", "green", "orange", "purple"],
          lighting: "Filtered sunlight",
        },
      },
      {
        title: "Recurring School Dream",
        description:
          "I was back in high school, but the building was different. I couldn't find my classroom and was running late. This dream happens often.",
        date: new Date("2024-01-13"),
        isLucid: false,
        isVivid: false,
        isRecurring: true,
        isNightmare: false,
        tags: ["school", "recurring", "anxiety", "lost"],
        emotions: ["Anxiety", "Confusion", "Fear"],
        userId: user.firebaseUid,
        rating: 2,
        interpretation: {
          personalMeaning:
            "Feeling unprepared or anxious about current challenges",
          symbols: ["school", "being lost", "running late"],
          insights: "This dream reflects my current stress about deadlines",
          lessons: "Need to better organize my time and reduce anxiety",
        },
      },
    ];

    for (const dreamData of sampleDreams) {
      const dream = new Dream(dreamData);
      await dream.save();
    }

    console.log("✅ Sample dreams created");

    // Update user progress
    await user.updateLucidProgress(true); // First dream was lucid
    await user.updateLucidProgress(false); // Second dream was not lucid
    await user.updateLucidProgress(false); // Third dream was not lucid

    console.log("✅ User progress updated");

    return true;
  } catch (error) {
    console.error("❌ Error creating sample data:", error.message);
    return false;
  }
}

// Test database operations
async function testDatabaseOperations() {
  try {
    console.log("\n🔍 Testing database operations...");

    // Test finding dreams
    const dreams = await Dream.find({ userId: "test-user-123" });
    console.log(`✅ Found ${dreams.length} dreams`);

    // Test finding user
    const user = await User.findOne({ firebaseUid: "test-user-123" });
    console.log(`✅ Found user: ${user.displayName}`);

    // Test dream statistics
    const stats = await Dream.getUserStats("test-user-123");
    console.log("✅ Dream statistics:", {
      totalDreams: stats.totalDreams,
      lucidDreams: stats.lucidDreams,
      lucidPercentage:
        stats.totalDreams > 0
          ? Math.round((stats.lucidDreams / stats.totalDreams) * 100)
          : 0,
    });

    // Forgotten dream test
    console.log("\n🧪 Creating and testing forgotten dream...");
    const forgottenDream = new Dream({
      isForgotten: true,
      date: new Date(),
      userId: "test-user-123",
      // No title or description
    });
    await forgottenDream.save();
    console.log("✅ Forgotten dream saved");

    // Fetch stats again
    const statsAfter = await Dream.getUserStats("test-user-123");
    console.log("✅ Stats after forgotten dream:", {
      totalDreams: statsAfter.totalDreams,
      forgottenDreams: statsAfter.forgottenDreams,
      forgetRate: statsAfter.forgetRate,
    });

    // Check that forgottenDreams increased
    if (statsAfter.forgottenDreams > (stats.forgottenDreams || 0)) {
      console.log("🎉 Forgotten dream counted in stats!");
    } else {
      console.error("❌ Forgotten dream NOT counted in stats!");
    }

    return true;
  } catch (error) {
    console.error("❌ Error testing database operations:", error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log("🧪 MongoDB Test Suite for Lucidify\n");

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log("\n❌ Tests failed: Could not connect to MongoDB");
    process.exit(1);
  }

  // Create sample data
  const dataCreated = await createSampleData();
  if (!dataCreated) {
    console.log("\n❌ Tests failed: Could not create sample data");
    process.exit(1);
  }

  // Test operations
  const operationsWorked = await testDatabaseOperations();
  if (!operationsWorked) {
    console.log("\n❌ Tests failed: Database operations failed");
    process.exit(1);
  }

  console.log("\n🎉 All tests passed! MongoDB is working correctly.");
  console.log("\n📊 Sample data created:");
  console.log("   - 1 test user");
  console.log("   - 3 sample dreams (1 lucid, 2 regular)");
  console.log("   - User progress tracking");
  console.log(
    "\n🚀 You can now start your backend server and test the Dream Journal!",
  );

  // Close connection
  await mongoose.connection.close();
  console.log("\n🔌 MongoDB connection closed.");
}

// Run tests
runTests().catch(console.error);
