import React, { useContext, useMemo, useState } from "react";
import { TaskContext } from "../context/TaskContext";
import debounce from "lodash.debounce";

const TasksPage = () => {
  const { tasks, addTask, updateTask, deleteTask } = useContext(TaskContext);
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    reminderTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSearch = useMemo(() => debounce((v) => setQuery(v), 300), []);

  const filtered = tasks.filter((t) => {
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q);
    const matchP = !priorityFilter || t.priority === priorityFilter;
    return matchQ && matchP;
  });

  const pending = filtered.filter((t) => t.status !== "completed");
  const completed = filtered.filter((t) => t.status === "completed");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await addTask({ ...form });
      setForm({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        reminderTime: "",
      });
    } catch (err) {
      setError("Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Daily Tasks</h2>
      <div className="card">
        <form onSubmit={submit} className="grid">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <label>
            Due Date
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </label>
          <label>
            Reminder
            <input
              type="datetime-local"
              value={form.reminderTime}
              onChange={(e) =>
                setForm({ ...form, reminderTime: e.target.value })
              }
            />
          </label>
          <button disabled={loading} type="submit">
            {loading ? "Adding..." : "Add Task"}
          </button>
          {error && <div className="error">{error}</div>}
        </form>
      </div>

      <div className="toolbar">
        <input
          placeholder="Search"
          onChange={(e) => onSearch(e.target.value)}
        />
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Pending</h3>
          <ul>
            {pending.map((t) => (
              <li key={t._id}>
                <div>
                  <span className={`pill ${t.priority.toLowerCase()}`}>
                    {t.priority}
                  </span>
                  <strong>{t.title}</strong>
                  {t.dueDate && (
                    <span className="muted"> due {t.dueDate.slice(0, 10)}</span>
                  )}
                </div>
                <div className="row">
                  <button
                    onClick={() => updateTask(t._id, { status: "completed" })}
                  >
                    Complete
                  </button>
                  <button className="danger" onClick={() => deleteTask(t._id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>Completed</h3>
          <ul>
            {completed.map((t) => (
              <li key={t._id}>
                <div>
                  <span className={`pill ${t.priority.toLowerCase()}`}>
                    {t.priority}
                  </span>{" "}
                  <s>{t.title}</s>
                </div>
                <button
                  onClick={() => updateTask(t._id, { status: "pending" })}
                >
                  Undo
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
