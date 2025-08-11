const mongoose = require("mongoose");

const DailyTaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    reminderTime: { type: Date },
  },
  { timestamps: true }
);

DailyTaskSchema.index({ userId: 1, dueDate: 1 });

module.exports = mongoose.model("DailyTask", DailyTaskSchema);
