const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/DailyTask");

// helper to normalize and validate fields safely
function mapPriority(p) {
  if (!p) return undefined;
  const v = String(p).toLowerCase();
  if (v === "high") return "High";
  if (v === "medium") return "Medium";
  if (v === "low") return "Low";
  return undefined; // invalid
}

function toDateOrUndefined(val) {
  if (!val) return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
}

// Get all tasks for user
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.json(tasks);
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    res.status(500).json({ msg: "Failed to fetch tasks" });
  }
});

// Add task
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, priority, dueDate, reminderTime, status } =
      req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({ msg: "Title is required" });
    }

    const normalizedPriority = mapPriority(priority) ?? undefined;
    if (priority !== undefined && !normalizedPriority) {
      return res
        .status(400)
        .json({ msg: "Invalid priority. Use High, Medium or Low" });
    }

    const task = new Task({
      userId: req.user.id,
      title: String(title).trim(),
      description,
      priority: normalizedPriority,
      dueDate: toDateOrUndefined(dueDate),
      reminderTime: toDateOrUndefined(reminderTime),
      status,
    });
    await task.save();
    res.json(task);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ msg: "Validation error", details: err });
    }
    console.error("POST /api/tasks error:", err);
    res.status(500).json({ msg: "Failed to create task" });
  }
});

// Update task
router.put("/:id", auth, async (req, res) => {
  try {
    const update = { ...req.body };
    // never allow changing ownership
    delete update.userId;

    if (update.priority !== undefined) {
      const normalized = mapPriority(update.priority);
      if (!normalized) {
        return res
          .status(400)
          .json({ msg: "Invalid priority. Use High, Medium or Low" });
      }
      update.priority = normalized;
    }
    if (update.dueDate !== undefined) {
      update.dueDate = toDateOrUndefined(update.dueDate);
    }
    if (update.reminderTime !== undefined) {
      update.reminderTime = toDateOrUndefined(update.reminderTime);
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ msg: "Task not found" });
    res.json(task);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ msg: "Validation error", details: err });
    }
    console.error("PUT /api/tasks/:id error:", err);
    res.status(500).json({ msg: "Failed to update task" });
  }
});

// Delete task
router.delete("/:id", auth, async (req, res) => {
  try {
    const result = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!result) return res.status(404).json({ msg: "Task not found" });
    res.json({ msg: "Task deleted" });
  } catch (err) {
    console.error("DELETE /api/tasks/:id error:", err);
    res.status(500).json({ msg: "Failed to delete task" });
  }
});

module.exports = router;
