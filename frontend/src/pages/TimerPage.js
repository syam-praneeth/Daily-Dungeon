import React, { useContext } from "react";
import Timer from "../components/ReadingTimer/Timer";
import TaskForm from "../components/Tasks/TaskForm";
import TaskList from "../components/Tasks/TaskList";
import { TaskContext } from "../context/TaskContext";

const TimerPage = () => {
  const { tasks } = useContext(TaskContext);
  return (
    <div className="container">
      <h2>Reading Timer</h2>
      <div className="soft-section accent-emerald" style={{ marginBottom: 20 }}>
        <Timer />
      </div>
      <div className="soft-section accent-blue" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Quick Tasks</h3>
        <TaskForm compact />
        <TaskList tasksOverride={tasks} />
      </div>
    </div>
  );
};

export default TimerPage;
