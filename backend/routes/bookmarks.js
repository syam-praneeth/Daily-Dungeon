const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Bookmark = require("../models/Bookmark");
const auth = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// GET /api/bookmarks?limit=20&page=1
router.get("/", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = Math.max(
      1,
      Math.min(100, parseInt(req.query.limit, 10) || 20)
    );
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const skip = (page - 1) * limit;

    // Filter by user, sort pinned items first, then newest
    const [items, total] = await Promise.all([
      Bookmark.find({ user: userId })
        .sort({ pinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Bookmark.countDocuments({ user: userId }),
    ]);

    res.json({ items, total, page, limit });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookmarks
router.post("/", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, url, pinned } = req.body;
    if (!name || !url)
      return res.status(400).json({ msg: "name and url required" });

    const doc = new Bookmark({ user: userId, name, url, pinned: !!pinned });
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
    const userId = req.user.id;
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

    // Only update if bookmark belongs to user
    const updated = await Bookmark.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true, runValidators: true }
    );
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
    const userId = req.user.id;
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ msg: "invalid id" });

    const { pinned } = req.body;
    // Only update if bookmark belongs to user
    const updated = await Bookmark.findOneAndUpdate(
      { _id: id, user: userId },
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
    const userId = req.user.id;
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ msg: "invalid id" });

    // Only delete if bookmark belongs to user
    const removed = await Bookmark.findOneAndDelete({ _id: id, user: userId });
    if (!removed) return res.status(404).json({ msg: "not found" });
    res.json({ msg: "deleted", id: removed._id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
