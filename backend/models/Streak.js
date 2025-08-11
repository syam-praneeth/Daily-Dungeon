const mongoose = require("mongoose");

const StreakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: Date, required: true, index: true },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

StreakSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model("Streak", StreakSchema);
