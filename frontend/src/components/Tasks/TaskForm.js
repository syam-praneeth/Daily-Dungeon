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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
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
      setShowAdvanced(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAdd = async () => {
    if (!title.trim()) return;
    await handleSubmit({ preventDefault: () => {} });
  };

  const priorityOptions = [
    { key: "low", label: "Low", icon: "🟢", color: "#10B981" },
    { key: "medium", label: "Medium", icon: "🟡", color: "#F59E0B" },
    { key: "high", label: "High", icon: "🔴", color: "#EF4444" },
  ];

  return (
    <div className="dd-task-form">
      <form onSubmit={handleSubmit} autoComplete="off">
        {/* Main Input Row */}
        <div className="dd-task-form-main">
          <div className="dd-task-form-input-wrapper">
            <span className="dd-task-form-icon">✨</span>
            <input
              className="dd-task-form-input"
              placeholder="What do you need to accomplish?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !showAdvanced) {
                  e.preventDefault();
                  quickAdd();
                }
              }}
            />
          </div>

          {/* Priority Pills */}
          <div className="dd-task-form-priority" role="radiogroup" aria-label="Priority">
            {priorityOptions.map((p) => (
              <button
                type="button"
                key={p.key}
                className={`dd-priority-pill ${p.key} ${priority === p.key ? "active" : ""}`}
                aria-pressed={priority === p.key}
                onClick={() => setPriority(p.key)}
                title={`${p.label} priority`}
              >
                <span className="dd-priority-icon">{p.icon}</span>
                <span className="dd-priority-label">{p.label}</span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="dd-task-form-actions">
            <button
              type="button"
              className={`dd-task-form-toggle ${showAdvanced ? "active" : ""}`}
              aria-expanded={showAdvanced}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>{showAdvanced ? "−" : "+"}</span>
              {showAdvanced ? "Less" : "More"}
            </button>
            <button
              className="dd-task-form-submit"
              type="submit"
              disabled={!title.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <span className="dd-task-form-spinner" />
              ) : (
                <>
                  <span>+</span> Add Task
                </>
              )}
            </button>
          </div>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="dd-task-form-advanced">
            <div className="dd-task-form-field">
              <label className="dd-task-form-label">
                <span className="dd-label-icon">📝</span>
                Description
              </label>
              <textarea
                className="dd-task-form-textarea"
                rows={2}
                placeholder="Add more details about this task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="dd-task-form-row">
              <div className="dd-task-form-field">
                <label className="dd-task-form-label">
                  <span className="dd-label-icon">📅</span>
                  Due Date
                </label>
                <input
                  type="date"
                  className="dd-task-form-date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="dd-task-form-field">
                <label className="dd-task-form-label">
                  <span className="dd-label-icon">🔔</span>
                  Reminder
                </label>
                <input
                  type="datetime-local"
                  className="dd-task-form-date"
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </form>

      <style>{`
        .dd-task-form {
          margin-bottom: 20px;
        }

        .dd-task-form-main {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .dd-task-form-input-wrapper {
          flex: 1;
          min-width: 200px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .dd-task-form-icon {
          position: absolute;
          left: 16px;
          font-size: 18px;
          pointer-events: none;
        }

        .dd-task-form-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 14px;
          font-size: 15px;
          font-weight: 500;
          background: var(--dd-bg-card-solid, #FFFFFF);
          color: var(--dd-text-primary, #0F172A);
          transition: all 0.2s ease;
        }

        .dd-task-form-input:focus {
          outline: none;
          border-color: var(--dd-primary-400, #60A5FA);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .dd-task-form-input::placeholder {
          color: var(--dd-text-muted, #64748B);
        }

        .dd-task-form-priority {
          display: flex;
          gap: 6px;
        }

        .dd-priority-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 14px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 10px;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: var(--dd-text-muted, #64748B);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dd-priority-pill:hover {
          border-color: var(--dd-primary-300, #93C5FD);
          transform: translateY(-1px);
        }

        .dd-priority-pill.active.low {
          background: rgba(16, 185, 129, 0.1);
          border-color: #10B981;
          color: #059669;
        }

        .dd-priority-pill.active.medium {
          background: rgba(245, 158, 11, 0.1);
          border-color: #F59E0B;
          color: #D97706;
        }

        .dd-priority-pill.active.high {
          background: rgba(239, 68, 68, 0.1);
          border-color: #EF4444;
          color: #DC2626;
        }

        .dd-priority-icon {
          font-size: 12px;
        }

        .dd-priority-label {
          display: none;
        }

        @media (min-width: 768px) {
          .dd-priority-label {
            display: inline;
          }
        }

        .dd-task-form-actions {
          display: flex;
          gap: 8px;
        }

        .dd-task-form-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 10px;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: var(--dd-text-muted, #64748B);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dd-task-form-toggle:hover {
          border-color: var(--dd-primary-300, #93C5FD);
          color: var(--dd-primary-500, #3B82F6);
        }

        .dd-task-form-toggle.active {
          background: var(--dd-primary-100, #DBEAFE);
          border-color: var(--dd-primary-400, #60A5FA);
          color: var(--dd-primary-600, #2563EB);
        }

        .dd-task-form-toggle span {
          font-size: 16px;
          font-weight: 700;
        }

        .dd-task-form-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--dd-primary-500, #3B82F6), var(--dd-lavender-500, #8B5CF6));
          font-size: 14px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dd-task-form-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .dd-task-form-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dd-task-form-submit span {
          font-size: 18px;
          font-weight: 700;
        }

        .dd-task-form-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: dd-spin 0.8s linear infinite;
        }

        @keyframes dd-spin {
          to { transform: rotate(360deg); }
        }

        .dd-task-form-advanced {
          margin-top: 16px;
          padding: 20px;
          background: var(--dd-bg-secondary, #F1F5F9);
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: dd-slide-down 0.2s ease;
        }

        @keyframes dd-slide-down {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dd-task-form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .dd-task-form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--dd-text-secondary, #475569);
        }

        .dd-label-icon {
          font-size: 14px;
        }

        .dd-task-form-textarea {
          padding: 12px 14px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          background: var(--dd-bg-card-solid, #FFFFFF);
          color: var(--dd-text-primary, #0F172A);
          resize: vertical;
          min-height: 60px;
          transition: all 0.2s ease;
        }

        .dd-task-form-textarea:focus {
          outline: none;
          border-color: var(--dd-primary-400, #60A5FA);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .dd-task-form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }

        .dd-task-form-date {
          padding: 12px 14px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          background: var(--dd-bg-card-solid, #FFFFFF);
          color: var(--dd-text-primary, #0F172A);
          transition: all 0.2s ease;
        }

        .dd-task-form-date:focus {
          outline: none;
          border-color: var(--dd-primary-400, #60A5FA);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        [data-theme="dark"] .dd-task-form-input,
        [data-theme="dark"] .dd-task-form-textarea,
        [data-theme="dark"] .dd-task-form-date {
          background: var(--dd-bg-secondary, #1E293B);
        }

        [data-theme="dark"] .dd-task-form-advanced {
          background: var(--dd-bg-tertiary, #334155);
        }

        @media (max-width: 640px) {
          .dd-task-form-main {
            flex-direction: column;
            align-items: stretch;
          }

          .dd-task-form-priority {
            justify-content: center;
          }

          .dd-task-form-actions {
            justify-content: stretch;
          }

          .dd-task-form-toggle,
          .dd-task-form-submit {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskForm;
