const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Timetable = require("../models/Timetable");

// Get all timetable entries for user
router.get("/", auth, async (req, res) => {
  const entries = await Timetable.find({ userId: req.user.id });
  res.json(entries);
});

// Add timetable entry
router.post("/", auth, async (req, res) => {
  const { dayOfWeek, startTime, endTime, activityName, reminderTime } =
    req.body;
  const entry = new Timetable({
    userId: req.user.id,
    dayOfWeek,
    startTime,
    endTime,
    activityName,
    reminderTime,
  });
  await entry.save();
  res.json(entry);
});

// Update timetable entry
router.put("/:id", auth, async (req, res) => {
  const entry = await Timetable.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true }
  );
  res.json(entry);
});

// Delete timetable entry
router.delete("/:id", auth, async (req, res) => {
  await Timetable.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ msg: "Entry deleted" });
});

module.exports = router;
