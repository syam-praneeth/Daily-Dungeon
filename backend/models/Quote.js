const mongoose = require("mongoose");

const QuoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: String },
    category: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }, // optional
  },
  { timestamps: true }
);

QuoteSchema.index({ userId: 1 });

module.exports = mongoose.model("Quote", QuoteSchema);
