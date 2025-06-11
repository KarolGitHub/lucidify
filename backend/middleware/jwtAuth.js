const { verifyToken, isTokenExpired } = require("../utils/jwt");
const User = require("../models/User");

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and attaches user to request object
 */
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No token provided",
        message: "Authorization header with Bearer token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    // Check if token is expired
    if (isTokenExpired(token)) {
      return res.status(401).json({
        error: "Token expired",
        message: "Your authentication token has expired. Please log in again.",
      });
    }

    // Verify the token
    const decoded = verifyToken(token);

    // Find user in database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: "User not found",
        message: "User associated with this token no longer exists",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: "Account deactivated",
        message: "Your account has been deactivated",
      });
    }

    // Attach user to request object
    req.user = user;
    req.jwtPayload = decoded;

    next();
  } catch (error) {
    console.error("JWT Authentication error:", error);

    if (error.message.includes("Token verification failed")) {
      return res.status(401).json({
        error: "Invalid token",
        message: "The provided authentication token is invalid",
      });
    }

    res.status(500).json({
      error: "Authentication failed",
      message: "An error occurred during authentication",
    });
  }
};

/**
 * Optional JWT Authentication Middleware
 * Similar to authenticateJWT but doesn't fail if no token is provided
 */
const optionalJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token provided, continue without authentication
      req.user = null;
      req.jwtPayload = null;
      return next();
    }

    const token = authHeader.split(" ")[1];

    // Check if token is expired
    if (isTokenExpired(token)) {
      req.user = null;
      req.jwtPayload = null;
      return next();
    }

    // Verify the token
    const decoded = verifyToken(token);

    // Find user in database
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      req.user = null;
      req.jwtPayload = null;
      return next();
    }

    // Attach user to request object
    req.user = user;
    req.jwtPayload = decoded;

    next();
  } catch (error) {
    // If authentication fails, continue without it
    req.user = null;
    req.jwtPayload = null;
    next();
  }
};

/**
 * Admin-only JWT Authentication Middleware
 * Requires both JWT authentication and admin privileges
 */
const requireAdminJWT = async (req, res, next) => {
  try {
    // First authenticate the user
    await authenticateJWT(req, res, (err) => {
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
  authenticateJWT,
  optionalJWT,
  requireAdminJWT,
};
