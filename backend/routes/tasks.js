const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/DailyTask");

// Get all tasks for user
router.get("/", auth, async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id });
  res.json(tasks);
});

// Add task
router.post("/", auth, async (req, res) => {
  const { title, description, priority, dueDate, reminderTime } = req.body;
  const task = new Task({
    userId: req.user.id,
    title,
    description,
    priority,
    dueDate,
    reminderTime,
  });
  await task.save();
  res.json(task);
});

// Update task
router.put("/:id", auth, async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true }
  );
  res.json(task);
});

// Delete task
router.delete("/:id", auth, async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ msg: "Task deleted" });
});

module.exports = router;
