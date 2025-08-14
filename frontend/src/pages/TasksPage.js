import React, { useContext, useMemo, useState } from "react";
import { TaskContext } from "../context/TaskContext";
import debounce from "lodash.debounce";
import TaskForm from "../components/Tasks/TaskForm";
import TaskList from "../components/Tasks/TaskList";
import { Card, CardBody, CardHeader, CardMenu } from "../components/ui/Card";
import "../components/Dashboard/dashboard-grid.css";

const TasksPage = () => {
  const { tasks, addTask, updateTask, deleteTask, taskError } =
    useContext(TaskContext);
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
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
        priority: "medium",
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
    <div style={{ maxWidth: 1280, margin: "16px auto", overflow: "hidden" }}>
      <div className="dd-grid">
        <Card className="col-span-12 sm:col-span-12 dd-card--blue">
          <CardHeader title="Task Creation" actions={<CardMenu />} />
          <CardBody>
            <TaskForm />
            {error && (
              <div className="error" style={{ marginTop: 6 }}>
                {error}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="col-span-4 lg:col-span-4 sm:col-span-12 dd-card--slate">
          <CardHeader title="Filters" actions={<CardMenu />} />
          <CardBody>
            <div className="grid" style={{ gap: 8 }}>
              <input
                placeholder="Search tasks"
                onChange={(e) => onSearch(e.target.value)}
              />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              {taskError && <div className="error">{taskError}</div>}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
              Showing {filtered.length} / {tasks.length} tasks
            </div>
          </CardBody>
        </Card>

        <Card className="col-span-8 lg:col-span-8 sm:col-span-12 dd-card--emerald">
          <CardHeader title="Pending" actions={<CardMenu />} />
          <CardBody>
            {pending.length ? (
              <TaskList tasksOverride={pending} />
            ) : (
              <div style={{ fontSize: 14 }}>No pending tasks.</div>
            )}
          </CardBody>
        </Card>

        <Card className="col-span-12 sm:col-span-12 dd-card--rose">
          <CardHeader title="Completed" actions={<CardMenu />} />
          <CardBody>
            {completed.length ? (
              <TaskList tasksOverride={completed} />
            ) : (
              <div style={{ fontSize: 14 }}>No completed tasks yet.</div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default TasksPage;
