import React, { useState, useContext, useRef } from "react";
import { TimerContext } from "../../context/TimerContext";

const Timer = () => {
  const { createSession, fetchToday, sessionsToday, readingToday } =
    useContext(TimerContext);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessionName, setSessionName] = useState("");
  const [startedAt, setStartedAt] = useState(null);
  const intervalRef = useRef(null);

  const start = () => {
    if (running) return;
    setStartedAt(new Date());
    setRunning(true);
    intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const stop = async () => {
    if (!running) return;
    setRunning(false);
    clearInterval(intervalRef.current);
    const end = new Date();
    const payload = {
      sessionName: sessionName?.trim() || "Reading",
      startTime:
        startedAt?.toISOString() ||
        new Date(Date.now() - seconds * 1000).toISOString(),
      endTime: end.toISOString(),
      duration: seconds,
    };
    await createSession(payload);
    setSeconds(0);
    setSessionName("");
    setStartedAt(null);
    fetchToday();
  };

  return (
    <div>
      <div
        className="row"
        style={{ gap: 8, alignItems: "center", marginBottom: 8 }}
      >
        <input
          placeholder="Session name (e.g., Biology, Novel)"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        {!running ? (
          <button className="btn" onClick={start}>
            Start
          </button>
        ) : (
          <button className="btn" onClick={stop}>
            Stop
          </button>
        )}
      </div>
      <div style={{ fontSize: 24, marginBottom: 8 }}>
        {Math.floor(seconds / 60)}:{("0" + (seconds % 60)).slice(-2)}
      </div>
      <div style={{ color: "#666", marginBottom: 8 }}>
        Today: {Math.floor(readingToday / 60)}m {readingToday % 60}s
      </div>
      {sessionsToday?.length > 0 && (
        <div className="card" style={{ marginTop: 8 }}>
          <strong>Today\'s sessions</strong>
          <ul style={{ marginTop: 6 }}>
            {sessionsToday.map((s) => (
              <li key={s._id}>
                {s.sessionName || "Reading"} ·{" "}
                {new Date(s.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                -{" "}
                {new Date(s.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · {Math.round((s.duration || 0) / 60)}m
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Timer;
