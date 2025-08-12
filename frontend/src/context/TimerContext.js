import React, { createContext, useEffect, useRef, useState } from "react";
import axios from "../api/axios";

export const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [readingToday, setReadingToday] = useState(0);
  const [sessionsToday, setSessionsToday] = useState([]);
  const [streak, setStreak] = useState([]);
  const [timerError, setTimerError] = useState("");
  // Live timer state (persists across routes)
  const [mode, setMode] = useState("stopwatch"); // 'stopwatch' | 'timer'
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState(null); // ISO string
  const [seconds, setSeconds] = useState(0); // stopwatch elapsed
  const [remaining, setRemaining] = useState(0); // countdown remaining
  const [timerTotal, setTimerTotal] = useState(0); // countdown total
  const [sessionName, setSessionName] = useState("");
  const intervalRef = useRef(null);

  const persist = () => {
    try {
      localStorage.setItem(
        "timerState",
        JSON.stringify({
          mode,
          running,
          startedAt,
          seconds,
          remaining,
          timerTotal,
          sessionName,
        })
      );
    } catch {}
  };

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

  const deleteSession = async (id) => {
    try {
      await axios.delete(`/readingSessions/${id}`);
      await fetchToday();
      await fetchStreak();
      setTimerError("");
    } catch (e) {
      setTimerError("Failed to delete session.");
    }
  };

  // Timer controls
  const startStopwatch = () => {
    if (running) return;
    const now = new Date();
    setMode("stopwatch");
    setStartedAt(now.toISOString());
    setSeconds(0);
    setRunning(true);
  };

  const startTimer = (minutes) => {
    if (running) return;
    const total = Math.floor(Number(minutes || 0) * 60);
    if (!total || total < 1) {
      setTimerError("Enter timer minutes > 0");
      return;
    }
    const now = new Date();
    setMode("timer");
    setStartedAt(now.toISOString());
    setTimerTotal(total);
    setRemaining(total);
    setRunning(true);
  };

  const stopTimer = async () => {
    if (!running) return;
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const end = new Date();
    let duration = 0;
    if (mode === "stopwatch") {
      // recompute elapsed based on startedAt to avoid drift
      const start = new Date(startedAt || end);
      duration = Math.max(0, Math.floor((end - start) / 1000));
    } else {
      duration = Math.max(0, timerTotal - remaining);
    }
    try {
      if (duration > 0) {
        await createSession({
          sessionName: sessionName?.trim() || "Reading",
          startTime:
            startedAt || new Date(Date.now() - duration * 1000).toISOString(),
          endTime: end.toISOString(),
          duration,
        });
      }
    } finally {
      // reset running counters but keep last values in state for UI
      setSeconds(0);
      setRemaining(0);
      setTimerTotal(0);
      setStartedAt(null);
      persist();
    }
  };

  // Tick while running
  useEffect(() => {
    if (!running) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (mode === "stopwatch") {
        const start = new Date(startedAt || Date.now());
        const now = new Date();
        setSeconds(Math.max(0, Math.floor((now - start) / 1000)));
      } else {
        setRemaining((r) => {
          const next = r - 1;
          if (next <= 0) {
            // Auto-finish
            clearInterval(intervalRef.current);
            setRunning(false);
            const end = new Date();
            const duration = timerTotal;
            createSession({
              sessionName: sessionName?.trim() || "Reading",
              startTime:
                startedAt ||
                new Date(end.getTime() - duration * 1000).toISOString(),
              endTime: end.toISOString(),
              duration,
            }).finally(() => {
              setRemaining(0);
              setTimerTotal(0);
              setStartedAt(null);
              persist();
            });
            return 0;
          }
          return next;
        });
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, mode, startedAt, timerTotal, sessionName]);

  // Persist snapshot on changes
  useEffect(() => {
    persist();
  }, [mode, running, startedAt, seconds, remaining, timerTotal, sessionName]);

  // Restore from localStorage (and reconcile time)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("timerState");
      if (!raw) return;
      const s = JSON.parse(raw);
      setMode(s.mode || "stopwatch");
      setSessionName(s.sessionName || "");
      setTimerTotal(s.timerTotal || 0);
      const now = new Date();
      if (s.startedAt && s.running) {
        setStartedAt(s.startedAt);
        setRunning(true);
        if (s.mode === "stopwatch") {
          const start = new Date(s.startedAt);
          setSeconds(Math.max(0, Math.floor((now - start) / 1000)));
        } else {
          const start = new Date(s.startedAt);
          const elapsed = Math.max(0, Math.floor((now - start) / 1000));
          const rem = Math.max(0, (s.timerTotal || 0) - elapsed);
          setRemaining(rem);
          if (rem === 0) {
            setRunning(false);
          }
        }
      } else {
        setRunning(false);
        setStartedAt(null);
        setSeconds(0);
        setRemaining(0);
      }
    } catch {}
  }, []);

  // Allow switching mode safely when not running
  const setTimerMode = (m) => {
    if (running) return;
    setMode(m === "timer" ? "timer" : "stopwatch");
    setSeconds(0);
    setRemaining(0);
    setTimerTotal(0);
    persist();
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
        deleteSession,
        // exposed live timer state
        mode,
        running,
        startedAt,
        seconds,
        remaining,
        timerTotal,
        sessionName,
        setSessionName,
        setTimerMode,
        startStopwatch,
        startTimer,
        stopTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};
