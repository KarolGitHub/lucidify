const express = require("express");
const { body, validationResult, query } = require("express-validator");
const Dream = require("../models/Dream");
const User = require("../models/User");
const { authenticateJWT } = require("../middleware/jwtAuth");
const router = express.Router();

// Validation rules
const dreamValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Dream title must be between 1 and 200 characters"),
  body("description")
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage("Dream description must be between 1 and 10,000 characters"),
  body("date").isISO8601().withMessage("Invalid date format"),
  body("isLucid").isBoolean().optional(),
  body("isVivid").isBoolean().optional(),
  body("isRecurring").isBoolean().optional(),
  body("isNightmare").isBoolean().optional(),
  body("tags").isArray().optional(),
  body("emotions").isArray().optional(),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .optional()
    .withMessage("Rating must be between 1 and 5"),
];

// GET /api/dreams - Get all dreams for a user
router.get("/", authenticateJWT, async (req, res) => {
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
    } = req.query;

    const query = { userId: req.user._id.toString() };

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

    // Tags filter
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    // Emotions filter
    if (emotions) {
      const emotionArray = emotions.split(",").map((emotion) => emotion.trim());
      query.emotions = { $in: emotionArray };
    }

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

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

    // Calculate pagination info
    const totalPages = Math.ceil(totalDocs / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: dreams,
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

// GET /api/dreams/:id - Get a specific dream
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const dream = await Dream.findOne({
      _id: req.params.id,
      userId: req.user._id.toString(),
    });

    if (!dream) {
      return res.status(404).json({ error: "Dream not found" });
    }

    res.json({ success: true, data: dream });
  } catch (error) {
    console.error("Error fetching dream:", error);
    res.status(500).json({ error: "Failed to fetch dream" });
  }
});

// POST /api/dreams - Create a new dream
router.post("/", authenticateJWT, dreamValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const dreamData = {
      ...req.body,
      userId: req.user._id.toString(),
    };

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

// PUT /api/dreams/:id - Update a dream
router.put("/:id", authenticateJWT, dreamValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const dream = await Dream.findOne({
      _id: req.params.id,
      userId: req.user._id.toString(),
    });

    if (!dream) {
      return res.status(404).json({ error: "Dream not found" });
    }

    // Check if lucid status changed
    const wasLucid = dream.isLucid;
    const isNowLucid = req.body.isLucid;

    Object.assign(dream, req.body);
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

// DELETE /api/dreams/:id - Delete a dream
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const dream = await Dream.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id.toString(),
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

// GET /api/dreams/stats/user - Get user's dream statistics
router.get("/stats/user", authenticateJWT, async (req, res) => {
  try {
    const stats = await Dream.getUserStats(req.user._id.toString());

    // Get recent activity
    const recentDreams = await Dream.find({ userId: req.user._id.toString() })
      .sort({ date: -1 })
      .limit(5)
      .select("title date isLucid");

    // Get most common tags
    const tagStats = await Dream.aggregate([
      { $match: { userId: req.user._id.toString() } },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get most common emotions
    const emotionStats = await Dream.aggregate([
      { $match: { userId: req.user._id.toString() } },
      { $unwind: "$emotions" },
      {
        $group: {
          _id: "$emotions",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        recentDreams,
        tagStats,
        emotionStats,
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

// GET /api/dreams/search - Advanced search
router.get("/search/advanced", authenticateJWT, async (req, res) => {
  try {
    const {
      q,
      tags,
      emotions,
      dateRange,
      lucidOnly,
      vividOnly,
      recurringOnly,
      nightmareOnly,
    } = req.query;

    const query = { userId: req.user._id.toString() };

    // Text search
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ];
    }

    // Filters
    if (lucidOnly === "true") query.isLucid = true;
    if (vividOnly === "true") query.isVivid = true;
    if (recurringOnly === "true") query.isRecurring = true;
    if (nightmareOnly === "true") query.isNightmare = true;

    // Tags and emotions
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    if (emotions) {
      const emotionArray = emotions.split(",").map((emotion) => emotion.trim());
      query.emotions = { $in: emotionArray };
    }

    // Date range
    if (dateRange) {
      const [start, end] = dateRange.split(",");
      query.date = {};
      if (start) query.date.$gte = new Date(start);
      if (end) query.date.$lte = new Date(end);
    }

    const dreams = await Dream.find(query).sort({ date: -1 }).limit(50);

    res.json({
      success: true,
      data: dreams,
      count: dreams.length,
    });
  } catch (error) {
    console.error("Error searching dreams:", error);
    res.status(500).json({ error: "Failed to search dreams" });
  }
});

module.exports = router;
