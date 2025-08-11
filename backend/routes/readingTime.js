const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ReadingTime = require("../models/ReadingTime");

// Get today's reading time
router.get("/today", auth, async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const entry = await ReadingTime.findOne({ user: req.user.id, date: today });
  res.json(entry || { timeSpent: 0 });
});

// Start/stop reading session (add time)
router.post("/add", auth, async (req, res) => {
  const { seconds } = req.body;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let entry = await ReadingTime.findOne({ user: req.user.id, date: today });
  if (!entry) {
    entry = new ReadingTime({ user: req.user.id, date: today, timeSpent: 0 });
  }
  entry.timeSpent += seconds;
  await entry.save();
  res.json(entry);
});

// Get streak (heatmap)
router.get("/streak", auth, async (req, res) => {
  const entries = await ReadingTime.find({ user: req.user.id });
  res.json(entries);
});

module.exports = router;
