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

  // Unique previous session names for suggestions (exclude empty)
  const suggestions = Array.from(
    new Set(
      (sessionsToday || [])
        .map((s) => (s.sessionName || "Reading").trim())
        .filter(Boolean)
    )
  ).slice(0, 12);

  const presetMinutes = [5, 10, 15, 20, 25, 30, 45, 60];

  return (
    <div className="timer-panel">
      <div className="segmented" role="tablist" aria-label="Timer mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "stopwatch"}
          disabled={running || paused}
          onClick={() => setTimerMode("stopwatch")}
        >
          Stopwatch
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "timer"}
          disabled={running || paused}
          onClick={() => setTimerMode("timer")}
        >
          Countdown
        </button>
      </div>

      <div className="timer-fields">
        <label className="timer-field">
          <span className="tf-label">Session name</span>
          <input
            list="session-suggestions"
            placeholder="e.g. Biology, Novel"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
          <datalist id="session-suggestions">
            {suggestions.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </label>
        {mode === "stopwatch" ? (
          <label className="timer-field small">
            <span className="tf-label">Goal (min, optional)</span>
            <input
              type="number"
              min="0"
              value={goalMin}
              onChange={(e) => setGoalMin(e.target.value)}
              placeholder="—"
            />
          </label>
        ) : (
          <label className="timer-field small">
            <span className="tf-label">Minutes</span>
            <input
              type="number"
              min="1"
              value={timerMin}
              onChange={(e) => setTimerMin(e.target.value)}
              placeholder="25"
            />
          </label>
        )}
        <div className="timer-actions">
          {!running && !paused && (
            <button
              className="btn"
              onClick={start}
              disabled={mode === "timer" && !(Number(timerMin) > 0)}
            >
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
                Save & Reset
              </button>
            </>
          )}
        </div>
      </div>

      {mode === "timer" && !running && !paused && (
        <div className="chips" aria-label="Quick minute presets">
          {presetMinutes.map((m) => (
            <button
              key={m}
              type="button"
              className={`chip ${Number(timerMin) === m ? "active" : ""}`}
              onClick={() => setTimerMin(String(m))}
            >
              {m}m
            </button>
          ))}
        </div>
      )}

      <div className="timer-visuals">
        <div className="circle-wrap">
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
        </div>
        <div className="timer-stats">
          <div className="stat-row">
            <span className="label">Mode</span>
            <span className="value">{mode}</span>
          </div>
          <div className="stat-row">
            <span className="label">Today</span>
            <span className="value">
              {Math.floor(readingToday / 60)}m {readingToday % 60}s
            </span>
          </div>
          <div className="stat-row">
            <span className="label">Elapsed</span>
            <span className="value">{displayCurrentMMSS()}</span>
          </div>
          {mode === "stopwatch" && Number(goalMin) > 0 && (
            <div className="progress-bar" aria-label="Goal progress">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(100, progress * 100)}%` }}
              ></div>
            </div>
          )}
          {mode === "timer" && timerTotal > 0 && (
            <div className="progress-bar" aria-label="Timer remaining">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(100, progress * 100)}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {sortedSessions?.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <strong style={{ fontSize: 14 }}>Today's sessions</strong>
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
