import React, { useContext } from "react";
import { TaskContext } from "../../context/TaskContext";

const TaskList = () => {
  const { tasks, updateTask, deleteTask } = useContext(TaskContext);

  const handleToggle = (task) => {
    updateTask(task._id, {
      status: task.status === "completed" ? "pending" : "completed",
    });
  };

  return (
    <ul className="task-list">
      {tasks.map((task) => {
        const priorityClass = `task-card ${task.priority || "medium"}`;
        const isDone = task.status === "completed";
        return (
          <li key={task._id} className={priorityClass}>
            <div className="task-main">
              <div
                className="task-title"
                style={{ textDecoration: isDone ? "line-through" : "none" }}
              >
                <strong>{task.title}</strong>
                <span className={`pill ${task.priority}`}>{task.priority}</span>
                {task.dueDate && (
                  <span className="muted">
                    {" "}
                    · Due {task.dueDate.slice(0, 10)}
                  </span>
                )}
              </div>
              {task.description && (
                <div className="task-desc muted">{task.description}</div>
              )}
            </div>
            <div className="task-actions">
              <button
                className={`btn-outline ${
                  task.priority === "low"
                    ? "green"
                    : task.priority === "high"
                    ? "red"
                    : "amber"
                }`}
                onClick={() => handleToggle(task)}
              >
                {isDone ? "Undo" : "Complete"}
              </button>
              <button
                className={`btn-outline ${
                  task.priority === "low"
                    ? "green"
                    : task.priority === "high"
                    ? "red"
                    : "amber"
                }`}
                onClick={() => deleteTask(task._id)}
              >
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default TaskList;
