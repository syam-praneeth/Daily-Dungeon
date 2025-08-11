const mongoose = require("mongoose");

const ReadingSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionName: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true }, // in seconds
    date: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

ReadingSessionSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model("ReadingSession", ReadingSessionSchema);
