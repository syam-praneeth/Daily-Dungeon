const mongoose = require("mongoose");

const JournalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: Date, required: true },
    content: { type: String, required: true },
    mood: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

JournalSchema.index({ userId: 1, date: 1 });

JournalSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model("Journal", JournalSchema);
