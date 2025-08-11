const mongoose = require("mongoose");

const TimetableSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dayOfWeek: { type: String }, // e.g. 'Monday', 'Tuesday', etc.
    startTime: { type: String, required: true }, // 'HH:mm' format
    endTime: { type: String, required: true },
    activityName: { type: String, required: true },
    reminderTime: { type: Date },
  },
  { timestamps: true }
);

TimetableSchema.index({ userId: 1, dayOfWeek: 1 });

module.exports = mongoose.model("Timetable", TimetableSchema);
