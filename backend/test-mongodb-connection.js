const mongoose = require("mongoose");
require("dotenv").config();

async function testConnection() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    console.log("🔗 Testing MongoDB connection...");
    console.log("📍 URI:", mongoURI.replace(/\/\/.*@/, "//***:***@")); // Hide credentials

    // Log current IP address
    const { exec } = require("child_process");
    exec("curl -s ifconfig.me", (error, stdout, stderr) => {
      if (error) {
        console.log("⚠️ Could not determine IP address");
        return;
      }
      console.log("🌐 Your current IP address:", stdout.trim());
      console.log("💡 Make sure this IP is whitelisted in MongoDB Atlas");
    });

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: "majority",
      ssl: true,
      authSource: "admin",
    });

    console.log("✅ MongoDB connection successful!");
    console.log("📊 Database:", mongoose.connection.name);
    console.log("🔌 Host:", mongoose.connection.host);
    console.log("👤 User:", mongoose.connection.user);

    // Test a simple operation
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "📚 Collections:",
      collections.map((c) => c.name),
    );
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName,
    });

    // Additional troubleshooting information
    console.log("\n🔍 Troubleshooting Steps:");
    console.log("1. Verify your IP is whitelisted in MongoDB Atlas");
    console.log("2. Check if your username and password are correct");
    console.log(
      "3. Ensure the database name is included in the connection string",
    );
    console.log("4. Verify network connectivity to MongoDB Atlas");
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
  }
}

testConnection();
