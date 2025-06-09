const fetch = require("node-fetch");

const BASE_URL = "http://localhost:3001";

async function testAPI() {
  console.log("🧪 Testing Lucidifier Backend API...\n");

  try {
    // Test 1: Health Check
    console.log("1️⃣ Testing Health Check...");
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health Check:", healthData);
    console.log("");

    // Test 2: Store FCM Token
    console.log("2️⃣ Testing FCM Token Storage...");
    const testToken = "test-fcm-token-" + Date.now();
    const tokenResponse = await fetch(`${BASE_URL}/api/fcm-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: testToken,
        userEmail: "test@example.com",
        deviceInfo: {
          userAgent: "Test Script",
          platform: "Node.js",
        },
      }),
    });
    const tokenData = await tokenResponse.json();
    console.log("✅ Token Storage:", tokenData);
    console.log("");

    // Test 3: Get All Tokens
    console.log("3️⃣ Testing Get All Tokens...");
    const getTokensResponse = await fetch(`${BASE_URL}/api/fcm-tokens`);
    const getTokensData = await getTokensResponse.json();
    console.log("✅ Get Tokens:", getTokensData);
    console.log("");

    // Test 4: Send Test Notification (will fail without Firebase setup, but tests endpoint)
    console.log(
      "4️⃣ Testing Send Notification (will fail without Firebase setup)...",
    );
    try {
      const notificationResponse = await fetch(
        `${BASE_URL}/api/notifications/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: testToken,
            title: "Test Notification",
            body: "This is a test from the API",
          }),
        },
      );
      const notificationData = await notificationResponse.json();
      console.log("✅ Send Notification:", notificationData);
    } catch (error) {
      console.log(
        "⚠️ Send Notification (expected to fail without Firebase):",
        error.message,
      );
    }
    console.log("");

    console.log("🎉 API Tests Completed!");
    console.log("📝 Next Steps:");
    console.log("   1. Set up Firebase Service Account");
    console.log("   2. Create .env file with Firebase credentials");
    console.log("   3. Restart the server");
    console.log("   4. Test with real FCM tokens");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testAPI();
