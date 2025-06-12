/**
 * JWT Utilities
 *
 * NOTE: These JWT utilities are currently kept for future use.
 * The application is currently using Firebase Authentication.
 *
 * To switch to JWT authentication:
 * 1. Ensure JWT_SECRET is set in environment variables
 * 2. Update routes to use JWT middleware
 * 3. Update frontend to use JWT endpoints
 */

const jwt = require("jsonwebtoken");

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

// JWT Token Options
const JWT_OPTIONS = {
  expiresIn: "24h", // Token expires in 24 hours
  issuer: "lucidify-backend",
  audience: "lucidify-frontend",
};

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id, email, etc.
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  const payload = {
    userId: user._id || user.id,
    email: user.email,
    displayName: user.displayName,
    firebaseUid: user.firebaseUid,
    isAdmin: user.isAdmin || false,
  };

  return jwt.sign(payload, JWT_SECRET, JWT_OPTIONS);
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, JWT_OPTIONS);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Decode a JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Check if a JWT token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true; // Assume expired if we can't decode
  }
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  JWT_SECRET,
};
