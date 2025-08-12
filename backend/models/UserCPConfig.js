const mongoose = require("mongoose");

const SelfReportedLeetCodeSchema = new mongoose.Schema(
  {
    totalSolved: { type: Number, min: 0 },
    easy: { type: Number, min: 0 },
    medium: { type: Number, min: 0 },
    hard: { type: Number, min: 0 },
    contestRating: { type: Number, min: 0 },
    lastUpdated: { type: Date },
  },
  { _id: false }
);

const SelfReportedCodeChefSchema = new mongoose.Schema(
  {
    rating: { type: Number, min: 0 },
    stars: { type: Number, min: 0, max: 7 },
    globalRank: { type: Number, min: 0 },
    countryRank: { type: Number, min: 0 },
    lastUpdated: { type: Date },
  },
  { _id: false }
);

const SelfReportedCodeforcesSchema = new mongoose.Schema(
  {
    rating: { type: Number, min: 0 },
    maxRating: { type: Number, min: 0 },
    rankTitle: { type: String, trim: true },
    lastUpdated: { type: Date },
  },
  { _id: false }
);

const UserCPConfigSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mode: { type: String, enum: ["manual", "username"], default: "manual" },
    links: {
      leetcodeUrl: { type: String, trim: true },
      codechefUrl: { type: String, trim: true },
      codeforcesUrl: { type: String, trim: true },
      striverSheetUrl: { type: String, trim: true },
    },
    usernames: {
      leetcode: { type: String, trim: true },
      codechef: { type: String, trim: true },
      codeforces: { type: String, trim: true },
    },
    preferences: {
      showScorecards: { type: Boolean, default: true },
      theme: { type: String, enum: ["auto", "light", "dark"], default: "auto" },
    },
    selfReportedStats: {
      leetcode: { type: SelfReportedLeetCodeSchema },
      codechef: { type: SelfReportedCodeChefSchema },
      codeforces: { type: SelfReportedCodeforcesSchema },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserCPConfig", UserCPConfigSchema);
