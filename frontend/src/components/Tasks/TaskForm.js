import React, { useState, useContext } from "react";
import { TaskContext } from "../../context/TaskContext";

const TaskForm = () => {
  const { addTask } = useContext(TaskContext);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [reminder, setReminder] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addTask({ title, priority, dueDate, reminder });
    setTitle("");
    setPriority("medium");
    setDueDate("");
    setReminder("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid"
      style={{ gap: 8, marginBottom: 10 }}
    >
      <label>
        <span>Title</span>
        <input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))",
          gap: 8,
        }}
      >
        <label>
          <span>Priority</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
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
      <button className="btn" type="submit">
        Add Task
      </button>
    </form>
  );
};

export default TaskForm;
