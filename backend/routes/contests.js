const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Contest = require("../models/Contest");

const isValidUrl = (s = "") => /^https?:\/\//i.test(s);

// GET /contests?status=&limit=&sort=
router.get("/contests", auth, async (req, res) => {
  try {
    const { status, limit = 100, sort = "startTime" } = req.query;
    const q = { userId: req.user.id };
    if (status && ["upcoming", "running", "finished"].includes(status))
      q.status = status;
    const cursor = Contest.find(q)
      .sort({ [sort]: 1 })
      .limit(Math.min(Number(limit) || 100, 200))
      .lean();
    const data = await cursor;
    res.json(data);
  } catch (e) {
    console.error("GET /contests error:", e);
    res.status(500).json({ msg: "Failed to load contests" });
  }
});

// POST /contests
router.post("/contests", auth, async (req, res) => {
  try {
    const {
      platform,
      title,
      startTime,
      durationMinutes,
      url,
      status,
      notes,
      remind,
    } = req.body || {};
    if (!platform || !["LeetCode", "CodeChef", "Codeforces"].includes(platform))
      return res.status(400).json({ msg: "Invalid platform" });
    if (!title) return res.status(400).json({ msg: "Title required" });
    if (!startTime || isNaN(Date.parse(startTime)))
      return res.status(400).json({ msg: "Invalid startTime" });
    if (!durationMinutes || Number(durationMinutes) <= 0)
      return res.status(400).json({ msg: "Invalid duration" });
    if (!url || !isValidUrl(url))
      return res.status(400).json({ msg: "Invalid URL" });
    if (!status || !["upcoming", "running", "finished"].includes(status))
      return res.status(400).json({ msg: "Invalid status" });

    const doc = await Contest.create({
      userId: req.user.id,
      platform,
      title,
      startTime: new Date(startTime),
      durationMinutes: Number(durationMinutes),
      url,
      status,
      notes,
      remind: !!remind,
    });
    res.status(201).json(doc);
  } catch (e) {
    console.error("POST /contests error:", e);
    res.status(500).json({ msg: "Failed to create contest" });
  }
});

// PATCH /contests/:id
router.patch("/contests/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = [
      "platform",
      "title",
      "startTime",
      "durationMinutes",
      "url",
      "status",
      "notes",
      "remind",
    ];
    const update = {};
    for (const k of allowed) if (k in req.body) update[k] = req.body[k];

    if (
      update.platform &&
      !["LeetCode", "CodeChef", "Codeforces"].includes(update.platform)
    )
      return res.status(400).json({ msg: "Invalid platform" });
    if (update.url && !/^https?:\/\//i.test(update.url))
      return res.status(400).json({ msg: "Invalid URL" });
    if (update.startTime && isNaN(Date.parse(update.startTime)))
      return res.status(400).json({ msg: "Invalid startTime" });
    if (update.durationMinutes && Number(update.durationMinutes) <= 0)
      return res.status(400).json({ msg: "Invalid duration" });
    if (
      update.status &&
      !["upcoming", "running", "finished"].includes(update.status)
    )
      return res.status(400).json({ msg: "Invalid status" });

    if (update.startTime) update.startTime = new Date(update.startTime);
    if (update.durationMinutes)
      update.durationMinutes = Number(update.durationMinutes);

    const doc = await Contest.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: update },
      { new: true }
    ).lean();
    if (!doc) return res.status(404).json({ msg: "Contest not found" });
    res.json(doc);
  } catch (e) {
    console.error("PATCH /contests/:id error:", e);
    res.status(500).json({ msg: "Failed to update contest" });
  }
});

// DELETE /contests/:id
router.delete("/contests/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Contest.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    }).lean();
    if (!doc) return res.status(404).json({ msg: "Contest not found" });
    res.json({ ok: true });
  } catch (e) {
    console.error("DELETE /contests/:id error:", e);
    res.status(500).json({ msg: "Failed to delete contest" });
  }
});

module.exports = router;
