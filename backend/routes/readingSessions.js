const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ReadingSession = require("../models/ReadingSession");
const Streak = require("../models/Streak");

// Helper: IST start-of-day for a given Date
const IST_OFFSET_MIN = 330; // +05:30
const toISTStartOfDay = (d) => {
  const src = new Date(d);
  // shift to IST, zero out time, shift back to UTC
  const ist = new Date(src.getTime() + IST_OFFSET_MIN * 60 * 1000);
  ist.setHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET_MIN * 60 * 1000);
};
const addDays = (d, n) => new Date(d.getTime() + n * 24 * 60 * 60 * 1000);

// Create a reading session
router.post("/", auth, async (req, res) => {
  try {
    const { sessionName, startTime, endTime, duration } = req.body;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const date = toISTStartOfDay(start);
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
  const now = new Date();
  const start = toISTStartOfDay(now);
  const next = addDays(start, 1);
  const mongoose = require("mongoose");
  const [agg] = await ReadingSession.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user.id),
        startTime: { $gte: start, $lt: next },
      },
    },
    { $group: { _id: null, total: { $sum: "$duration" } } },
  ]);
  const sessions = await ReadingSession.find({
    userId: req.user.id,
    startTime: { $gte: start, $lt: next },
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
  const { from, to, day } = req.query;
  const filter = { userId: req.user.id };
  if (day) {
    // Filter sessions within the given IST day range, using startTime
    const start = toISTStartOfDay(new Date(day));
    const next = addDays(start, 1);
    filter.startTime = { $gte: start, $lt: next };
  } else if (from || to) {
    filter.startTime = {};
    if (from) filter.startTime.$gte = new Date(from);
    if (to) filter.startTime.$lte = new Date(to);
  }
  const sessions = await ReadingSession.find(filter).sort({ startTime: -1 });
  res.json(sessions);
});

// Delete a session
router.delete("/:id", auth, async (req, res) => {
  try {
    const session = await ReadingSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!session) return res.status(404).json({ msg: "Session not found" });
    // If no other sessions remain for that IST day, mark streak inactive
    const start = toISTStartOfDay(new Date(session.startTime));
    const next = addDays(start, 1);
    const remaining = await ReadingSession.countDocuments({
      userId: req.user.id,
      startTime: { $gte: start, $lt: next },
    });
    if (remaining === 0) {
      await Streak.updateOne(
        { userId: req.user.id, date: start },
        { $set: { isActive: false } },
        { upsert: true }
      );
    }
    res.json({ msg: "Session deleted" });
  } catch (e) {
    res.status(500).json({ msg: "Failed to delete session" });
  }
});

module.exports = router;
