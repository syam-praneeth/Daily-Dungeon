import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "./AuthContext";

export const JournalContext = createContext();

export const JournalProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [journals, setJournals] = useState([]);
  const [journalError, setJournalError] = useState("");

  useEffect(() => {
    if (token) fetchJournals();
  }, [token]);

  const fetchJournals = async () => {
    try {
      const res = await axios.get("/journals");
      setJournals(res.data);
      setJournalError("");
    } catch (e) {
      setJournalError("Unable to load journals.");
      setJournals([]);
    }
  };

  const addJournal = async (journal) => {
    try {
      const payload = {
        ...journal,
        // ensure ISO string so backend Date parsing is consistent (IST chosen date @ 00:00 local becomes same calendar day)
        date: new Date(journal.date).toISOString(),
      };
      const res = await axios.post("/journals", payload);
      setJournals([res.data, ...journals]);
      setJournalError("");
    } catch (e) {
      setJournalError("Failed to add journal.");
    }
  };

  const updateJournal = async (id, updates) => {
    try {
      const res = await axios.put(`/journals/${id}`, updates);
      setJournals(journals.map((j) => (j._id === id ? res.data : j)));
      setJournalError("");
    } catch (e) {
      setJournalError("Failed to update journal.");
    }
  };

  const deleteJournal = async (id) => {
    try {
      await axios.delete(`/journals/${id}`);
      setJournals(journals.filter((j) => j._id !== id));
      setJournalError("");
    } catch (e) {
      setJournalError("Failed to delete journal.");
    }
  };

  return (
    <JournalContext.Provider
      value={{
        journals,
        addJournal,
        updateJournal,
        deleteJournal,
        journalError,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};
