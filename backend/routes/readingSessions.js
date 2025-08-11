const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ReadingSession = require("../models/ReadingSession");
const Streak = require("../models/Streak");

// Create a reading session
router.post("/", auth, async (req, res) => {
  try {
    const { sessionName, startTime, endTime, duration } = req.body;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const date = new Date(start);
    date.setHours(0, 0, 0, 0);
    const session = new ReadingSession({
      userId: req.user.id,
      sessionName,
      startTime: start,
      endTime: end,
      duration,
      date,
    });
    await session.save();

    // update streak: mark active for the date
    await Streak.updateOne(
      { userId: req.user.id, date },
      { $set: { isActive: true } },
      { upsert: true }
    );

    res.json(session);
  } catch (e) {
    res.status(500).json({ msg: "Failed to save session" });
  }
});

// Get today's total duration
router.get("/today", auth, async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mongoose = require("mongoose");
  const [agg] = await ReadingSession.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user.id),
        date: today,
      },
    },
    { $group: { _id: null, total: { $sum: "$duration" } } },
  ]);
  const sessions = await ReadingSession.find({
    userId: req.user.id,
    date: today,
  }).sort({ startTime: 1 });
  res.json({ timeSpent: agg?.total || 0, sessions });
});

// Get streaks (heatmap data)
router.get("/streak", auth, async (req, res) => {
  const days = await Streak.find({ userId: req.user.id }).sort({ date: 1 });
  res.json(days);
});

// List sessions (optionally by range)
router.get("/", auth, async (req, res) => {
  const { from, to } = req.query;
  const filter = { userId: req.user.id };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  const sessions = await ReadingSession.find(filter).sort({ startTime: -1 });
  res.json(sessions);
});

module.exports = router;
