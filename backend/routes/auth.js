const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/config");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "praneethsinguluri@gmail.com"
).toLowerCase();

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });
    if (user && !user.isDeleted) {
      return res.status(400).json({ msg: "User already exists" });
    }
    if (user && user.isDeleted) {
      return res
        .status(403)
        .json({ msg: "Account is deleted. Contact admin to restore." });
    }
    user = new User({
      name: name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      password,
    });
    await user.save();
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "30d" });
    res.json({ token });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });
    if (user.isDeleted) {
      return res
        .status(403)
        .json({ msg: "Account deleted. Contact admin for recovery." });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "30d" });
    res.json({ token });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id)
      .select({ name: 1, email: 1, isDeleted: 1 })
      .lean();
    if (!me || me.isDeleted) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({
      _id: me._id,
      name: me.name,
      email: me.email,
      isAdmin: String(me.email || "").toLowerCase() === ADMIN_EMAIL,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to load current user" });
  }
});

router.delete("/me", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    if (!me || me.isDeleted) {
      return res.status(404).json({ msg: "User not found" });
    }

    me.isDeleted = true;
    me.deletedAt = new Date();
    await me.save();

    await require("../models/DailyTask").updateMany(
      { userId: req.user.id, isDeleted: { $ne: true } },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedByUserId: req.user.id,
        },
      }
    );

    res.json({ msg: "Account deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete account" });
  }
});

module.exports = router;
