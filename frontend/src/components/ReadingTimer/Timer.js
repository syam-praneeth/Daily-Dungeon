import React, { useState, useContext, useMemo } from "react";
import { TimerContext } from "../../context/TimerContext";

const Timer = () => {
  const {
    // data
    sessionsToday,
    readingToday,
    deleteSession,
    // live timer state
    mode,
    running,
    paused,
    seconds,
    remaining,
    timerTotal,
    sessionName,
    setSessionName,
    // actions
    startStopwatch,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    setTimerMode,
  } = useContext(TimerContext);
  const [goalMin, setGoalMin] = useState(""); // optional for stopwatch progress
  const [timerMin, setTimerMin] = useState(""); // input for countdown minutes
  const tz = "Asia/Kolkata";

  const start = () => {
    if (mode === "stopwatch") startStopwatch();
    else startTimer(timerMin);
  };
  const stop = () => stopTimer();

  const fmtTime = (d) =>
    new Date(d).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: tz,
    });

  const sortedSessions = useMemo(() => {
    return [...(sessionsToday || [])].sort(
      (a, b) => new Date(b.startTime) - new Date(a.startTime)
    );
  }, [sessionsToday]);

  // Circle progress
  const R = 60;
  const C = 2 * Math.PI * R;
  const getProgress = () => {
    if (mode === "stopwatch") {
      const goal = Math.max(0, Math.floor(Number(goalMin || 0) * 60));
      if (goal > 0) {
        return Math.min(1, seconds / goal);
      }
      // fallback: per-minute loop if no goal
      return (seconds % 60) / 60;
    }
    // timer
    if (!timerTotal) return 0;
    return Math.max(0, Math.min(1, remaining / timerTotal));
  };
  const progress = getProgress();
  const dashOffset = C * (1 - progress);
  const displayMMSS = () => {
    const s = mode === "stopwatch" ? seconds : remaining;
    const mm = Math.floor(s / 60);
    const ss = ("0" + (s % 60)).slice(-2);
    return `${mm}:${ss}`;
  };
  const displayCurrentMMSS = () => {
    let s;
    if (mode === "stopwatch") s = seconds;
    else s = Math.max(0, (timerTotal || 0) - (remaining || 0));
    const mm = Math.floor(s / 60);
    const ss = ("0" + (s % 60)).slice(-2);
    return `${mm}:${ss}`;
  };

  return (
    <div>
      {/* Mode toggle */}
      <div className="row" style={{ marginBottom: 8 }}>
        <button
          className="btn-secondary"
          disabled={running}
          onClick={() => setTimerMode("stopwatch")}
          aria-pressed={mode === "stopwatch"}
        >
          Stopwatch
        </button>
        <button
          className="btn-secondary"
          disabled={running}
          onClick={() => setTimerMode("timer")}
          aria-pressed={mode === "timer"}
        >
          Timer
        </button>
      </div>
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
        {mode === "stopwatch" ? (
          <input
            type="number"
            min="0"
            placeholder="Goal (min, optional)"
            value={goalMin}
            onChange={(e) => setGoalMin(e.target.value)}
            style={{ width: 160, padding: 8 }}
          />
        ) : (
          <input
            type="number"
            min="1"
            placeholder="Timer (min)"
            value={timerMin}
            onChange={(e) => setTimerMin(e.target.value)}
            style={{ width: 140, padding: 8 }}
          />
        )}
        {!running && !paused && (
          <button className="btn" onClick={start}>
            Start
          </button>
        )}
        {running && (
          <>
            <button className="btn" onClick={pauseTimer}>
              Pause
            </button>
            <button className="btn" onClick={stop}>
              Stop
            </button>
          </>
        )}
        {!running && paused && (
          <>
            <button className="btn" onClick={resumeTimer}>
              Resume
            </button>
            <button className="btn" onClick={stop}>
              Stop
            </button>
          </>
        )}
      </div>
      {/* Circular clock */}
      <div
        className="row"
        style={{ gap: 16, alignItems: "center", marginBottom: 8 }}
      >
        <svg width="160" height="160" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <g transform="translate(80,80)">
            <circle r={60} fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle
              r={60}
              fill="none"
              stroke="url(#grad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={dashOffset}
              transform="rotate(-90)"
            />
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="24"
              fill="#111827"
            >
              {displayMMSS()}
            </text>
          </g>
        </svg>
        <div style={{ color: "#666" }}>
          Mode: <strong>{mode}</strong>
          <div style={{ marginTop: 6 }}>
            Today: {Math.floor(readingToday / 60)}m {readingToday % 60}s
          </div>
          <div style={{ marginTop: 4 }}>Current: {displayCurrentMMSS()}</div>
        </div>
      </div>
      {sortedSessions?.length > 0 && (
        <div className="card" style={{ marginTop: 8 }}>
          <strong>Today's sessions</strong>
          <table className="table" style={{ marginTop: 6 }}>
            <thead>
              <tr>
                <th>Session</th>
                <th>Start (IST)</th>
                <th>End (IST)</th>
                <th className="text-right">Duration</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedSessions.map((s) => (
                <tr key={s._id}>
                  <td>{s.sessionName || "Reading"}</td>
                  <td>{fmtTime(s.startTime)}</td>
                  <td>{fmtTime(s.endTime)}</td>
                  <td className="text-right">
                    {Math.round((s.duration || 0) / 60)}m
                  </td>
                  <td className="text-right">
                    <button
                      className="btn-outline red"
                      onClick={() => deleteSession(s._id)}
                      title="Delete session"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Timer;
