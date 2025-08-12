import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import axios from "../api/axios";
import { AuthContext } from "./AuthContext";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [taskError, setTaskError] = useState("");
  const notifiedRef = useRef(null);

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  // Request notification permission once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    try {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    } catch {}
  }, []);

  // Initialize notified map from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("dd_task_notifications");
      notifiedRef.current = raw ? JSON.parse(raw) : {};
    } catch {
      notifiedRef.current = {};
    }
  }, []);

  const saveNotified = () => {
    try {
      localStorage.setItem(
        "dd_task_notifications",
        JSON.stringify(notifiedRef.current || {})
      );
    } catch {}
  };

  const markNotified = (key) => {
    if (!notifiedRef.current) notifiedRef.current = {};
    notifiedRef.current[key] = true;
    saveNotified();
  };

  const wasNotified = (key) =>
    !!(notifiedRef.current && notifiedRef.current[key]);

  const normalizeTask = (t) => {
    const priority = (t.priority || "medium").toString().toLowerCase();
    // support both reminder and reminderTime
    const reminder = t.reminder || t.reminderTime || "";
    return { ...t, priority, reminder };
  };

  const toBackendPriority = (p) => {
    const v = (p || "medium").toString().toLowerCase();
    if (v === "high") return "High";
    if (v === "low") return "Low";
    return "Medium";
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/tasks");
      const normalized = (res.data || []).map(normalizeTask);
      setTasks(normalized);
      setTaskError("");
    } catch (e) {
      setTaskError("Unable to load tasks.");
      setTasks([]);
    }
  };

  const addTask = async (task) => {
    try {
      const payload = {
        ...task,
        // send enum casing expected by backend
        priority: toBackendPriority(task.priority),
      };
      // normalize reminder field name for backend compatibility
      if (!payload.reminderTime && payload.reminder) {
        payload.reminderTime = payload.reminder;
      }
      const res = await axios.post("/tasks", payload);
      setTasks([...tasks, normalizeTask(res.data)]);
      setTaskError("");
    } catch (e) {
      setTaskError("Failed to add task.");
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const payload = { ...updates };
      if (Object.prototype.hasOwnProperty.call(payload, "priority")) {
        payload.priority = toBackendPriority(payload.priority);
      }
      if (!payload.reminderTime && payload.reminder) {
        payload.reminderTime = payload.reminder;
      }
      const res = await axios.put(`/tasks/${id}`, payload);
      setTasks(tasks.map((t) => (t._id === id ? normalizeTask(res.data) : t)));
      setTaskError("");
    } catch (e) {
      setTaskError("Failed to update task.");
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
      setTaskError("");
    } catch (e) {
      setTaskError("Failed to delete task.");
    }
  };

  // Notification helpers
  const notify = (title, options) => {
    try {
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;
      new Notification(title, options);
    } catch {
      // no-op fallback
    }
  };

  const parseISTDateOnlyAt = (dateStr, hour = 9, minute = 0) => {
    // dateStr in YYYY-MM-DD, interpret as IST at given time
    // Construct ISO with +05:30
    const h = String(hour).padStart(2, "0");
    const m = String(minute).padStart(2, "0");
    return new Date(`${dateStr}T${h}:${m}:00+05:30`);
  };

  const parseISTDateTimeLocal = (dtLocalStr) => {
    // "YYYY-MM-DDTHH:mm" -> treat as IST
    return new Date(`${dtLocalStr}:00+05:30`);
  };

  // Periodic check for upcoming and due tasks
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;
    let timerId;
    const tick = () => {
      const now = new Date();
      tasks.forEach((t) => {
        if (!t || t.status === "completed") return;
        const baseKey = t._id || t.id || `${t.title}-${t.dueDate || ""}`;

        // Reminder at exact time
        if (t.reminder) {
          const rTime = parseISTDateTimeLocal(t.reminder);
          if (now >= rTime && !wasNotified(`${baseKey}:reminder`)) {
            notify("Task Reminder", {
              body: `${t.title}`,
            });
            markNotified(`${baseKey}:reminder`);
          }
        }

        // Due today at 09:00 IST notification
        if (t.dueDate) {
          const due9 = parseISTDateOnlyAt(t.dueDate, 9, 0);
          if (now >= due9 && !wasNotified(`${baseKey}:due`)) {
            notify("Due Today", { body: `${t.title} is due today` });
            markNotified(`${baseKey}:due`);
          }
          // Approaching: 24 hours before due 09:00 IST
          const soonAt = new Date(due9.getTime() - 24 * 60 * 60 * 1000);
          if (now >= soonAt && now < due9 && !wasNotified(`${baseKey}:soon`)) {
            notify("Upcoming Task", { body: `${t.title} is due tomorrow` });
            markNotified(`${baseKey}:soon`);
          }
        }
      });
    };
    // initial check quickly, then every minute
    tick();
    timerId = setInterval(tick, 60 * 1000);
    return () => clearInterval(timerId);
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{ tasks, addTask, updateTask, deleteTask, taskError }}
    >
      {children}
    </TaskContext.Provider>
  );
};
