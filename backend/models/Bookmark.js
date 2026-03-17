const mongoose = require("mongoose");

const { Schema } = mongoose;

const bookmarkSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    pinned: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Prevent exact duplicate bookmarks per user (same user + name + url)
bookmarkSchema.index({ user: 1, name: 1, url: 1 }, { unique: true });

// Index for efficient user queries
bookmarkSchema.index({ user: 1, pinned: -1, createdAt: -1 });

module.exports =
  mongoose.models.Bookmark || mongoose.model("Bookmark", bookmarkSchema);

