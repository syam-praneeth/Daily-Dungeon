// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const { mongoURI } = require("./config/config");
// require("dotenv").config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use("/api/auth", require("./routes/auth"));
// app.use("/api/tasks", require("./routes/tasks"));
// app.use("/api/journals", require("./routes/journals"));
// app.use("/api/timetable", require("./routes/timetable"));
// app.use("/api/readingTime", require("./routes/readingTime")); // legacy simple counter
// app.use("/api/readingSessions", require("./routes/readingSessions"));
// app.use("/api/quotes", require("./routes/quotes"));
// app.use("/api/dashboard", require("./routes/dashboard"));
// app.use("/api", require("./routes/users"));
// app.use("/api", require("./routes/cp"));
// app.use("/api", require("./routes/contests"));
// app.use("/api", require("./routes/links"));
// // Chat removed

// // Connect to MongoDB
// mongoose
//   .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error(err));

// const PORT = process.env.PORT || 5000;
// // Global error handler
// // eslint-disable-next-line no-unused-vars
// app.use((err, req, res, next) => {
//   console.error("Unhandled error:", err);
//   if (res.headersSent) return;
//   res.status(500).json({ msg: "Internal server error" });
// });

// process.on("unhandledRejection", (reason) => {
//   console.error("Unhandled Rejection:", reason);
// });
// process.on("uncaughtException", (err) => {
//   console.error("Uncaught Exception:", err);
// });

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { mongoURI } = require("./config/config");

const app = express();

// =====================
// CORS CONFIGURATION
// =====================
const allowedOrigins = [
  "https://daily-dungeon.vercel.app", // ✅ Replace with your actual Vercel frontend URL
  "http://localhost:3000", // ✅ Allow local React dev
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());

// =====================
// ROUTES
// =====================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/journals", require("./routes/journals"));
app.use("/api/timetable", require("./routes/timetable"));
app.use("/api/readingTime", require("./routes/readingTime")); // legacy simple counter
app.use("/api/readingSessions", require("./routes/readingSessions"));
app.use("/api/quotes", require("./routes/quotes"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api", require("./routes/users"));
app.use("/api", require("./routes/cp"));
app.use("/api", require("./routes/contests"));
app.use("/api", require("./routes/links"));
// Chat route removed
app.use("/api/bookmarks", require("./routes/bookmarks"));

// Simple health check route (avoids "Cannot GET /" on Render base URL)
app.get("/", (req, res) => {
  res.send("✅ API is running");
});

// =====================
// MONGODB CONNECTION
// =====================
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// =====================
// ERROR HANDLING
// =====================
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) return;
  res.status(500).json({ msg: "Internal server error" });
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
