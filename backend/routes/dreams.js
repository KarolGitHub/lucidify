const express = require("express");
const { body, validationResult, query } = require("express-validator");
const Dream = require("../models/Dream");
const User = require("../models/User");
const { authenticateUser } = require("../middleware/auth");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dreams
 *   description: Dream journal management
 */

/**
 * @swagger
 * /dreams:
 *   get:
 *     summary: Get all dreams for the authenticated user
 *     tags: [Dreams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of dreams per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort order (e.g., -date)
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: Filter by lucid, vivid, recurring, nightmare
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Text search
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: List of dreams with pagination
 *       401:
 *         description: Unauthorized
 */

// Helper function to parse dd.mm.rrrr format
const parseDate = (dateString) => {
  if (!dateString) return null;

  // If it's already a Date object, return it
  if (dateString instanceof Date) return dateString;

  // If it's already a valid ISO string, convert it
  if (typeof dateString === "string" && dateString.includes("-")) {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;
  }

  // Parse dd.mm.rrrr format
  if (typeof dateString === "string" && dateString.includes(".")) {
    const parts = dateString.split(".");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      // Note: month is 0-indexed in JavaScript Date constructor
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) return date;
    }
  }

  // Try standard Date constructor as fallback
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) return date;

  return null; // Invalid date
};

// Validation rules
const dreamValidation = [
  body("isForgotten").isBoolean().optional(),
  body(["title", "description"]).custom((value, { req, path }) => {
    if (req.body.isForgotten) {
      // Allow empty title/description if isForgotten is true
      return true;
    }
    if (!value || value.trim().length < 1) {
      throw new Error(
        `${path.charAt(0).toUpperCase() + path.slice(1)} is required unless this is a forgotten dream`,
      );
    }
    if (path === "title" && value.length > 200) {
      throw new Error("Dream title cannot exceed 200 characters");
    }
    if (path === "description" && value.length > 10000) {
      throw new Error("Dream description cannot exceed 10,000 characters");
    }
    return true;
  }),
  body("date").isISO8601().withMessage("Invalid date format"),
  body("isLucid").isBoolean().optional(),
  body("isVivid").isBoolean().optional(),
  body("isRecurring").isBoolean().optional(),
  body("isNightmare").isBoolean().optional(),
  body("tags").isArray().optional(),
  body("emotions").isArray().optional(),
  body("themes").isArray().optional(),
  body("symbols").isArray().optional(),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .optional()
    .withMessage("Rating must be between 1 and 5"),
];

// GET /api/dreams - Get all dreams for a user
router.get("/", authenticateUser, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "-date",
      filter,
      search,
      isLucid,
      isVivid,
      isRecurring,
      isNightmare,
      startDate,
      endDate,
      tags,
      emotions,
      themes,
      symbols,
    } = req.query;

    const query = { userId: req.user.firebaseUid };

    // Apply filters
    if (filter === "lucid") query.isLucid = true;
    if (filter === "vivid") query.isVivid = true;
    if (filter === "recurring") query.isRecurring = true;
    if (filter === "nightmare") query.isNightmare = true;

    // Boolean filters
    if (isLucid !== undefined) query.isLucid = isLucid === "true";
    if (isVivid !== undefined) query.isVivid = isVivid === "true";
    if (isRecurring !== undefined) query.isRecurring = isRecurring === "true";
    if (isNightmare !== undefined) query.isNightmare = isNightmare === "true";

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Note: Filtering by tags, emotions, themes, symbols and text search are temporarily disabled
    // due to encryption. These fields are now stored as encrypted strings, not searchable text.
    // TODO: Implement filtering and search functionality that works with encrypted data if needed.

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const totalDocs = await Dream.countDocuments(query);

    // Get dreams with pagination
    const dreams = await Dream.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate("userId", "displayName email");

    // Ensure decryption is applied
    const decryptedDreams = dreams.map((dream) => {
      const decryptedDream = dream.toObject();

      // Always decrypt these fields since they're stored as encrypted strings
      decryptedDream.title = dream.getDecryptedTitle();
      decryptedDream.description = dream.getDecryptedDescription();
      decryptedDream.emotions = dream.getDecryptedEmotions();
      decryptedDream.themes = dream.getDecryptedThemes();
      decryptedDream.symbols = dream.getDecryptedSymbols();
      decryptedDream.tags = dream.getDecryptedTags();

      return decryptedDream;
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalDocs / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: decryptedDreams,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalDocs,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching dreams:", error);
    res.status(500).json({ error: "Failed to fetch dreams" });
  }
});

/**
 * @swagger
 * /dreams/{id}:
 *   get:
 *     summary: Get a specific dream by ID
 *     tags: [Dreams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Dream ID
 *     responses:
 *       200:
 *         description: Dream found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Dream not found
 */
// GET /api/dreams/:id - Get a specific dream
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const dream = await Dream.findOne({
      _id: req.params.id,
      userId: req.user.firebaseUid,
    });

    if (!dream) {
      return res.status(404).json({ error: "Dream not found" });
    }

    // Ensure decryption is applied
    const decryptedDream = dream.toObject();

    // Always decrypt these fields since they're stored as encrypted strings
    decryptedDream.title = dream.getDecryptedTitle();
    decryptedDream.description = dream.getDecryptedDescription();
    decryptedDream.emotions = dream.getDecryptedEmotions();
    decryptedDream.themes = dream.getDecryptedThemes();
    decryptedDream.symbols = dream.getDecryptedSymbols();
    decryptedDream.tags = dream.getDecryptedTags();

    res.json({ success: true, data: decryptedDream });
  } catch (error) {
    console.error("Error fetching dream:", error);
    res.status(500).json({ error: "Failed to fetch dream" });
  }
});

/**
 * @swagger
 * /dreams:
 *   post:
 *     summary: Create a new dream
 *     tags: [Dreams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Dream created
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
// POST /api/dreams - Create a new dream
router.post("/", authenticateUser, dreamValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Prepare dream data with proper date handling
    const dreamData = {
      ...req.body,
      userId: req.user.firebaseUid,
    };

    // Convert arrays to strings for encrypted fields
    if (Array.isArray(dreamData.emotions)) {
      dreamData.emotions =
        dreamData.emotions.length === 0
          ? ""
          : JSON.stringify(dreamData.emotions);
    }
    if (Array.isArray(dreamData.themes)) {
      dreamData.themes =
        dreamData.themes.length === 0 ? "" : JSON.stringify(dreamData.themes);
    }
    if (Array.isArray(dreamData.symbols)) {
      dreamData.symbols =
        dreamData.symbols.length === 0 ? "" : JSON.stringify(dreamData.symbols);
    }
    if (Array.isArray(dreamData.tags)) {
      dreamData.tags =
        dreamData.tags.length === 0 ? "" : JSON.stringify(dreamData.tags);
    }

    // Convert date string to Date object if provided
    if (dreamData.date) {
      dreamData.date = parseDate(dreamData.date);

      // Validate the date
      if (!dreamData.date) {
        return res.status(400).json({
          error: "Invalid date format",
          message:
            "Please provide a valid date in dd.mm.rrrr format (e.g., 15.01.2024)",
        });
      }
    }

    const dream = new Dream(dreamData);
    await dream.save();

    // Update user's lucid progress
    await req.user.updateLucidProgress(dream.isLucid);

    res.status(201).json({
      success: true,
      message: "Dream saved successfully",
      data: dream,
    });
  } catch (error) {
    console.error("Error creating dream:", error);
    res.status(500).json({ error: "Failed to create dream" });
  }
});

/**
 * @swagger
 * /dreams/{id}:
 *   put:
 *     summary: Update a dream by ID
 *     tags: [Dreams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Dream ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Dream updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Dream not found
 */
// PUT /api/dreams/:id - Update a dream
router.put("/:id", authenticateUser, dreamValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const dream = await Dream.findOne({
      _id: req.params.id,
      userId: req.user.firebaseUid,
    });

    if (!dream) {
      return res.status(404).json({ error: "Dream not found" });
    }

    // Check if lucid status changed
    const wasLucid = dream.isLucid;
    const isNowLucid = req.body.isLucid;

    // Prepare update data with proper date handling
    const updateData = { ...req.body };

    // Convert arrays to strings for encrypted fields
    if (Array.isArray(updateData.emotions)) {
      updateData.emotions =
        updateData.emotions.length === 0
          ? ""
          : JSON.stringify(updateData.emotions);
    }
    if (Array.isArray(updateData.themes)) {
      updateData.themes =
        updateData.themes.length === 0 ? "" : JSON.stringify(updateData.themes);
    }
    if (Array.isArray(updateData.symbols)) {
      updateData.symbols =
        updateData.symbols.length === 0
          ? ""
          : JSON.stringify(updateData.symbols);
    }
    if (Array.isArray(updateData.tags)) {
      updateData.tags =
        updateData.tags.length === 0 ? "" : JSON.stringify(updateData.tags);
    }

    // Convert date string to Date object if provided
    if (updateData.date) {
      updateData.date = parseDate(updateData.date);

      // Validate the date
      if (!updateData.date) {
        return res.status(400).json({
          error: "Invalid date format",
          message:
            "Please provide a valid date in dd.mm.rrrr format (e.g., 15.01.2024)",
        });
      }
    }

    Object.assign(dream, updateData);
    await dream.save();

    // Update user progress if lucid status changed
    if (wasLucid !== isNowLucid) {
      await req.user.updateLucidProgress(isNowLucid);
    }

    res.json({
      success: true,
      message: "Dream updated successfully",
      data: dream,
    });
  } catch (error) {
    console.error("Error updating dream:", error);
    res.status(500).json({ error: "Failed to update dream" });
  }
});

/**
 * @swagger
 * /dreams/{id}:
 *   delete:
 *     summary: Delete a dream by ID
 *     tags: [Dreams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Dream ID
 *     responses:
 *       200:
 *         description: Dream deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Dream not found
 */
// DELETE /api/dreams/:id - Delete a dream
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const dream = await Dream.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.firebaseUid,
    });

    if (!dream) {
      return res.status(404).json({ error: "Dream not found" });
    }

    // Update user progress if it was a lucid dream
    if (dream.isLucid) {
      req.user.lucidProgress.lucidDreams = Math.max(
        0,
        req.user.lucidProgress.lucidDreams - 1,
      );
      await req.user.save();
    }

    res.json({
      success: true,
      message: "Dream deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting dream:", error);
    res.status(500).json({ error: "Failed to delete dream" });
  }
});

/**
 * @swagger
 * /dreams/stats/user:
 *   get:
 *     summary: Get dream statistics for the authenticated user
 *     tags: [Dreams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dream statistics
 *       401:
 *         description: Unauthorized
 */
// GET /api/dreams/stats/user - Get user's dream statistics
router.get("/stats/user", authenticateUser, async (req, res) => {
  try {
    const stats = await Dream.getUserStats(req.user.firebaseUid);

    // Get recent activity
    const recentDreams = await Dream.find({
      userId: req.user.firebaseUid,
    })
      .sort({ date: -1 })
      .limit(5)
      .select("title date isLucid");

    // Ensure decryption is applied
    const decryptedRecentDreams = recentDreams.map((dream) => {
      const decryptedDream = dream.toObject();

      decryptedDream.title = dream.getDecryptedTitle();

      return decryptedDream;
    });

    // Note: Aggregation stats for tags, emotions, themes, symbols are temporarily disabled
    // due to encryption. These fields are now stored as encrypted strings, not arrays.
    // TODO: Implement stats calculation from decrypted data if needed.
    const tagStats = [];
    const emotionStats = [];
    const themeStats = [];
    const symbolStats = [];

    res.json({
      success: true,
      data: {
        ...stats,
        recentDreams: decryptedRecentDreams,
        tagStats,
        emotionStats,
        themeStats,
        symbolStats,
        lucidPercentage:
          stats.totalDreams > 0
            ? Math.round((stats.lucidDreams / stats.totalDreams) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching dream stats:", error);
    res.status(500).json({ error: "Failed to fetch dream statistics" });
  }
});

/**
 * @swagger
 * /dreams/search/advanced:
 *   get:
 *     summary: Advanced dream search
 *     tags: [Dreams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *       401:
 *         description: Unauthorized
 */
// GET /api/dreams/search - Advanced search
router.get("/search/advanced", authenticateUser, async (req, res) => {
  try {
    const {
      q,
      tags,
      emotions,
      themes,
      symbols,
      dateRange,
      lucidOnly,
      vividOnly,
      recurringOnly,
      nightmareOnly,
    } = req.query;

    const query = { userId: req.user.firebaseUid };

    // Note: Text search and filtering by tags, emotions, themes, symbols are temporarily disabled
    // due to encryption. These fields are now stored as encrypted strings, not searchable text.
    // TODO: Implement search functionality that works with encrypted data if needed.

    // Only boolean filters work with encrypted data
    if (lucidOnly === "true") query.isLucid = true;
    if (vividOnly === "true") query.isVivid = true;
    if (recurringOnly === "true") query.isRecurring = true;
    if (nightmareOnly === "true") query.isNightmare = true;

    // Date range
    if (dateRange) {
      const [start, end] = dateRange.split(",");
      query.date = {};
      if (start) query.date.$gte = new Date(start);
      if (end) query.date.$lte = new Date(end);
    }

    const dreams = await Dream.find(query).sort({ date: -1 }).limit(50);

    // Ensure decryption is applied
    const decryptedDreams = dreams.map((dream) => {
      const decryptedDream = dream.toObject();

      // Always decrypt these fields since they're stored as encrypted strings
      decryptedDream.title = dream.getDecryptedTitle();
      decryptedDream.description = dream.getDecryptedDescription();
      decryptedDream.emotions = dream.getDecryptedEmotions();
      decryptedDream.themes = dream.getDecryptedThemes();
      decryptedDream.symbols = dream.getDecryptedSymbols();
      decryptedDream.tags = dream.getDecryptedTags();

      return decryptedDream;
    });

    res.json({
      success: true,
      data: decryptedDreams,
      count: decryptedDreams.length,
    });
  } catch (error) {
    console.error("Error searching dreams:", error);
    res.status(500).json({ error: "Failed to search dreams" });
  }
});

module.exports = router;
