const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Initialize Firebase Admin SDK
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK (optional - only if credentials are provided)
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

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    firebaseInitialized = true;
    console.log("✅ Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing Firebase Admin SDK:", error);
    console.log(
      "⚠️ Firebase features will be disabled. Set up your .env file to enable Firebase.",
    );
  }
} else {
  console.log(
    "⚠️ Firebase credentials not found. Firebase features will be disabled.",
  );
  console.log(
    "📝 To enable Firebase, create a .env file with FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL",
  );
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api/", limiter);

// In-memory storage for FCM tokens (replace with database in production)
const fcmTokens = new Map();

// Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Lucidifier Backend API is running",
    timestamp: new Date().toISOString(),
  });
});

// Store FCM token
app.post("/api/fcm-tokens", async (req, res) => {
  try {
    const { token, userId, userEmail, deviceInfo } = req.body;

    if (!token) {
      return res.status(400).json({
        error: "FCM token is required",
      });
    }

    // Validate token format (basic validation)
    if (typeof token !== "string" || token.length < 100) {
      return res.status(400).json({
        error: "Invalid FCM token format",
      });
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

    // Store in memory (replace with database in production)
    fcmTokens.set(token, tokenData);

    console.log(`✅ FCM token stored for user: ${userEmail || "anonymous"}`);

    res.status(201).json({
      message: "FCM token stored successfully",
      tokenId: token.substring(0, 20) + "...",
      userId: userId || null,
      userEmail: userEmail || null,
    });
  } catch (error) {
    console.error("❌ Error storing FCM token:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to store FCM token",
    });
  }
});

// Get all FCM tokens (for admin purposes)
app.get("/api/fcm-tokens", (req, res) => {
  try {
    const tokens = Array.from(fcmTokens.values()).map((tokenData) => ({
      ...tokenData,
      token: tokenData.token.substring(0, 20) + "...", // Don't expose full token
    }));

    res.json({
      count: tokens.length,
      tokens,
    });
  } catch (error) {
    console.error("❌ Error retrieving FCM tokens:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve FCM tokens",
    });
  }
});

// Delete FCM token
app.delete("/api/fcm-tokens/:token", (req, res) => {
  try {
    const { token } = req.params;

    if (fcmTokens.has(token)) {
      fcmTokens.delete(token);
      console.log(`✅ FCM token deleted: ${token.substring(0, 20)}...`);
      res.json({ message: "FCM token deleted successfully" });
    } else {
      res.status(404).json({ error: "FCM token not found" });
    }
  } catch (error) {
    console.error("❌ Error deleting FCM token:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to delete FCM token",
    });
  }
});

// Send notification to specific token
app.post("/api/notifications/send", async (req, res) => {
  try {
    if (!firebaseInitialized) {
      return res.status(503).json({
        error: "Firebase not configured",
        message:
          "Firebase Admin SDK is not initialized. Please set up your .env file with Firebase credentials.",
        setupRequired: true,
      });
    }

    const { token, title, body, data, imageUrl } = req.body;

    if (!token || !title || !body) {
      return res.status(400).json({
        error: "Token, title, and body are required",
      });
    }

    const message = {
      notification: {
        title,
        body,
        ...(imageUrl && { image: imageUrl }),
      },
      ...(data && { data }),
      token,
    };

    const response = await admin.messaging().send(message);

    console.log(`✅ Notification sent successfully: ${response}`);

    res.json({
      message: "Notification sent successfully",
      messageId: response,
    });
  } catch (error) {
    console.error("❌ Error sending notification:", error);

    // Handle specific Firebase errors
    if (error.code === "messaging/registration-token-not-registered") {
      return res.status(400).json({
        error: "Invalid or expired FCM token",
        code: error.code,
      });
    }

    if (error.code === "messaging/invalid-registration-token") {
      return res.status(400).json({
        error: "Invalid FCM token format",
        code: error.code,
      });
    }

    res.status(500).json({
      error: "Internal server error",
      message: "Failed to send notification",
    });
  }
});

// Send notification to all stored tokens
app.post("/api/notifications/broadcast", async (req, res) => {
  try {
    if (!firebaseInitialized) {
      return res.status(503).json({
        error: "Firebase not configured",
        message:
          "Firebase Admin SDK is not initialized. Please set up your .env file with Firebase credentials.",
        setupRequired: true,
      });
    }

    const { title, body, data, imageUrl } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        error: "Title and body are required",
      });
    }

    const tokens = Array.from(fcmTokens.keys());

    if (tokens.length === 0) {
      return res.status(404).json({
        error: "No FCM tokens found",
      });
    }

    const message = {
      notification: {
        title,
        body,
        ...(imageUrl && { image: imageUrl }),
      },
      ...(data && { data }),
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);

    console.log(
      `✅ Broadcast sent successfully: ${response.successCount}/${response.responses.length} successful`,
    );

    res.json({
      message: "Broadcast notification sent",
      successCount: response.successCount,
      failureCount: response.failureCount,
      totalCount: response.responses.length,
    });
  } catch (error) {
    console.error("❌ Error sending broadcast notification:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to send broadcast notification",
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: "Something went wrong",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Lucidifier Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(
    `🔔 FCM tokens endpoint: http://localhost:${PORT}/api/fcm-tokens`,
  );
  console.log(
    `📱 Notifications endpoint: http://localhost:${PORT}/api/notifications/send`,
  );
});

module.exports = app;
