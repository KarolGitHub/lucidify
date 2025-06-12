const axios = require("axios");

const BASE_URL = "http://localhost:3001/api";

async function testRealityCheckEndpoints() {
  try {
    console.log("🧪 Testing Reality Check Scheduler endpoints...\n");

    // Test health endpoint first
    console.log("1. Testing health endpoint...");
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health check passed:", healthResponse.data);

    // Test reality check scheduler endpoint (should fail without auth)
    console.log("\n2. Testing reality check scheduler endpoint (no auth)...");
    try {
      const response = await axios.get(
        `${BASE_URL}/users/reality-check-scheduler`,
      );
      console.log("❌ Should have failed without auth:", response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("✅ Correctly rejected without authentication");
      } else {
        console.log("❌ Unexpected error:", error.message);
      }
    }

    console.log("\n🎯 Endpoint test completed!");
    console.log("📝 The reality check scheduler endpoints are available at:");
    console.log("   GET  /api/users/reality-check-scheduler");
    console.log("   PUT  /api/users/reality-check-scheduler");
    console.log("   POST /api/users/fcm-token");
    console.log("   DELETE /api/users/fcm-token");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.log("💡 Make sure your backend server is running on port 3001");
    }
  }
}

testRealityCheckEndpoints();
