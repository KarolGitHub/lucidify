const admin = require("firebase-admin");
const User = require("../models/User");

// Check if Firebase Admin SDK is initialized
const isFirebaseInitialized = () => {
  return admin.apps.length > 0;
};

// Verify Firebase ID token and get user info
const verifyFirebaseToken = async (idToken) => {
  try {
    if (!isFirebaseInitialized()) {
      throw new Error("Firebase Admin SDK not initialized");
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name || decodedToken.display_name,
      emailVerified: decodedToken.email_verified,
      picture: decodedToken.picture,
    };
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    throw error;
  }
};

// Main authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No token provided",
        message: "Authorization header with Bearer token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    // If Firebase is not configured, fall back to simple user ID (for development)
    if (!isFirebaseInitialized()) {
      console.warn("⚠️ Firebase not configured, using fallback authentication");
      const userId = req.body.userId || req.query.userId;

      if (!userId) {
        return res.status(401).json({
          error: "User ID required",
          message: "Firebase not configured, please provide userId in request",
        });
      }

      // Find or create user with fallback ID
      let user = await User.findOne({ firebaseUid: userId });
      if (!user) {
        user = new User({
          firebaseUid: userId,
          email: req.body.userEmail || "unknown@example.com",
          displayName: req.body.userDisplayName || "Unknown User",
        });
        await user.save();
      }

      req.user = user;
      req.firebaseUser = { uid: userId };
      return next();
    }

    // Verify Firebase token
    const firebaseUser = await verifyFirebaseToken(token);

    // Find or create user in MongoDB
    let user = await User.findOne({ firebaseUid: firebaseUser.uid });

    if (!user) {
      // Create new user from Firebase data
      user = new User({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        emailVerified: firebaseUser.emailVerified,
        profilePicture: firebaseUser.picture,
        lastLogin: new Date(),
      });
      await user.save();
      console.log(
        `✅ New user created: ${firebaseUser.email} (${firebaseUser.uid})`,
      );
    } else {
      // Update existing user's info
      user.email = firebaseUser.email;
      user.displayName = firebaseUser.displayName;
      user.emailVerified = firebaseUser.emailVerified;
      user.profilePicture = firebaseUser.picture;
      user.lastLogin = new Date();
      await user.save();
    }

    req.user = user;
    req.firebaseUser = firebaseUser;
    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        error: "Token expired",
        message: "Your authentication token has expired. Please log in again.",
      });
    }

    if (error.code === "auth/id-token-revoked") {
      return res.status(401).json({
        error: "Token revoked",
        message:
          "Your authentication token has been revoked. Please log in again.",
      });
    }

    if (error.code === "auth/invalid-id-token") {
      return res.status(401).json({
        error: "Invalid token",
        message: "The provided authentication token is invalid.",
      });
    }

    res.status(500).json({
      error: "Authentication failed",
      message: "An error occurred during authentication",
    });
  }
};

// Optional authentication middleware (for endpoints that work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token provided, continue without authentication
      req.user = null;
      req.firebaseUser = null;
      return next();
    }

    // Try to authenticate, but don't fail if it doesn't work
    await authenticateUser(req, res, next);
  } catch (error) {
    // If authentication fails, continue without it
    req.user = null;
    req.firebaseUser = null;
    next();
  }
};

// Admin-only middleware
const requireAdmin = async (req, res, next) => {
  try {
    // First authenticate the user
    await authenticateUser(req, res, (err) => {
      if (err) return next(err);

      // Check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({
          error: "Admin access required",
          message: "This endpoint requires administrator privileges",
        });
      }

      next();
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticateUser,
  optionalAuth,
  requireAdmin,
  verifyFirebaseToken,
  isFirebaseInitialized,
};
