const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Journal = require("../models/Journal");

// Get all journals for user
router.get("/", auth, async (req, res) => {
  const journals = await Journal.find({ userId: req.user.id }).sort({
    date: -1,
  });
  res.json(journals);
});

// Add journal
router.post("/", auth, async (req, res) => {
  const { date, content, mood, tags } = req.body;
  const journal = new Journal({
    userId: req.user.id,
    date,
    content,
    mood,
    tags,
  });
  await journal.save();
  res.json(journal);
});

// Update journal
router.put("/:id", auth, async (req, res) => {
  const journal = await Journal.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true }
  );
  res.json(journal);
});

// Delete journal
router.delete("/:id", auth, async (req, res) => {
  await Journal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ msg: "Journal deleted" });
});

module.exports = router;
