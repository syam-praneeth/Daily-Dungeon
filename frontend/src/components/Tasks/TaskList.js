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
    <ul className="list">
      {tasks.map((task) => (
        <li
          key={task._id}
          className="item"
          style={{ justifyContent: "space-between" }}
        >
          <div
            style={{
              textDecoration:
                task.status === "completed" ? "line-through" : "none",
            }}
          >
            <span>{task.title} </span>
            <span className={`pill ${task.priority}`}>{task.priority}</span>
            {task.dueDate && (
              <span className="muted"> · Due {task.dueDate.slice(0, 10)}</span>
            )}
          </div>
          <div className="row">
            <button
              className="btn-secondary"
              onClick={() => handleToggle(task)}
            >
              {task.status === "completed" ? "Undo" : "Complete"}
            </button>
            <button className="btn-danger" onClick={() => deleteTask(task._id)}>
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
