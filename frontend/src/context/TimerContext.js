import React, { createContext, useState } from "react";
import axios from "../api/axios";

export const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [readingToday, setReadingToday] = useState(0);
  const [sessionsToday, setSessionsToday] = useState([]);
  const [streak, setStreak] = useState([]);
  const [timerError, setTimerError] = useState("");

  const fetchToday = async () => {
    try {
      const res = await axios.get("/readingSessions/today");
      setReadingToday(res.data.timeSpent || 0);
      setSessionsToday(res.data.sessions || []);
      setTimerError("");
    } catch (e) {
      setTimerError("Unable to load today's reading data.");
    }
  };

  const createSession = async ({
    sessionName,
    startTime,
    endTime,
    duration,
  }) => {
    try {
      await axios.post("/readingSessions", {
        sessionName,
        startTime,
        endTime,
        duration,
      });
      await fetchToday();
      await fetchStreak();
      setTimerError("");
    } catch (e) {
      setTimerError("Failed to save session.");
    }
  };

  const fetchStreak = async () => {
    try {
      const res = await axios.get("/readingSessions/streak");
      setStreak(res.data || []);
      setTimerError("");
    } catch (e) {
      // retry once after short delay on network error
      await new Promise((r) => setTimeout(r, 400));
      try {
        const res2 = await axios.get("/readingSessions/streak");
        setStreak(res2.data || []);
        setTimerError("");
      } catch (e2) {
        setTimerError("Unable to load streak.");
      }
    }
  };

  return (
    <TimerContext.Provider
      value={{
        readingToday,
        sessionsToday,
        streak,
        timerError,
        fetchToday,
        createSession,
        fetchStreak,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};
