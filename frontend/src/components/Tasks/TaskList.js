import React, { useContext, useState } from "react";
import { TaskContext } from "../../context/TaskContext";
import EmptyState from "../ui/EmptyState";

const TaskList = ({ tasksOverride, compact = false }) => {
  const { tasks, updateTask, deleteTask } = useContext(TaskContext);
  const list = tasksOverride || tasks;
  const [filter, setFilter] = useState("all"); // all, pending, completed

  const handleToggle = (task) => {
    updateTask(task._id, {
      status: task.status === "completed" ? "pending" : "completed",
    });
  };

  const filteredTasks = list.filter((task) => {
    if (filter === "pending") return task.status !== "completed";
    if (filter === "completed") return task.status === "completed";
    return true;
  });

  const pendingCount = list.filter((t) => t.status !== "completed").length;
  const completedCount = list.filter((t) => t.status === "completed").length;

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  if (list.length === 0) {
    return (
      <EmptyState
        icon="✨"
        title="No tasks yet"
        description="Add your first task to get started on your productivity journey"
        variant={compact ? "compact" : "default"}
      />
    );
  }

  return (
    <div className="dd-task-list">
      {/* Filter Pills */}
      {!compact && (
        <div className="dd-task-filters">
          <button
            className={`dd-task-filter ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({list.length})
          </button>
          <button
            className={`dd-task-filter ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending ({pendingCount})
          </button>
          <button
            className={`dd-task-filter ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Done ({completedCount})
          </button>
        </div>
      )}

      {/* Task Items */}
      <ul className="dd-task-items">
        {filteredTasks.map((task, index) => {
          const isDone = task.status === "completed";
          const overdue = !isDone && isOverdue(task.dueDate);

          return (
            <li
              key={task._id}
              className={`dd-task-item ${task.priority || "medium"} ${
                isDone ? "completed" : ""
              } ${overdue ? "overdue" : ""}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Checkbox */}
              <button
                className={`dd-task-checkbox ${isDone ? "checked" : ""}`}
                onClick={() => handleToggle(task)}
                aria-label={isDone ? "Mark as pending" : "Mark as complete"}
              >
                {isDone && <span>✓</span>}
              </button>

              {/* Content */}
              <div className="dd-task-content">
                <div className="dd-task-header">
                  <span className={`dd-task-title ${isDone ? "done" : ""}`}>
                    {task.title}
                  </span>
                  <span className="dd-task-priority">
                    {getPriorityIcon(task.priority)}
                  </span>
                </div>

                {task.description && (
                  <p className="dd-task-description">{task.description}</p>
                )}

                <div className="dd-task-meta">
                  {task.dueDate && (
                    <span className={`dd-task-due ${overdue ? "overdue" : ""}`}>
                      📅 {formatDueDate(task.dueDate)}
                    </span>
                  )}
                  {task.reminder && (
                    <span className="dd-task-reminder">
                      🔔 Reminder set
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="dd-task-actions">
                <button
                  className="dd-task-action delete"
                  onClick={() => deleteTask(task._id)}
                  title="Delete task"
                >
                  🗑️
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {filteredTasks.length === 0 && (
        <div className="dd-task-empty-filter">
          <span>No {filter} tasks</span>
        </div>
      )}

      <style>{`
        .dd-task-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dd-task-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .dd-task-filter {
          padding: 8px 14px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 10px;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: var(--dd-text-muted, #64748B);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dd-task-filter:hover {
          border-color: var(--dd-primary-400, #60A5FA);
          color: var(--dd-primary-500, #3B82F6);
        }

        .dd-task-filter.active {
          background: linear-gradient(135deg, var(--dd-primary-500, #3B82F6), var(--dd-lavender-500, #8B5CF6));
          border-color: transparent;
          color: white;
        }

        .dd-task-items {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .dd-task-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px;
          background: var(--dd-bg-card-solid, #FFFFFF);
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 16px;
          transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
          animation: dd-task-fade-in 0.3s ease forwards;
          opacity: 0;
        }

        @keyframes dd-task-fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dd-task-item:hover {
          border-color: var(--dd-primary-300, #93C5FD);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
          transform: translateY(-2px);
        }

        .dd-task-item.high {
          border-left: 4px solid #EF4444;
        }

        .dd-task-item.medium {
          border-left: 4px solid #F59E0B;
        }

        .dd-task-item.low {
          border-left: 4px solid #10B981;
        }

        .dd-task-item.completed {
          opacity: 0.7;
          background: var(--dd-bg-secondary, #F1F5F9);
        }

        .dd-task-item.overdue {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.05), transparent);
        }

        .dd-task-checkbox {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border: 2px solid var(--dd-border-medium, #CBD5E1);
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          transition: all 0.2s ease;
          margin-top: 2px;
        }

        .dd-task-checkbox:hover {
          border-color: var(--dd-primary-500, #3B82F6);
          background: var(--dd-primary-100, #DBEAFE);
        }

        .dd-task-checkbox.checked {
          background: linear-gradient(135deg, #10B981, #34D399);
          border-color: transparent;
        }

        .dd-task-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .dd-task-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dd-task-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--dd-text-primary, #0F172A);
          word-break: break-word;
        }

        .dd-task-title.done {
          text-decoration: line-through;
          color: var(--dd-text-muted, #64748B);
        }

        .dd-task-priority {
          flex-shrink: 0;
          font-size: 12px;
        }

        .dd-task-description {
          margin: 0;
          font-size: 13px;
          color: var(--dd-text-muted, #64748B);
          line-height: 1.5;
        }

        .dd-task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 12px;
          color: var(--dd-text-muted, #64748B);
        }

        .dd-task-due {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .dd-task-due.overdue {
          color: var(--dd-error, #EF4444);
          font-weight: 600;
        }

        .dd-task-reminder {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .dd-task-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .dd-task-item:hover .dd-task-actions {
          opacity: 1;
        }

        .dd-task-action {
          padding: 6px 8px;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          opacity: 0.6;
          transition: all 0.2s ease;
        }

        .dd-task-action:hover {
          opacity: 1;
        }

        .dd-task-action.delete:hover {
          background: var(--dd-error-light, #FEE2E2);
        }

        .dd-task-empty-filter {
          padding: 24px;
          text-align: center;
          color: var(--dd-text-muted, #64748B);
          font-size: 14px;
        }

        [data-theme="dark"] .dd-task-item {
          background: var(--dd-bg-secondary, #1E293B);
          border-color: var(--dd-border-medium, #334155);
        }

        [data-theme="dark"] .dd-task-item.completed {
          background: var(--dd-bg-tertiary, #334155);
        }

        [data-theme="dark"] .dd-task-checkbox:hover {
          background: rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  );
};

export default TaskList;
