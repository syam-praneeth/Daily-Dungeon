const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const DailyTask = require("../models/DailyTask");
const User = require("../models/User");
const Journal = require("../models/Journal");
const ReadingSession = require("../models/ReadingSession");
const Bookmark = require("../models/Bookmark");
const Contest = require("../models/Contest");
const Timetable = require("../models/Timetable");
const Streak = require("../models/Streak");
const UserLinks = require("../models/UserLinks");
const UserCPConfig = require("../models/UserCPConfig");

const key = (id) => String(id || "");
const toMap = (rows, valueFactory) => {
  const map = new Map();
  (rows || []).forEach((row) => {
    map.set(key(row._id), valueFactory(row));
  });
  return map;
};

router.get("/deletions", auth, admin, async (req, res) => {
  try {
    const deletedTasks = await DailyTask.find({ isDeleted: true })
      .sort({ deletedAt: -1, createdAt: -1 })
      .populate("userId", "name email")
      .populate("deletedByUserId", "name email")
      .lean();

    const deletedUsers = await User.find({ isDeleted: true })
      .select({ name: 1, email: 1, deletedAt: 1, createdAt: 1 })
      .sort({ deletedAt: -1, createdAt: -1 })
      .lean();

    res.json({
      deletedTasks: deletedTasks.map((t) => ({
        _id: t._id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate,
        createdAt: t.createdAt,
        deletedAt: t.deletedAt,
        user: {
          _id: t.userId?._id || null,
          name: t.userId?.name || "Unknown",
          email: t.userId?.email || "Unknown",
        },
        deletedBy: {
          _id: t.deletedByUserId?._id || null,
          name: t.deletedByUserId?.name || "Unknown",
          email: t.deletedByUserId?.email || "Unknown",
        },
      })),
      deletedUsers,
    });
  } catch (e) {
    console.error("GET /api/admin/deletions error:", e);
    return res.status(500).json({ msg: "Failed to load deleted items" });
  }
});

router.get("/users-overview", auth, admin, async (req, res) => {
  try {
    const [
      users,
      allTasks,
      journalAgg,
      readingAgg,
      bookmarkAgg,
      contestAgg,
      timetableAgg,
      streakAgg,
      linksDocs,
      cpDocs,
    ] = await Promise.all([
      User.find({})
        .select({
          name: 1,
          email: 1,
          preferences: 1,
          lastSeen: 1,
          createdAt: 1,
          isDeleted: 1,
          deletedAt: 1,
        })
        .sort({ createdAt: -1 })
        .lean(),
      DailyTask.find({}).sort({ createdAt: -1 }).lean(),
      Journal.aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }]),
      ReadingSession.aggregate([
        {
          $group: {
            _id: "$userId",
            count: { $sum: 1 },
            totalSeconds: { $sum: "$duration" },
            latestStart: { $max: "$startTime" },
          },
        },
      ]),
      Bookmark.aggregate([{ $group: { _id: "$user", count: { $sum: 1 } } }]),
      Contest.aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }]),
      Timetable.aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }]),
      Streak.aggregate([
        {
          $group: {
            _id: "$userId",
            activeDays: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
            },
          },
        },
      ]),
      UserLinks.find({}).lean(),
      UserCPConfig.find({}).lean(),
    ]);

    const userById = new Map(users.map((u) => [key(u._id), u]));
    const tasksByUser = new Map();

    allTasks.forEach((task) => {
      const uid = key(task.userId);
      const list = tasksByUser.get(uid) || [];
      const deletedBy = userById.get(key(task.deletedByUserId));
      list.push({
        _id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        reminderTime: task.reminderTime,
        createdAt: task.createdAt,
        isDeleted: !!task.isDeleted,
        deletedAt: task.deletedAt,
        deletedBy: task.deletedByUserId
          ? {
              _id: task.deletedByUserId,
              name: deletedBy?.name || "Unknown",
              email: deletedBy?.email || "Unknown",
            }
          : null,
      });
      tasksByUser.set(uid, list);
    });

    const journalMap = toMap(journalAgg, (x) => x.count || 0);
    const readingMap = toMap(readingAgg, (x) => ({
      count: x.count || 0,
      totalSeconds: x.totalSeconds || 0,
      latestStart: x.latestStart || null,
    }));
    const bookmarkMap = toMap(bookmarkAgg, (x) => x.count || 0);
    const contestMap = toMap(contestAgg, (x) => x.count || 0);
    const timetableMap = toMap(timetableAgg, (x) => x.count || 0);
    const streakMap = toMap(streakAgg, (x) => x.activeDays || 0);
    const linksMap = new Map((linksDocs || []).map((d) => [key(d.userId), d.links || {}]));
    const cpMap = new Map((cpDocs || []).map((d) => [key(d.userId), d]));

    const usersOverview = users.map((user) => {
      const uid = key(user._id);
      const tasks = tasksByUser.get(uid) || [];
      const activeTasks = tasks.filter((t) => !t.isDeleted);
      const deletedTasks = tasks.filter((t) => t.isDeleted);
      const reading = readingMap.get(uid) || {
        count: 0,
        totalSeconds: 0,
        latestStart: null,
      };

      return {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          lastSeen: user.lastSeen,
          preferences: user.preferences || {},
          isDeleted: !!user.isDeleted,
          deletedAt: user.deletedAt || null,
        },
        stats: {
          tasksAdded: tasks.length,
          activeTasks: activeTasks.length,
          deletedTasks: deletedTasks.length,
          journals: journalMap.get(uid) || 0,
          readingSessions: reading.count,
          totalReadingSeconds: reading.totalSeconds,
          latestReadingStart: reading.latestStart,
          bookmarks: bookmarkMap.get(uid) || 0,
          contests: contestMap.get(uid) || 0,
          timetableEntries: timetableMap.get(uid) || 0,
          activeStreakDays: streakMap.get(uid) || 0,
        },
        links: linksMap.get(uid) || {},
        cpConfig: cpMap.get(uid) || null,
        tasks: {
          all: tasks,
          active: activeTasks,
          deleted: deletedTasks,
        },
      };
    });

    return res.json({ usersOverview });
  } catch (e) {
    console.error("GET /api/admin/users-overview error:", e);
    return res.status(500).json({ msg: "Failed to load users overview" });
  }
});

module.exports = router;
