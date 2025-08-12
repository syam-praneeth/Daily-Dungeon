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
router.post("/", auth, async (req, res, next) => {
  try {
    const {
      dayOfWeek,
      day, // legacy
      startTime,
      endTime,
      activityName,
      subject, // legacy
      reminderTime,
    } = req.body || {};

    const entry = new Timetable({
      userId: req.user.id,
      dayOfWeek: dayOfWeek || day,
      startTime,
      endTime,
      activityName: activityName || subject,
      reminderTime,
    });
    await entry.save();
    res.json(entry);
  } catch (err) {
    if (err?.name === "ValidationError") {
      return res.status(400).json({ msg: "Validation error", details: err });
    }
    next(err);
  }
});

// Update timetable entry
router.put("/:id", auth, async (req, res, next) => {
  try {
    const updates = { ...req.body };
    // Support legacy field names
    if (Object.prototype.hasOwnProperty.call(updates, "day")) {
      updates.dayOfWeek = updates.day;
      delete updates.day;
    }
    if (Object.prototype.hasOwnProperty.call(updates, "subject")) {
      updates.activityName = updates.subject;
      delete updates.subject;
    }
    const entry = await Timetable.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );
    res.json(entry);
  } catch (err) {
    if (err?.name === "ValidationError") {
      return res.status(400).json({ msg: "Validation error", details: err });
    }
    next(err);
  }
});

// Delete timetable entry
router.delete("/:id", auth, async (req, res) => {
  await Timetable.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ msg: "Entry deleted" });
});

module.exports = router;
