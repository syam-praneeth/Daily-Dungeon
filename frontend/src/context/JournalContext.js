import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "./AuthContext";

export const JournalContext = createContext();

export const JournalProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    if (token) fetchJournals();
  }, [token]);

  const fetchJournals = async () => {
    const res = await axios.get("/journals");
    setJournals(res.data);
  };

  const addJournal = async (journal) => {
    const res = await axios.post("/journals", journal);
    setJournals([res.data, ...journals]);
  };

  const updateJournal = async (id, updates) => {
    const res = await axios.put(`/journals/${id}`, updates);
    setJournals(journals.map((j) => (j._id === id ? res.data : j)));
  };

  const deleteJournal = async (id) => {
    await axios.delete(`/journals/${id}`);
    setJournals(journals.filter((j) => j._id !== id));
  };

  return (
    <JournalContext.Provider
      value={{ journals, addJournal, updateJournal, deleteJournal }}
    >
      {children}
    </JournalContext.Provider>
  );
};
