import React, { useState, useContext, useMemo } from "react";
import { TimerContext } from "../../context/TimerContext";
import Select from "../ui/Select";
import DurationPicker from "../ui/DurationPicker";
import EmptyState from "../ui/EmptyState";

const Timer = () => {
  const {
    sessionsToday,
    readingToday,
    deleteSession,
    mode,
    running,
    paused,
    seconds,
    remaining,
    timerTotal,
    sessionName,
    setSessionName,
    startStopwatch,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    setTimerMode,
  } = useContext(TimerContext);

  const [goalMin, setGoalMin] = useState(30);
  const [timerMin, setTimerMin] = useState(25);
  const [showSessions, setShowSessions] = useState(false);
  const tz = "Asia/Kolkata";

  const start = () => {
    if (mode === "stopwatch") startStopwatch();
    else startTimer(timerMin);
  };

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

  // Unique previous session names for suggestions
  const sessionOptions = useMemo(() => {
    const names = Array.from(
      new Set(
        (sessionsToday || [])
          .map((s) => (s.sessionName || "").trim())
          .filter(Boolean)
      )
    );
    const predefined = ["Reading", "Studying", "Working", "Coding", "Exercise", "Meditation"];
    const all = [...new Set([...names, ...predefined])];
    return all.map((name) => ({ value: name, label: name }));
  }, [sessionsToday]);

  // Circle progress
  const R = 70;
  const C = 2 * Math.PI * R;
  const getProgress = () => {
    if (mode === "stopwatch") {
      const goal = Math.max(0, goalMin * 60);
      if (goal > 0) return Math.min(1, seconds / goal);
      return (seconds % 60) / 60;
    }
    if (!timerTotal) return 0;
    return Math.max(0, Math.min(1, remaining / timerTotal));
  };
  const progress = getProgress();
  const dashOffset = C * (1 - progress);

  const displayTime = () => {
    const s = mode === "stopwatch" ? seconds : remaining;
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const formatTotalTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const isActive = running || paused;

  return (
    <div className="dd-timer">
      {/* Mode Tabs */}
      <div className="dd-timer-modes">
        <button
          type="button"
          className={`dd-timer-mode ${mode === "stopwatch" ? "active" : ""}`}
          disabled={isActive}
          onClick={() => setTimerMode("stopwatch")}
        >
          <span className="dd-timer-mode-icon">⏱️</span>
          <span>Stopwatch</span>
        </button>
        <button
          type="button"
          className={`dd-timer-mode ${mode === "timer" ? "active" : ""}`}
          disabled={isActive}
          onClick={() => setTimerMode("timer")}
        >
          <span className="dd-timer-mode-icon">⏳</span>
          <span>Countdown</span>
        </button>
      </div>

      <div className="dd-timer-main">
        {/* Timer Display */}
        <div className="dd-timer-display">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="timer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E3A8A">
                  <animate
                    attributeName="stop-color"
                    values="#1E3A8A;#3B82F6;#8B5CF6;#3B82F6;#1E3A8A"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="100%" stopColor="#8B5CF6">
                  <animate
                    attributeName="stop-color"
                    values="#8B5CF6;#C084FC;#F59E0B;#C084FC;#8B5CF6"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </stop>
              </linearGradient>
              <filter id="timer-glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke="var(--dd-bg-tertiary, #E2E8F0)"
              strokeWidth="8"
            />
            <circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke="url(#timer-grad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 100 100)"
              filter={running ? "url(#timer-glow)" : undefined}
              style={{ transition: "stroke-dashoffset 0.3s ease" }}
            />
          </svg>
          <div className="dd-timer-time">
            <span className="dd-timer-digits">{displayTime()}</span>
            <span className="dd-timer-label">
              {mode === "stopwatch" ? "Elapsed" : "Remaining"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="dd-timer-controls">
          {!isActive ? (
            <>
              <Select
                value={sessionName}
                onChange={setSessionName}
                options={sessionOptions}
                placeholder="What are you working on?"
                icon="📝"
                searchable
                label="Session Name"
              />

              {mode === "timer" && (
                <DurationPicker
                  value={timerMin}
                  onChange={setTimerMin}
                  label="Duration"
                  presets={[5, 10, 15, 20, 25, 30, 45, 60]}
                />
              )}

              {mode === "stopwatch" && (
                <DurationPicker
                  value={goalMin}
                  onChange={setGoalMin}
                  label="Goal (optional)"
                  presets={[15, 30, 45, 60, 90, 120]}
                />
              )}

              <button
                className="dd-timer-start-btn"
                onClick={start}
                disabled={mode === "timer" && timerMin <= 0}
              >
                <span>▶</span> Start Focus
              </button>
            </>
          ) : (
            <div className="dd-timer-active-controls">
              <div className="dd-timer-session-info">
                <span className="dd-timer-session-icon">📝</span>
                <span className="dd-timer-session-name">
                  {sessionName || "Focus Session"}
                </span>
              </div>

              <div className="dd-timer-buttons">
                {running ? (
                  <button className="dd-timer-btn pause" onClick={pauseTimer}>
                    <span>⏸</span> Pause
                  </button>
                ) : (
                  <button className="dd-timer-btn resume" onClick={resumeTimer}>
                    <span>▶</span> Resume
                  </button>
                )}
                <button className="dd-timer-btn stop" onClick={stopTimer}>
                  <span>⏹</span> {paused ? "Save" : "Stop"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="dd-timer-stats">
        <div className="dd-timer-stat">
          <span className="dd-timer-stat-value">{formatTotalTime(readingToday)}</span>
          <span className="dd-timer-stat-label">Today's Focus</span>
        </div>
        <div className="dd-timer-stat">
          <span className="dd-timer-stat-value">{sortedSessions.length}</span>
          <span className="dd-timer-stat-label">Sessions</span>
        </div>
        <div className="dd-timer-stat">
          <span className="dd-timer-stat-value">
            {sortedSessions.length > 0
              ? formatTotalTime(
                  Math.round(
                    sortedSessions.reduce((a, s) => a + (s.duration || 0), 0) /
                      sortedSessions.length
                  )
                )
              : "—"}
          </span>
          <span className="dd-timer-stat-label">Avg Duration</span>
        </div>
      </div>

      {/* Sessions List Toggle */}
      {sortedSessions.length > 0 && (
        <div className="dd-timer-sessions">
          <button
            className="dd-timer-sessions-toggle"
            onClick={() => setShowSessions(!showSessions)}
          >
            <span>📋 Today's Sessions ({sortedSessions.length})</span>
            <span className={`dd-timer-sessions-arrow ${showSessions ? "open" : ""}`}>
              ▼
            </span>
          </button>

          {showSessions && (
            <div className="dd-timer-sessions-list">
              {sortedSessions.map((s) => (
                <div key={s._id} className="dd-timer-session-item">
                  <div className="dd-timer-session-main">
                    <span className="dd-timer-session-title">
                      {s.sessionName || "Reading"}
                    </span>
                    <span className="dd-timer-session-time">
                      {fmtTime(s.startTime)} – {fmtTime(s.endTime)}
                    </span>
                  </div>
                  <span className="dd-timer-session-duration">
                    {Math.round((s.duration || 0) / 60)}m
                  </span>
                  <button
                    className="dd-timer-session-delete"
                    onClick={() => deleteSession(s._id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {sortedSessions.length === 0 && !isActive && (
        <EmptyState
          icon="🎯"
          title="No sessions today"
          description="Start your first focus session to track your productivity"
          variant="compact"
        />
      )}

      <style>{`
        .dd-timer {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .dd-timer-modes {
          display: flex;
          gap: 8px;
          padding: 4px;
          background: var(--dd-bg-secondary, #F1F5F9);
          border-radius: 16px;
        }

        .dd-timer-mode {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border: none;
          background: transparent;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: var(--dd-text-muted, #64748B);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .dd-timer-mode:hover:not(:disabled) {
          color: var(--dd-text-primary, #0F172A);
        }

        .dd-timer-mode.active {
          background: var(--dd-bg-card-solid, #FFFFFF);
          color: var(--dd-text-primary, #0F172A);
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
        }

        .dd-timer-mode:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dd-timer-mode-icon {
          font-size: 18px;
        }

        .dd-timer-main {
          display: flex;
          gap: 32px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .dd-timer-main {
            flex-direction: column;
            align-items: center;
          }
        }

        .dd-timer-display {
          position: relative;
          flex-shrink: 0;
        }

        .dd-timer-time {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .dd-timer-digits {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--dd-text-primary, #0F172A);
          font-variant-numeric: tabular-nums;
        }

        .dd-timer-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--dd-text-muted, #64748B);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dd-timer-controls {
          flex: 1;
          min-width: 280px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dd-timer-start-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 24px;
          background: linear-gradient(135deg, #10B981, #34D399);
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
        }

        .dd-timer-start-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
        }

        .dd-timer-start-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dd-timer-active-controls {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dd-timer-session-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: var(--dd-bg-secondary, #F1F5F9);
          border-radius: 12px;
        }

        .dd-timer-session-icon {
          font-size: 20px;
        }

        .dd-timer-session-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--dd-text-primary, #0F172A);
        }

        .dd-timer-buttons {
          display: flex;
          gap: 12px;
        }

        .dd-timer-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dd-timer-btn.pause {
          background: linear-gradient(135deg, #F59E0B, #FBBF24);
          color: white;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .dd-timer-btn.resume {
          background: linear-gradient(135deg, #10B981, #34D399);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .dd-timer-btn.stop {
          background: linear-gradient(135deg, #EF4444, #F87171);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .dd-timer-btn:hover {
          transform: translateY(-2px);
        }

        .dd-timer-stats {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: var(--dd-bg-secondary, #F1F5F9);
          border-radius: 16px;
        }

        .dd-timer-stat {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          text-align: center;
        }

        .dd-timer-stat-value {
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(135deg, var(--dd-primary-600, #2563EB), var(--dd-lavender-500, #8B5CF6));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .dd-timer-stat-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--dd-text-muted, #64748B);
        }

        .dd-timer-sessions {
          border: 1px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 16px;
          overflow: hidden;
        }

        .dd-timer-sessions-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: transparent;
          border: none;
          font-size: 14px;
          font-weight: 600;
          color: var(--dd-text-primary, #0F172A);
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .dd-timer-sessions-toggle:hover {
          background: var(--dd-bg-secondary, #F1F5F9);
        }

        .dd-timer-sessions-arrow {
          transition: transform 0.2s ease;
          font-size: 12px;
          color: var(--dd-text-muted, #64748B);
        }

        .dd-timer-sessions-arrow.open {
          transform: rotate(180deg);
        }

        .dd-timer-sessions-list {
          border-top: 1px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          max-height: 300px;
          overflow-y: auto;
        }

        .dd-timer-session-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-bottom: 1px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          transition: background 0.15s ease;
        }

        .dd-timer-session-item:last-child {
          border-bottom: none;
        }

        .dd-timer-session-item:hover {
          background: var(--dd-bg-secondary, #F1F5F9);
        }

        .dd-timer-session-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .dd-timer-session-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--dd-text-primary, #0F172A);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dd-timer-session-time {
          font-size: 12px;
          color: var(--dd-text-muted, #64748B);
        }

        .dd-timer-session-duration {
          font-size: 14px;
          font-weight: 700;
          color: var(--dd-primary-600, #2563EB);
          padding: 4px 10px;
          background: var(--dd-primary-100, #DBEAFE);
          border-radius: 8px;
        }

        .dd-timer-session-delete {
          padding: 6px;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          opacity: 0.5;
          transition: all 0.2s ease;
        }

        .dd-timer-session-delete:hover {
          opacity: 1;
          background: var(--dd-error-light, #FEE2E2);
        }

        [data-theme="dark"] .dd-timer-modes {
          background: var(--dd-bg-tertiary, #334155);
        }

        [data-theme="dark"] .dd-timer-mode.active {
          background: var(--dd-bg-secondary, #1E293B);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        [data-theme="dark"] .dd-timer-stats {
          background: var(--dd-bg-tertiary, #334155);
        }

        [data-theme="dark"] .dd-timer-session-info {
          background: var(--dd-bg-tertiary, #334155);
        }

        [data-theme="dark"] .dd-timer-session-duration {
          background: rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Timer;
