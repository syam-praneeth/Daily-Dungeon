const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Bookmark = require("../models/Bookmark");

// GET /api/bookmarks?limit=20&page=1
router.get("/", async (req, res, next) => {
  try {
    const limit = Math.max(
      1,
      Math.min(100, parseInt(req.query.limit, 10) || 20)
    );
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const skip = (page - 1) * limit;

    // sort pinned items first, then newest
    const [items, total] = await Promise.all([
      Bookmark.find()
        .sort({ pinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Bookmark.countDocuments(),
    ]);

    res.json({ items, total, page, limit });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookmarks
router.post("/", async (req, res, next) => {
  try {
    const { name, url, pinned } = req.body;
    if (!name || !url)
      return res.status(400).json({ msg: "name and url required" });

    const doc = new Bookmark({ name, url, pinned: !!pinned });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ msg: "Bookmark already exists" });
    next(err);
  }
});

// PUT /api/bookmarks/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ msg: "invalid id" });

    // allow partial updates (name, url, pinned)
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.url !== undefined) updates.url = req.body.url;
    if (req.body.pinned !== undefined) updates.pinned = req.body.pinned;

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ msg: "no updates provided" });

    const updated = await Bookmark.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ msg: "not found" });
    res.json(updated);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ msg: "Bookmark already exists" });
    next(err);
  }
});

// PATCH /api/bookmarks/:id/pin
router.patch("/:id/pin", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ msg: "invalid id" });
    const { pinned } = req.body;
    const updated = await Bookmark.findByIdAndUpdate(
      id,
      { pinned: !!pinned },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: "not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/bookmarks/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ msg: "invalid id" });

    const removed = await Bookmark.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ msg: "not found" });
    res.json({ msg: "deleted", id: removed._id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
