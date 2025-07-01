const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticateUser = require("../middleware/auth");
const notificationService = require("../services/notificationService");

// Get all custom notifications for the authenticated user
router.get("/", authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.customNotifications || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new custom notification
router.post("/", authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    if (!user) return res.status(404).json({ error: "User not found" });
    user.customNotifications.push(req.body);
    await user.save();
    await notificationService.scheduleCustomNotifications(user.firebaseUid);
    res
      .status(201)
      .json(user.customNotifications[user.customNotifications.length - 1]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a custom notification
router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    if (!user) return res.status(404).json({ error: "User not found" });
    const notification = user.customNotifications.id(req.params.id);
    if (!notification)
      return res.status(404).json({ error: "Notification not found" });
    Object.assign(notification, req.body, { updatedAt: new Date() });
    await user.save();
    await notificationService.scheduleCustomNotifications(user.firebaseUid);
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a custom notification
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    if (!user) return res.status(404).json({ error: "User not found" });
    const notification = user.customNotifications.id(req.params.id);
    if (!notification)
      return res.status(404).json({ error: "Notification not found" });
    notification.remove();
    await user.save();
    await notificationService.scheduleCustomNotifications(user.firebaseUid);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
