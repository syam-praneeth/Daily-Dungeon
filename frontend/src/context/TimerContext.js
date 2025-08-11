import React, { createContext, useState } from "react";
import axios from "../api/axios";

export const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [readingToday, setReadingToday] = useState(0);
  const [sessionsToday, setSessionsToday] = useState([]);
  const [streak, setStreak] = useState([]);

  const fetchToday = async () => {
    const res = await axios.get("/readingSessions/today");
    setReadingToday(res.data.timeSpent || 0);
    setSessionsToday(res.data.sessions || []);
  };

  const createSession = async ({
    sessionName,
    startTime,
    endTime,
    duration,
  }) => {
    await axios.post("/readingSessions", {
      sessionName,
      startTime,
      endTime,
      duration,
    });
    await fetchToday();
    await fetchStreak();
  };

  const fetchStreak = async () => {
    const res = await axios.get("/readingSessions/streak");
    setStreak(res.data || []);
  };

  return (
    <TimerContext.Provider
      value={{
        readingToday,
        sessionsToday,
        streak,
        fetchToday,
        createSession,
        fetchStreak,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};
