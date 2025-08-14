import React, { useState, useContext } from "react";
import { TaskContext } from "../../context/TaskContext";

const TaskForm = ({ compact = false }) => {
  const { addTask } = useContext(TaskContext);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [reminder, setReminder] = useState("");
  const [description, setDescription] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addTask({
      title: title.trim(),
      priority,
      dueDate,
      reminder,
      description,
    });
    setTitle("");
    setPriority("medium");
    setDueDate("");
    setReminder("");
    setDescription("");
  };

  const quickAdd = async () => {
    if (!title.trim()) return;
    await handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="task-form-wrapper">
      <form onSubmit={handleSubmit} className="task-form" autoComplete="off">
        <div className="quick-row">
          <input
            className="quick-title"
            placeholder="Add a task and press Enter..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !showAdvanced) {
                e.preventDefault();
                quickAdd();
              }
            }}
          />
          <div
            className="priority-radio-group"
            role="radiogroup"
            aria-label="Priority"
          >
            {[
              { key: "low", label: "Low", desc: "Easy / low effort" },
              { key: "medium", label: "Medium", desc: "Moderate effort" },
              { key: "high", label: "High", desc: "Difficult / urgent" },
            ].map((p) => (
              <button
                type="button"
                key={p.key}
                className={`prio-pill ${p.key} ${
                  priority === p.key ? "active" : ""
                }`}
                aria-pressed={priority === p.key}
                onClick={() => setPriority(p.key)}
                title={`${p.label} – ${p.desc}`}
                aria-label={`${p.label} priority: ${p.desc}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn-outline toggle-adv"
            aria-expanded={showAdvanced}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Hide" : "Details"}
          </button>
          <button
            className="btn add-btn"
            type="submit"
            disabled={!title.trim()}
          >
            Add
          </button>
        </div>
        {showAdvanced && (
          <div className="advanced-grid">
            <label>
              <span>Description</span>
              <textarea
                rows={2}
                placeholder="Optional details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label>
              <span>Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>
            <label>
              <span>Reminder</span>
              <input
                type="datetime-local"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
              />
            </label>
          </div>
        )}
        {/* Legend removed per request */}
      </form>
    </div>
  );
};

export default TaskForm;
