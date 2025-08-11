const mongoose = require("mongoose");

const ReadingTimeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    timeSpent: { type: Number, default: 0 }, // in seconds
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReadingTime", ReadingTimeSchema);
