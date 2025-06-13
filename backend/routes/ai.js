const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const aiService = require("../services/aiService");
const Dream = require("../models/Dream");

// GET /api/ai/status - Check AI service status
router.get("/status", authenticateUser, (req, res) => {
  try {
    const status = aiService.getStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("AI Status Error:", error);
    res.status(500).json({ error: "Failed to get AI service status" });
  }
});

// POST /api/ai/analyze - Analyze dream and suggest tags, emotions, themes, symbols
router.post("/analyze", authenticateUser, async (req, res) => {
  try {
    const { description, title } = req.body;

    if (!description || description.trim().length < 10) {
      return res.status(400).json({
        error: "Dream description must be at least 10 characters long",
      });
    }

    const analysis = await aiService.analyzeDream(description, title || "");

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("AI Analysis Error:", error);

    if (error.message.includes("API key not configured")) {
      return res.status(503).json({
        error: "AI service is not configured. Please contact administrator.",
        code: "AI_NOT_CONFIGURED",
      });
    }

    res.status(500).json({
      error: "Failed to analyze dream with AI",
      details: error.message,
    });
  }
});

// POST /api/ai/interpret - Generate dream interpretation
router.post("/interpret", authenticateUser, async (req, res) => {
  try {
    const { description, title, context = {} } = req.body;

    if (!description || description.trim().length < 10) {
      return res.status(400).json({
        error: "Dream description must be at least 10 characters long",
      });
    }

    const interpretation = await aiService.interpretDream(
      description,
      title || "",
      context,
    );

    res.json({
      success: true,
      data: interpretation,
    });
  } catch (error) {
    console.error("AI Interpretation Error:", error);

    if (error.message.includes("API key not configured")) {
      return res.status(503).json({
        error: "AI service is not configured. Please contact administrator.",
        code: "AI_NOT_CONFIGURED",
      });
    }

    res.status(500).json({
      error: "Failed to interpret dream with AI",
      details: error.message,
    });
  }
});

// POST /api/ai/insights - Generate personalized insights from dream patterns
router.post("/insights", authenticateUser, async (req, res) => {
  try {
    const { currentDream } = req.body;

    if (!currentDream || !currentDream.description) {
      return res.status(400).json({
        error: "Current dream description is required",
      });
    }

    // Get user's recent dream history
    const dreamHistory = await Dream.find({
      userId: req.user.firebaseUid,
    })
      .sort({ date: -1 })
      .limit(20)
      .select("title description date emotions themes symbols");

    if (dreamHistory.length === 0) {
      return res.status(400).json({
        error:
          "No dream history found. Add more dreams to get personalized insights.",
      });
    }

    const insights = await aiService.generateInsights(
      dreamHistory,
      currentDream,
    );

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error("AI Insights Error:", error);

    if (error.message.includes("API key not configured")) {
      return res.status(503).json({
        error: "AI service is not configured. Please contact administrator.",
        code: "AI_NOT_CONFIGURED",
      });
    }

    res.status(500).json({
      error: "Failed to generate insights with AI",
      details: error.message,
    });
  }
});

// POST /api/ai/complete-analysis - Complete AI analysis with all features
router.post("/complete-analysis", authenticateUser, async (req, res) => {
  try {
    const { description, title, context = {} } = req.body;

    if (!description || description.trim().length < 10) {
      return res.status(400).json({
        error: "Dream description must be at least 10 characters long",
      });
    }

    // Get user's recent dream history for insights
    const dreamHistory = await Dream.find({
      userId: req.user.firebaseUid,
    })
      .sort({ date: -1 })
      .limit(10)
      .select("title description date emotions themes symbols");

    // Run all AI analyses in parallel
    const [analysis, interpretation, insights] = await Promise.all([
      aiService.analyzeDream(description, title),
      aiService.interpretDream(description, title, context),
      dreamHistory.length > 0
        ? aiService.generateInsights(dreamHistory, { title, description })
        : null,
    ]);

    const completeAnalysis = {
      analysis,
      interpretation,
      insights: insights || {
        patternAnalysis: {},
        personalizedInsights: [],
        dreamProgression: "Not enough dream history for pattern analysis",
        recommendations: ["Continue journaling to get personalized insights"],
      },
    };

    res.json({
      success: true,
      data: completeAnalysis,
    });
  } catch (error) {
    console.error("Complete AI Analysis Error:", error);

    if (error.message.includes("API key not configured")) {
      return res.status(503).json({
        error: "AI service is not configured. Please contact administrator.",
        code: "AI_NOT_CONFIGURED",
      });
    }

    res.status(500).json({
      error: "Failed to complete AI analysis",
      details: error.message,
    });
  }
});

// POST /api/ai/batch-analyze - Analyze multiple dreams at once
router.post("/batch-analyze", authenticateUser, async (req, res) => {
  try {
    const { dreamIds } = req.body;

    if (!dreamIds || !Array.isArray(dreamIds) || dreamIds.length === 0) {
      return res.status(400).json({
        error: "Dream IDs array is required",
      });
    }

    if (dreamIds.length > 5) {
      return res.status(400).json({
        error: "Maximum 5 dreams can be analyzed at once",
      });
    }

    // Get dreams from database
    const dreams = await Dream.find({
      _id: { $in: dreamIds },
      userId: req.user.firebaseUid,
    });

    if (dreams.length === 0) {
      return res.status(404).json({
        error: "No dreams found with provided IDs",
      });
    }

    // Analyze each dream
    const analysisPromises = dreams.map((dream) =>
      aiService
        .analyzeDream(dream.description, dream.title)
        .then((analysis) => ({
          dreamId: dream._id,
          title: dream.title,
          analysis,
        }))
        .catch((error) => ({
          dreamId: dream._id,
          title: dream.title,
          error: error.message,
        })),
    );

    const results = await Promise.all(analysisPromises);

    res.json({
      success: true,
      data: {
        totalAnalyzed: results.length,
        successful: results.filter((r) => !r.error).length,
        failed: results.filter((r) => r.error).length,
        results,
      },
    });
  } catch (error) {
    console.error("Batch AI Analysis Error:", error);

    if (error.message.includes("API key not configured")) {
      return res.status(503).json({
        error: "AI service is not configured. Please contact administrator.",
        code: "AI_NOT_CONFIGURED",
      });
    }

    res.status(500).json({
      error: "Failed to batch analyze dreams",
      details: error.message,
    });
  }
});

module.exports = router;
