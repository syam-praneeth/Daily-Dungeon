const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const DailyTask = require("../models/DailyTask");
const Timetable = require("../models/Timetable");
const ReadingSession = require("../models/ReadingSession");
const Journal = require("../models/Journal");
const Streak = require("../models/Streak");
const Quote = require("../models/Quote");

router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Tasks
    const tasksToday = await DailyTask.find({
      userId,
      dueDate: { $gte: today, $lt: tomorrow },
    }).sort({ dueDate: 1 });

    // Timetable for today
    const dayName = today.toLocaleString("en-US", { weekday: "long" });
    const timetableToday = await Timetable.find({
      userId,
      dayOfWeek: dayName,
    }).sort({ startTime: 1 });

    // Reading sessions
    const sessionsToday = await ReadingSession.find({
      userId,
      date: today,
    }).sort({ startTime: 1 });
    const totalToday = sessionsToday.reduce(
      (acc, s) => acc + (s.duration || 0),
      0
    );

    // Journal summary for today
    const journalToday = await Journal.findOne({ userId, date: today });
    const journalSummary = journalToday?.content?.slice(0, 160) || "";

    // Streaks
    const streak = await Streak.find({ userId }).sort({ date: 1 });

    // Quote: latest user quote or random global
    let quote = await Quote.findOne({ userId }).sort({ createdAt: -1 });
    if (!quote) {
      const count = await Quote.countDocuments({ userId: { $exists: false } });
      if (count > 0) {
        const skip = Math.floor(Math.random() * count);
        quote = await Quote.findOne({ userId: { $exists: false } }).skip(skip);
      }
    }

    res.json({
      tasksToday,
      timetableToday,
      reading: { sessions: sessionsToday, totalSeconds: totalToday },
      journal: { summary: journalSummary },
      streak,
      quote,
    });
  } catch (e) {
    res.status(500).json({ msg: "Failed to load dashboard" });
  }
});

module.exports = router;
