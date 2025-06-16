const axios = require("axios");
const jwt = require("jsonwebtoken");

const BASE_URL = "http://localhost:3001/api";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Test user data (replace with actual user data from your database)
const TEST_USER = {
  firebaseUid: "test-user-123",
  email: "test@example.com",
};

// Create a test JWT token
function createTestToken(user) {
  return jwt.sign(
    {
      firebaseUid: user.firebaseUid,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    },
    JWT_SECRET,
  );
}

async function testRealityCheckScheduler() {
  try {
    console.log("🧪 Testing Reality Check Scheduler...\n");

    const token = createTestToken(TEST_USER);
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // 1. Test getting current settings
    console.log("1. Getting current reality check settings...");
    try {
      const getResponse = await axios.get(
        `${BASE_URL}/users/reality-check-scheduler`,
        { headers },
      );
      console.log(
        "✅ Current settings:",
        getResponse.data.realityCheckScheduler,
      );
    } catch (error) {
      console.log(
        "❌ Error getting settings:",
        error.response?.data?.message || error.message,
      );
    }

    // 2. Test updating settings to enable scheduler
    console.log("\n2. Enabling reality check scheduler...");
    const testSettings = {
      enabled: true,
      frequency: "every_2_hours",
      customInterval: 120,
      startTime: "09:00",
      endTime: "22:00",
      message: "🧠 Are you dreaming? Perform a reality check!",
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
    };

    try {
      const updateResponse = await axios.put(
        `${BASE_URL}/users/reality-check-scheduler`,
        testSettings,
        { headers },
      );
      console.log("✅ Settings updated:", updateResponse.data.message);
      console.log(
        "📋 New settings:",
        updateResponse.data.realityCheckScheduler,
      );
    } catch (error) {
      console.log(
        "❌ Error updating settings:",
        error.response?.data?.message || error.message,
      );
    }

    // 3. Test FCM token storage
    console.log("\n3. Testing FCM token storage...");
    const testFCMToken = "test-fcm-token-" + Date.now();

    try {
      const tokenResponse = await axios.post(
        `${BASE_URL}/users/fcm-token`,
        { token: testFCMToken },
        { headers },
      );
      console.log("✅ FCM token stored:", tokenResponse.data.message);
    } catch (error) {
      console.log(
        "❌ Error storing FCM token:",
        error.response?.data?.message || error.message,
      );
    }

    // 4. Test sending a test notification
    console.log("\n4. Testing notification sending...");
    try {
      const notificationResponse = await axios.post(
        `${BASE_URL}/notifications/send`,
        {
          token: testFCMToken,
          title: "🧪 Test Reality Check",
          body: "This is a test notification from the reality check scheduler",
          data: {
            type: "test-reality-check",
            timestamp: new Date().toISOString(),
          },
        },
        { headers },
      );
      console.log(
        "✅ Test notification sent:",
        notificationResponse.data.message,
      );
    } catch (error) {
      console.log(
        "❌ Error sending test notification:",
        error.response?.data?.message || error.message,
      );
    }

    // 5. Test disabling the scheduler
    console.log("\n5. Disabling reality check scheduler...");
    try {
      const disableResponse = await axios.put(
        `${BASE_URL}/users/reality-check-scheduler`,
        { enabled: false },
        { headers },
      );
      console.log("✅ Scheduler disabled:", disableResponse.data.message);
    } catch (error) {
      console.log(
        "❌ Error disabling scheduler:",
        error.response?.data?.message || error.message,
      );
    }

    console.log("\n🎯 Reality Check Scheduler test completed!");
    console.log("\n📝 To test with real notifications:");
    console.log("1. Enable the scheduler in the app");
    console.log("2. Set frequency to 'hourly' for quick testing");
    console.log("3. Wait for the scheduled notification");
    console.log("4. Check the browser console for notification events");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.log("💡 Make sure your backend server is running on port 3001");
    }
  }
}

// Run the test
testRealityCheckScheduler();
