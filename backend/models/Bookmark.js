const mongoose = require("mongoose");

const { Schema } = mongoose;

const bookmarkSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    pinned: { type: Boolean, default: false },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Prevent exact duplicate bookmarks (same name + url)
bookmarkSchema.index({ name: 1, url: 1 }, { unique: true });

module.exports =
  mongoose.models.Bookmark || mongoose.model("Bookmark", bookmarkSchema);
