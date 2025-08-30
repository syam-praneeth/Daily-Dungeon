const mongoose = require("mongoose");
require("dotenv").config();
const { mongoURI } = require("./config/config");
const Bookmark = require("./models/Bookmark");

async function seed() {
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected for seeding");

  const sample = [
    {
      name: "Pinned: Daily Dungeon Docs",
      url: "https://example.com/docs",
      pinned: true,
    },
    { name: "MDN Web Docs", url: "https://developer.mozilla.org" },
    { name: "React", url: "https://reactjs.org" },
    { name: "GitHub", url: "https://github.com" },
  ];

  for (const item of sample) {
    try {
      await Bookmark.create(item);
      console.log("seeded", item.name);
    } catch (err) {
      if (err.code === 11000) console.log("skipping duplicate", item.name);
      else console.error(err.message);
    }
  }

  await mongoose.disconnect();
  console.log("done");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
