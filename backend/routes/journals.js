const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Journal = require("../models/Journal");

// Get all journals for user
router.get("/", auth, async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.user.id }).sort({
      date: -1,
    });
    res.json(journals);
  } catch (err) {
    console.error("GET /api/journals error:", err);
    res.status(500).json({ msg: "Failed to fetch journals" });
  }
});

// Add journal
router.post("/", auth, async (req, res) => {
  try {
    const { date, content, mood, tags } = req.body || {};
    if (!content || !String(content).trim()) {
      return res.status(400).json({ msg: "Content is required" });
    }
    const d = new Date(date || Date.now());
    if (isNaN(d.getTime())) {
      return res.status(400).json({ msg: "Invalid date" });
    }
    const journal = new Journal({
      userId: req.user.id,
      date: d,
      content: String(content).trim(),
      mood,
      tags,
    });
    await journal.save();
    res.json(journal);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ msg: "Validation error", details: err });
    }
    console.error("POST /api/journals error:", err);
    res.status(500).json({ msg: "Failed to create journal" });
  }
});

// Update journal
router.put("/:id", auth, async (req, res) => {
  try {
    const update = { ...req.body };
    delete update.userId;
    if (update.content !== undefined && !String(update.content).trim()) {
      return res.status(400).json({ msg: "Content cannot be empty" });
    }
    if (update.date !== undefined) {
      const d = new Date(update.date);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ msg: "Invalid date" });
      }
      update.date = d;
    }
    const journal = await Journal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      { new: true, runValidators: true }
    );
    if (!journal) return res.status(404).json({ msg: "Journal not found" });
    res.json(journal);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ msg: "Validation error", details: err });
    }
    console.error("PUT /api/journals/:id error:", err);
    res.status(500).json({ msg: "Failed to update journal" });
  }
});

// Delete journal
router.delete("/:id", auth, async (req, res) => {
  try {
    const result = await Journal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!result) return res.status(404).json({ msg: "Journal not found" });
    res.json({ msg: "Journal deleted" });
  } catch (err) {
    console.error("DELETE /api/journals/:id error:", err);
    res.status(500).json({ msg: "Failed to delete journal" });
  }
});

module.exports = router;
