import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "./AuthContext";

export const TimetableContext = createContext();

export const TimetableProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [entries, setEntries] = useState([]);
  const [timetableError, setTimetableError] = useState("");

  useEffect(() => {
    if (token) fetchEntries();
  }, [token]);

  const fetchEntries = async () => {
    try {
      const res = await axios.get("/timetable");
      setEntries(res.data);
      setTimetableError("");
    } catch (e) {
      setTimetableError("Unable to load timetable.");
      setEntries([]);
    }
  };

  const addEntry = async (entry) => {
    try {
      const res = await axios.post("/timetable", entry);
      setEntries([...entries, res.data]);
      setTimetableError("");
    } catch (e) {
      setTimetableError("Failed to add timetable entry.");
    }
  };

  const updateEntry = async (id, updates) => {
    try {
      const res = await axios.put(`/timetable/${id}`, updates);
      setEntries(entries.map((e) => (e._id === id ? res.data : e)));
      setTimetableError("");
    } catch (e) {
      setTimetableError("Failed to update entry.");
    }
  };

  const deleteEntry = async (id) => {
    try {
      await axios.delete(`/timetable/${id}`);
      setEntries(entries.filter((e) => e._id !== id));
      setTimetableError("");
    } catch (e) {
      setTimetableError("Failed to delete entry.");
    }
  };

  return (
    <TimetableContext.Provider
      value={{ entries, addEntry, updateEntry, deleteEntry, timetableError }}
    >
      {children}
    </TimetableContext.Provider>
  );
};
