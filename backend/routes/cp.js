const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const UserCPConfig = require("../models/UserCPConfig");

const isValidUrl = (s = "") => /^https?:\/\//i.test(s);
const isValidUsername = (s = "") => /^[A-Za-z0-9_]{1,40}$/.test(s);

// GET /profile/cp
router.get("/profile/cp", auth, async (req, res) => {
  try {
    const doc = await UserCPConfig.findOne({ userId: req.user.id }).lean();
    if (!doc) {
      return res.json({
        mode: "manual",
        links: {},
        usernames: {},
        preferences: { showScorecards: true, theme: "auto" },
        selfReportedStats: {},
      });
    }
    const {
      mode,
      links = {},
      usernames = {},
      preferences = {},
      selfReportedStats = {},
    } = doc;
    return res.json({ mode, links, usernames, preferences, selfReportedStats });
  } catch (e) {
    console.error("GET /profile/cp error:", e);
    res.status(500).json({ msg: "Failed to load CP config" });
  }
});

// PATCH /profile/cp
router.patch("/profile/cp", auth, async (req, res) => {
  try {
    const {
      mode,
      links = {},
      usernames = {},
      preferences = {},
      selfReportedStats = {},
    } = req.body || {};

    if (mode && !["manual", "username"].includes(mode)) {
      return res.status(400).json({ msg: "Invalid mode" });
    }

    // Validate links
    const outLinks = {};
    for (const k of [
      "leetcodeUrl",
      "codechefUrl",
      "codeforcesUrl",
      "striverSheetUrl",
    ]) {
      const v = links[k];
      if (v == null || v === "") continue;
      if (!isValidUrl(v))
        return res.status(400).json({ msg: `Invalid URL for ${k}` });
      outLinks[k] = String(v);
    }

    // Validate usernames
    const outUsernames = {};
    for (const k of ["leetcode", "codechef", "codeforces"]) {
      const v = usernames[k];
      if (v == null || v === "") continue;
      if (!isValidUsername(v))
        return res.status(400).json({ msg: `Invalid username for ${k}` });
      outUsernames[k] = String(v);
    }

    // Preferences
    const outPrefs = {};
    if (preferences.showScorecards != null)
      outPrefs.showScorecards = !!preferences.showScorecards;
    if (
      preferences.theme &&
      ["auto", "light", "dark"].includes(preferences.theme)
    )
      outPrefs.theme = preferences.theme;

    // Self-reported stats: accept shape but don't enforce every field
    const stats = {};
    if (selfReportedStats.leetcode) stats.leetcode = selfReportedStats.leetcode;
    if (selfReportedStats.codechef) stats.codechef = selfReportedStats.codechef;
    if (selfReportedStats.codeforces)
      stats.codeforces = selfReportedStats.codeforces;

    const update = {
      ...(mode ? { mode } : {}),
      ...(Object.keys(outLinks).length ? { links: outLinks } : {}),
      ...(Object.keys(outUsernames).length ? { usernames: outUsernames } : {}),
      ...(Object.keys(outPrefs).length ? { preferences: outPrefs } : {}),
      ...(Object.keys(stats).length ? { selfReportedStats: stats } : {}),
      userId: req.user.id,
    };

    const doc = await UserCPConfig.findOneAndUpdate(
      { userId: req.user.id },
      { $set: update },
      { new: true, upsert: true }
    ).lean();

    const {
      mode: m,
      links: l = {},
      usernames: u = {},
      preferences: p = {},
      selfReportedStats: s = {},
    } = doc;
    res.json({
      mode: m,
      links: l,
      usernames: u,
      preferences: p,
      selfReportedStats: s,
    });
  } catch (e) {
    console.error("PATCH /profile/cp error:", e);
    res.status(500).json({ msg: "Failed to update CP config" });
  }
});

module.exports = router;
