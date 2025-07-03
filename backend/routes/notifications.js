const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authenticateUser } = require("../middleware/auth");
const notificationService = require("../services/notificationService");

/**
 * @swagger
 * /notifications/logs:
 *   get:
 *     summary: Get notification logs for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notification logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                   title:
 *                     type: string
 *                   body:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   success:
 *                     type: boolean
 *                   error:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all custom notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of custom notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new custom notification
 *     tags: [Notifications]
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
 *         description: Custom notification created
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /notifications/{id}:
 *   put:
 *     summary: Update a custom notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Notification ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Custom notification updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *   delete:
 *     summary: Delete a custom notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Custom notification deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
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

// Get notification logs for the authenticated user
router.get("/logs", authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    if (!user) return res.status(404).json({ error: "User not found" });
    // Return logs sorted by most recent first
    const logs = (user.notificationLogs || [])
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
