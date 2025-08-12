const mongoose = require("mongoose");

const ContestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ["LeetCode", "CodeChef", "Codeforces"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    startTime: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    url: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["upcoming", "running", "finished"],
      required: true,
    },
    notes: { type: String, trim: true },
    remind: { type: Boolean, default: false },
    endTime: { type: Date },
  },
  { timestamps: true }
);

ContestSchema.pre("save", function (next) {
  if (this.startTime && this.durationMinutes) {
    const end = new Date(this.startTime);
    end.setMinutes(end.getMinutes() + this.durationMinutes);
    this.endTime = end;
  }
  next();
});

ContestSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() || {};
  const start = update.startTime ?? this._conditions.startTime;
  const dur = update.durationMinutes ?? this._conditions.durationMinutes;
  if (start && dur) {
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + Number(dur));
    this.set({ endTime: end });
  }
  next();
});

module.exports = mongoose.model("Contest", ContestSchema);
