import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "./AuthContext";

export const TimetableContext = createContext();

export const TimetableProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (token) fetchEntries();
  }, [token]);

  const fetchEntries = async () => {
    const res = await axios.get("/timetable");
    setEntries(res.data);
  };

  const addEntry = async (entry) => {
    const res = await axios.post("/timetable", entry);
    setEntries([...entries, res.data]);
  };

  const updateEntry = async (id, updates) => {
    const res = await axios.put(`/timetable/${id}`, updates);
    setEntries(entries.map((e) => (e._id === id ? res.data : e)));
  };

  const deleteEntry = async (id) => {
    await axios.delete(`/timetable/${id}`);
    setEntries(entries.filter((e) => e._id !== id));
  };

  return (
    <TimetableContext.Provider
      value={{ entries, addEntry, updateEntry, deleteEntry }}
    >
      {children}
    </TimetableContext.Provider>
  );
};
