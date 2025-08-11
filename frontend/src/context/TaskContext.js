import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "./AuthContext";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [taskError, setTaskError] = useState("");

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/tasks");
      setTasks(res.data);
      setTaskError("");
    } catch (e) {
      setTaskError("Unable to load tasks.");
      setTasks([]);
    }
  };

  const addTask = async (task) => {
    try {
      const res = await axios.post("/tasks", task);
      setTasks([...tasks, res.data]);
      setTaskError("");
    } catch (e) {
      setTaskError("Failed to add task.");
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const res = await axios.put(`/tasks/${id}`, updates);
      setTasks(tasks.map((t) => (t._id === id ? res.data : t)));
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

  return (
    <TaskContext.Provider
      value={{ tasks, addTask, updateTask, deleteTask, taskError }}
    >
      {children}
    </TaskContext.Provider>
  );
};
