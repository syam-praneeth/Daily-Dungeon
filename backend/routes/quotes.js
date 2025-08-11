const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Quote = require("../models/Quote");

// Helper: fallback global quotes in-memory if DB has none
const fallbackQuotes = [
  "Success is not final, failure is not fatal: It is the courage to continue that counts.",
  "The only way to do great work is to love what you do.",
  "Don’t watch the clock; do what it does. Keep going.",
  "The future depends on what you do today.",
];

// GET a quote: prefer latest user quote, else random global from DB, else fallback
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    let q = await Quote.findOne({ userId }).sort({ createdAt: -1 });
    if (!q) {
      const count = await Quote.countDocuments({ userId: { $exists: false } });
      if (count > 0) {
        const skip = Math.floor(Math.random() * count);
        q = await Quote.findOne({ userId: { $exists: false } }).skip(skip);
      }
    }
    if (q) {
      return res.json({ quote: q.text, author: q.author || "Unknown" });
    }
    // fallback
    const random = Math.floor(Math.random() * fallbackQuotes.length);
    return res.json({ quote: fallbackQuotes[random], author: "" });
  } catch (e) {
    return res.status(500).json({ msg: "Failed to fetch quote" });
  }
});

// GET next/random quote explicitly
router.get("/random", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    // Try random among user's quotes first
    const userCount = await Quote.countDocuments({ userId });
    if (userCount > 0) {
      const skip = Math.floor(Math.random() * userCount);
      const q = await Quote.findOne({ userId }).skip(skip);
      return res.json({ quote: q.text, author: q.author || "Unknown" });
    }
    // Then random among global quotes
    const count = await Quote.countDocuments({ userId: { $exists: false } });
    if (count > 0) {
      const skip = Math.floor(Math.random() * count);
      const q = await Quote.findOne({ userId: { $exists: false } }).skip(skip);
      return res.json({ quote: q.text, author: q.author || "Unknown" });
    }
    // Finally fallback
    const random = Math.floor(Math.random() * fallbackQuotes.length);
    return res.json({ quote: fallbackQuotes[random], author: "" });
  } catch (e) {
    return res.status(500).json({ msg: "Failed to fetch quote" });
  }
});

// POST a new quote (user-submitted)
router.post("/", auth, async (req, res) => {
  try {
    const { text, author, category } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ msg: "Text is required" });
    }
    const doc = new Quote({
      text: text.trim(),
      author: author && author.trim() ? author.trim() : "Unknown",
      category: category && category.trim() ? category.trim() : undefined,
      userId: req.user.id,
    });
    await doc.save();
    return res.status(201).json(doc);
  } catch (e) {
    return res.status(500).json({ msg: "Failed to save quote" });
  }
});

module.exports = router;
