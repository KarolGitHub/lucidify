const fetch = require("node-fetch");

const BASE_URL = "http://localhost:3001";

async function testNotification() {
  console.log("🧪 Testing Notification System...\n");

  try {
    // Step 1: Get stored FCM tokens
    console.log("1️⃣ Getting stored FCM tokens...");
    const tokensResponse = await fetch(`${BASE_URL}/api/fcm-tokens`);
    const tokensData = await tokensResponse.json();

    if (tokensData.count === 0) {
      console.log(
        "❌ No FCM tokens found. Please generate a token from your frontend first.",
      );
      return;
    }

    console.log(`✅ Found ${tokensData.count} stored tokens`);

    // Step 2: Send test notification to the first token
    console.log("2️⃣ Sending test notification...");
    const firstToken = tokensData.tokens[0];
    const tokenId = firstToken.tokenId;

    // We need the full token to send the notification
    // For this test, we'll use a placeholder - you'll need to get the actual token from your frontend console
    console.log("📝 To test with a real token:");
    console.log("   1. Open your frontend in browser");
    console.log("   2. Open browser console");
    console.log('   3. Look for "FCM Token:" in the logs');
    console.log("   4. Copy that token and replace it in this script");

    // Example of how to send a notification (uncomment and replace with real token)
    /*
    const notificationResponse = await fetch(`${BASE_URL}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'YOUR_ACTUAL_FCM_TOKEN_HERE', // Replace with real token
        title: 'Test Notification from Backend',
        body: 'This is a test notification sent from your Node.js backend!',
        data: {
          customKey: 'customValue',
          timestamp: new Date().toISOString()
        }
      })
    });

    const notificationData = await notificationResponse.json();
    console.log('✅ Notification sent:', notificationData);
    */

    // Step 3: Test broadcast (send to all stored tokens)
    console.log("3️⃣ Testing broadcast notification...");
    const broadcastResponse = await fetch(
      `${BASE_URL}/api/notifications/broadcast`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Broadcast Test",
          body: "This is a broadcast notification to all devices!",
          data: {
            type: "broadcast",
            timestamp: new Date().toISOString(),
          },
        }),
      },
    );

    const broadcastData = await broadcastResponse.json();
    console.log("✅ Broadcast result:", broadcastData);

    console.log("\n🎉 Notification system test completed!");
    console.log("\n📝 Next steps:");
    console.log("   1. Get your FCM token from browser console");
    console.log("   2. Update this script with the real token");
    console.log("   3. Run this script again to test individual notifications");
    console.log("   4. Deploy to Railway when ready for production");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testNotification();
