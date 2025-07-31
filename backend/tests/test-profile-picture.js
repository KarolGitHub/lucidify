const mongoose = require("mongoose");
const User = require("./models/User");

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/lucidify",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
);

async function testProfilePicture() {
  try {
    console.log("Testing profilePicture field...\n");

    // Find all users and check their profilePicture field
    const users = await User.find({});
    console.log(`Found ${users.length} users in database\n`);

    for (const user of users) {
      console.log(`User: ${user.email} (${user.firebaseUid})`);
      console.log(`  profilePicture: ${user.profilePicture}`);
      console.log(`  profilePicture type: ${typeof user.profilePicture}`);
      console.log(`  profilePicture === null: ${user.profilePicture === null}`);
      console.log(
        `  profilePicture === undefined: ${user.profilePicture === undefined}`,
      );

      // Test JSON serialization
      const userJson = user.toJSON();
      console.log(`  JSON profilePicture: ${userJson.profilePicture}`);
      console.log(
        `  JSON profilePicture type: ${typeof userJson.profilePicture}`,
      );
      console.log("");
    }

    // Test direct MongoDB query
    console.log("Direct MongoDB query:");
    const db = User.db;
    const collection = db.collection("users");
    const rawDocs = await collection.find({}).toArray();

    for (const doc of rawDocs) {
      console.log(`User: ${doc.email} (${doc.firebaseUid})`);
      console.log(`  Raw profilePicture: ${doc.profilePicture}`);
      console.log(`  Raw profilePicture type: ${typeof doc.profilePicture}`);
      console.log("");
    }
  } catch (error) {
    console.error("Error testing profilePicture:", error);
  } finally {
    await mongoose.disconnect();
  }
}

testProfilePicture();
