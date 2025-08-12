const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// GET /api/users?search=abc -> list users (id, name, email) excluding current user
router.get("/users", auth, async (req, res) => {
  try {
    const q = String(req.query.search || "").trim();
    const me = req.user.id;
    const filter = { _id: { $ne: me } };
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { email: rx }];
    }
    const users = await User.find(filter)
      .select({ name: 1, email: 1, lastSeen: 1 })
      .limit(20)
      .lean();
    res.json(users);
  } catch (e) {
    res.status(500).json({ msg: "Failed to load users" });
  }
});

// GET /api/users/:id -> single user summary
router.get("/users/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select({ name: 1, email: 1, lastSeen: 1 })
      .lean();
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ msg: "Failed to load user" });
  }
});

module.exports = router;
