const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
let firebaseInitialized = false;
if (
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL
) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
    firebaseInitialized = true;
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
  }
}

// In-memory storage (will reset on each function call - use database in production)
let fcmTokens = new Map();

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin":
      process.env.CORS_ORIGIN || "https://your-netlify-app.netlify.app",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
    };
  }

  try {
    const { httpMethod, path } = event;
    const body = event.body ? JSON.parse(event.body) : {};

    // Route handling
    if (httpMethod === "POST" && path.includes("/fcm-tokens")) {
      const { token, userId, userEmail, deviceInfo } = body;

      if (!token) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: "FCM token is required",
          }),
        };
      }

      // Store token with metadata
      const tokenData = {
        token,
        userId: userId || null,
        userEmail: userEmail || null,
        deviceInfo: deviceInfo || {},
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        isActive: true,
      };

      fcmTokens.set(token, tokenData);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          message: "FCM token stored successfully",
          tokenId: token.substring(0, 20) + "...",
          userId: userId || null,
          userEmail: userEmail || null,
        }),
      };
    }

    if (httpMethod === "GET" && path.includes("/fcm-tokens")) {
      const tokens = Array.from(fcmTokens.values()).map((tokenData) => ({
        ...tokenData,
        token: tokenData.token.substring(0, 20) + "...",
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          count: tokens.length,
          tokens,
        }),
      };
    }

    if (httpMethod === "POST" && path.includes("/notifications/send")) {
      if (!firebaseInitialized) {
        return {
          statusCode: 503,
          headers,
          body: JSON.stringify({
            error: "Firebase not configured",
            message: "Firebase Admin SDK is not initialized",
          }),
        };
      }

      const { token, title, body: messageBody, data, imageUrl } = body;

      if (!token || !title || !messageBody) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: "Token, title, and body are required",
          }),
        };
      }

      const message = {
        notification: {
          title,
          body: messageBody,
          ...(imageUrl && { image: imageUrl }),
        },
        ...(data && { data }),
        token,
      };

      const response = await admin.messaging().send(message);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: "Notification sent successfully",
          messageId: response,
        }),
      };
    }

    // Default response
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: "Not found",
        message: `Route ${path} not found`,
      }),
    };
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        message: "Something went wrong",
      }),
    };
  }
};
