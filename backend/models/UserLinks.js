const mongoose = require("mongoose");

const LinksSchema = new mongoose.Schema(
  {
    leetcode: { type: String, trim: true, default: "" },
    codechef: { type: String, trim: true, default: "" },
    codeforces: { type: String, trim: true, default: "" },
    smartinterviews: { type: String, trim: true, default: "" },
    striverSheet: { type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    github: { type: String, trim: true, default: "" },
    discord: { type: String, trim: true, default: "" },
    spotify: { type: String, trim: true, default: "" },
    eduprime: { type: String, trim: true, default: "" },
    youtube: { type: String, trim: true, default: "" },
    gmail: { type: String, trim: true, default: "" },
    hackerrank: { type: String, trim: true, default: "" },
    spoj: { type: String, trim: true, default: "" },
    interviewbit: { type: String, trim: true, default: "" },
    atcoder: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const UserLinksSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      unique: true,
    },
    links: { type: LinksSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserLinks", UserLinksSchema);
