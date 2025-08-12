const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const UserLinks = require("../models/UserLinks");

// Basic normalization: trim, strip spaces/quotes, ensure protocol, validate, strip trailing slash
const sanitizeUrl = (raw = "") => {
  if (!raw) return "";
  let s = String(raw).trim();
  if (!s) return "";
  // remove whitespace and obvious invalid characters
  s = s.replace(/\s+/g, "").replace(/["'<>]/g, "");
  // prepend https if protocol missing
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    // validate via URL constructor
    const u = new URL(s);
    // only allow http/https
    if (!/^https?:$/i.test(u.protocol)) return null;
    // strip trailing slash for consistency
    const normalized = s.endsWith("/") ? s.slice(0, -1) : s;
    return normalized;
  } catch {
    return null;
  }
};

// GET /profile/links
router.get("/profile/links", auth, async (req, res) => {
  try {
    const doc = await UserLinks.findOne({ userId: req.user.id }).lean();
    res.json(doc?.links || {});
  } catch (e) {
    console.error("GET /profile/links error:", e);
    res.status(500).json({ msg: "Failed to load links" });
  }
});

// PUT /profile/links
router.put("/profile/links", auth, async (req, res) => {
  try {
    const input = req.body?.links || req.body || {};
    const keys = [
      "leetcode",
      "codechef",
      "codeforces",
      "smartinterviews",
      "striverSheet",
      "linkedin",
      "github",
      "discord",
      "spotify",
      "eduprime",
      "youtube",
      "gmail",
      "hackerrank",
      "spoj",
      "interviewbit",
      "atcoder",
    ];

    const links = {};
    for (const k of keys) {
      const v = input[k] || "";
      const cleaned = sanitizeUrl(v);
      if (cleaned === null)
        return res.status(400).json({ msg: `Invalid URL for ${k}` });
      links[k] = cleaned; // may be empty string
    }

    const doc = await UserLinks.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { links }, $setOnInsert: { userId: req.user.id } },
      { new: true, upsert: true }
    ).lean();

    res.json(doc.links || {});
  } catch (e) {
    console.error("PUT /profile/links error:", e);
    res.status(500).json({ msg: "Failed to save links" });
  }
});

module.exports = router;
