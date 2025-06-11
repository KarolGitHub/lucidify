const express = require("express");
const bcrypt = require("bcryptjs");
const { generateToken, verifyToken } = require("../utils/jwt");
const User = require("../models/User");
const { authenticateJWT } = require("../middleware/jwtAuth");

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Validate input
    if (!email || !password || !displayName) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Email, password, and display name are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
        message: "A user with this email already exists",
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      email,
      displayName,
      password: hashedPassword,
      emailVerified: false,
      isActive: true,
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Return user data (without password) and token
    const userResponse = {
      _id: user._id,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Registration failed",
      message: "An error occurred during registration",
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: "Missing credentials",
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: "Account deactivated",
        message: "Your account has been deactivated",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Return user data (without password) and token
    const userResponse = {
      _id: user._id,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      isAdmin: user.isAdmin,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };

    res.json({
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
      message: "An error occurred during login",
    });
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post("/refresh", authenticateJWT, async (req, res) => {
  try {
    // User is already authenticated and attached to req.user
    const user = req.user;

    // Generate new token
    const newToken = generateToken(user);

    res.json({
      message: "Token refreshed successfully",
      token: newToken,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      error: "Token refresh failed",
      message: "An error occurred while refreshing the token",
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", authenticateJWT, async (req, res) => {
  try {
    // User is already authenticated and attached to req.user
    const user = req.user;

    // Return user data (without password)
    const userResponse = {
      _id: user._id,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      isAdmin: user.isAdmin,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({
      user: userResponse,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      error: "Failed to get profile",
      message: "An error occurred while fetching your profile",
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post("/logout", authenticateJWT, async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // by removing the token from storage
    // You could implement a blacklist here if needed

    res.json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: "Logout failed",
      message: "An error occurred during logout",
    });
  }
});

module.exports = router;
