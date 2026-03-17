import React, { useContext, useState, useCallback } from "react";
import Quote from "./Quote";
import ReadingHeatmap from "./ReadingHeatmap";
import TimetableOverview from "./TimetableOverview";
import TaskList from "../Tasks/TaskList";
import TaskForm from "../Tasks/TaskForm";
import Timer from "../ReadingTimer/Timer";
import JournalList from "../Journal/JournalList";
import { TaskContext } from "../../context/TaskContext";
import { TimerContext } from "../../context/TimerContext";
import { JournalContext } from "../../context/JournalContext";
import { TimetableContext } from "../../context/TimetableContext";
import { Card, CardBody, CardHeader } from "../ui/Card";
import ProgressRing from "./ProgressRing";
import WaveBackground from "../ui/WaveBackground";
import ThemeSwitcher from "../ui/ThemeSwitcher";
import FloatingActionButton from "../ui/FloatingActionButton";
import { useConfetti } from "../ui/Confetti";
import EmptyState from "../ui/EmptyState";
import Select from "../ui/Select";
import "./dashboard-grid.css";
import { useSettings } from "../../context/SettingsContext";

// Professional SVG Icons
const Icons = {
  Clock: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Tasks: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="6" height="6" rx="1" />
      <path d="M11 8h10" />
      <rect x="3" y="13" width="6" height="6" rx="1" />
      <path d="M11 16h10" />
    </svg>
  ),
  CheckCircle: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Zap: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  BarChart: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  Timer: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M5 3L2 6" />
      <path d="M22 6l-3-3" />
      <path d="M6.38 18.7L4 21" />
      <path d="M17.64 18.67L20 21" />
    </svg>
  ),
  Book: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
  Target: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Plus: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};

const Dashboard = () => {
  const { tasks } = useContext(TaskContext);
  const { readingToday, sessionsToday } = useContext(TimerContext);
  const { journals } = useContext(JournalContext);
  const { entries } = useContext(TimetableContext);
  const { settings, setFocusGoal, toggleTheme } = useSettings();
  const [activeSection, setActiveSection] = useState("overview");

  const { triggerConfetti, ConfettiComponent } = useConfetti({
    particleCount: 60,
    duration: 3000,
  });

  const tz = "Asia/Kolkata";
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: tz });
  const isSameDayIST = (d) =>
    new Date(d).toLocaleDateString("en-CA", { timeZone: tz }) === todayStr;

  const pendingToday = (tasks || []).filter(
    (t) => t.status !== "completed" && (!t.dueDate || isSameDayIST(t.dueDate))
  ).length;
  const completedCount = (tasks || []).filter(
    (t) => t.status === "completed"
  ).length;
  const journalsToday = (journals || []).filter((j) => isSameDayIST(j.date));

  const focusProgress = Math.min(
    1,
    (readingToday || 0) / ((settings.focusGoalMinutes || 60) * 60)
  );

  const handleGoalCheck = useCallback(() => {
    if (focusProgress >= 1) triggerConfetti();
  }, [focusProgress, triggerConfetti]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatFocusTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const goalOptions = [
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 45, label: "45 min" },
    { value: 60, label: "1 hour" },
    { value: 90, label: "1.5 hours" },
    { value: 120, label: "2 hours" },
    { value: 180, label: "3 hours" },
  ];

  return (
    <WaveBackground>
      {ConfettiComponent}

      <div className="dd-dashboard">
        {/* Header */}
        <header className="dd-dashboard-header">
          <div className="dd-dashboard-greeting">
            <h1>{getGreeting()}</h1>
            <p>Here's your productivity overview for today</p>
          </div>
          <div className="dd-dashboard-actions">
            <ThemeSwitcher
              isDark={settings.theme === "dark"}
              onToggle={toggleTheme}
              size={44}
            />
          </div>
        </header>

        {/* Quick Stats Bar */}
        <div className="dd-quick-stats">
          <div className="dd-quick-stat dd-quick-stat--primary" onClick={handleGoalCheck}>
            <div className="dd-quick-stat-icon">
              <Icons.Clock size={26} />
            </div>
            <div className="dd-quick-stat-content">
              <span className="dd-quick-stat-value">{formatFocusTime(readingToday || 0)}</span>
              <span className="dd-quick-stat-label">Focus Time</span>
            </div>
            <div className="dd-quick-stat-progress">
              <div
                className="dd-quick-stat-fill"
                style={{ width: `${focusProgress * 100}%` }}
              />
            </div>
          </div>

          <div className="dd-quick-stat dd-quick-stat--amber">
            <div className="dd-quick-stat-icon">
              <Icons.Tasks size={26} />
            </div>
            <div className="dd-quick-stat-content">
              <span className="dd-quick-stat-value">{pendingToday}</span>
              <span className="dd-quick-stat-label">Tasks Pending</span>
            </div>
          </div>

          <div className="dd-quick-stat dd-quick-stat--emerald">
            <div className="dd-quick-stat-icon">
              <Icons.CheckCircle size={26} />
            </div>
            <div className="dd-quick-stat-content">
              <span className="dd-quick-stat-value">{completedCount}</span>
              <span className="dd-quick-stat-label">Completed</span>
            </div>
          </div>

          <div className="dd-quick-stat dd-quick-stat--violet">
            <div className="dd-quick-stat-icon">
              <Icons.Zap size={26} />
            </div>
            <div className="dd-quick-stat-content">
              <span className="dd-quick-stat-value">{sessionsToday?.length || 0}</span>
              <span className="dd-quick-stat-label">Sessions</span>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="dd-section-tabs">
          <button
            className={`dd-section-tab ${activeSection === "overview" ? "active" : ""}`}
            onClick={() => setActiveSection("overview")}
          >
            <Icons.BarChart size={18} /> Overview
          </button>
          <button
            className={`dd-section-tab ${activeSection === "timer" ? "active" : ""}`}
            onClick={() => setActiveSection("timer")}
          >
            <Icons.Timer size={18} /> Focus Timer
          </button>
          <button
            className={`dd-section-tab ${activeSection === "tasks" ? "active" : ""}`}
            onClick={() => setActiveSection("tasks")}
          >
            <Icons.CheckCircle size={18} /> Tasks
          </button>
        </div>

        {/* Main Content */}
        <div className="dd-dashboard-content">
          {activeSection === "overview" && (
            <div className="dd-grid">
              {/* Quote */}
              <Card className="col-span-12 dd-card--violet">
                <CardBody>
                  <Quote />
                </CardBody>
              </Card>

              {/* Focus Progress */}
              <Card className="col-span-4 sm:col-span-12 dd-card--emerald">
                <CardHeader title="Daily Focus Goal" />
                <CardBody>
                  <div className="dd-focus-card">
                    <ProgressRing
                      value={focusProgress}
                      label={formatFocusTime(readingToday || 0)}
                      caption={`of ${settings.focusGoalMinutes}m goal`}
                      color="#10b981"
                      size={100}
                      stroke={12}
                    />
                    <div className="dd-focus-goal-select">
                      <Select
                        value={settings.focusGoalMinutes}
                        onChange={(val) => setFocusGoal(val)}
                        options={goalOptions}
                        label="Daily Goal"
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Timetable */}
              <Card className="col-span-4 sm:col-span-12 dd-card--rose">
                <CardHeader title="Today's Schedule" />
                <CardBody>
                  <TimetableOverview />
                </CardBody>
              </Card>

              {/* Sessions Summary */}
              <Card className="col-span-4 sm:col-span-12 dd-card--amber">
                <CardHeader title="Recent Sessions" />
                <CardBody>
                  {sessionsToday?.length > 0 ? (
                    <div className="dd-sessions-mini">
                      {sessionsToday.slice(0, 4).map((s) => (
                        <div key={s._id} className="dd-session-mini-item">
                          <span className="dd-session-mini-name">
                            {s.sessionName || "Focus"}
                          </span>
                          <span className="dd-session-mini-duration">
                            {Math.round((s.duration || 0) / 60)}m
                          </span>
                        </div>
                      ))}
                      {sessionsToday.length > 4 && (
                        <div className="dd-session-mini-more">
                          +{sessionsToday.length - 4} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      title="No sessions yet"
                      description="Start focusing to track your time"
                      variant="compact"
                    />
                  )}
                </CardBody>
              </Card>

              {/* Heatmap */}
              <Card className="col-span-8 sm:col-span-12 dd-card--slate">
                <CardBody>
                  <ReadingHeatmap />
                </CardBody>
              </Card>

              {/* Journals */}
              <Card className="col-span-4 sm:col-span-12 dd-card--violet">
                <CardHeader title="Journal Entries" />
                <CardBody style={{ maxHeight: 250, overflowY: "auto" }}>
                  {journalsToday.length > 0 ? (
                    <JournalList items={journalsToday} />
                  ) : (
                    <EmptyState
                      title="No entries today"
                      description="Capture your thoughts"
                      variant="compact"
                    />
                  )}
                </CardBody>
              </Card>
            </div>
          )}

          {activeSection === "timer" && (
            <Card className="dd-card--slate">
              <CardBody>
                <Timer />
              </CardBody>
            </Card>
          )}

          {activeSection === "tasks" && (
            <Card className="dd-card--blue">
              <CardHeader title="Task Management" />
              <CardBody>
                <TaskForm />
                <div style={{ marginTop: 20 }}>
                  <TaskList />
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <FloatingActionButton
        onClick={() => setActiveSection("tasks")}
        icon={<Icons.Plus size={24} color="white" />}
        label="Add task"
        color="accent"
      />

      <style>{`
        .dd-dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .dd-dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .dd-dashboard-greeting h1 {
          font-size: clamp(1.5rem, 4vw, 2.25rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, var(--dd-primary-600, #2563EB) 0%, var(--dd-lavender-500, #8B5CF6) 50%, var(--dd-accent-500, #F59E0B) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin: 0;
        }

        .dd-dashboard-greeting p {
          color: var(--dd-text-muted, #64748B);
          font-size: 15px;
          margin: 4px 0 0;
        }

        .dd-dashboard-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dd-quick-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        @media (max-width: 900px) {
          .dd-quick-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 500px) {
          .dd-quick-stats {
            grid-template-columns: 1fr;
          }
        }

        .dd-quick-stat {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
          background: var(--dd-bg-card, rgba(255, 255, 255, 0.7));
          backdrop-filter: blur(20px);
          border: 1px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 18px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
        }

        .dd-quick-stat:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
        }

        .dd-quick-stat--primary .dd-quick-stat-icon {
          color: var(--dd-primary-500, #3B82F6);
        }

        .dd-quick-stat--primary:hover {
          border-color: var(--dd-primary-300, #93C5FD);
        }

        .dd-quick-stat--amber .dd-quick-stat-icon {
          color: var(--dd-accent-500, #F59E0B);
        }

        .dd-quick-stat--amber:hover {
          border-color: var(--dd-accent-300, #FCD34D);
        }

        .dd-quick-stat--emerald .dd-quick-stat-icon {
          color: var(--dd-success, #10B981);
        }

        .dd-quick-stat--emerald:hover {
          border-color: #6EE7B7;
        }

        .dd-quick-stat--violet .dd-quick-stat-icon {
          color: var(--dd-lavender-500, #8B5CF6);
        }

        .dd-quick-stat--violet:hover {
          border-color: var(--dd-lavender-300, #C4B5FD);
        }

        .dd-quick-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .dd-quick-stat-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .dd-quick-stat-value {
          font-size: 24px;
          font-weight: 800;
          color: var(--dd-text-primary, #0F172A);
        }

        .dd-quick-stat-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--dd-text-muted, #64748B);
        }

        .dd-quick-stat-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--dd-bg-tertiary, #E2E8F0);
        }

        .dd-quick-stat-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--dd-success, #10B981), var(--dd-primary-500, #3B82F6));
          transition: width 0.5s ease;
        }

        .dd-section-tabs {
          display: flex;
          gap: 8px;
          padding: 4px;
          background: var(--dd-bg-secondary, #F1F5F9);
          border-radius: 16px;
          overflow-x: auto;
        }

        .dd-section-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          border: none;
          background: transparent;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: var(--dd-text-muted, #64748B);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .dd-section-tab:hover {
          color: var(--dd-text-primary, #0F172A);
        }

        .dd-section-tab.active {
          background: var(--dd-bg-card-solid, #FFFFFF);
          color: var(--dd-primary-600, #2563EB);
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
        }

        .dd-section-tab svg {
          flex-shrink: 0;
        }

        .dd-dashboard-content {
          min-height: 400px;
        }

        .dd-focus-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dd-focus-goal-select {
          max-width: 200px;
        }

        .dd-sessions-mini {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dd-session-mini-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: var(--dd-bg-secondary, #F1F5F9);
          border-radius: 10px;
        }

        .dd-session-mini-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--dd-text-primary, #0F172A);
        }

        .dd-session-mini-duration {
          font-size: 14px;
          font-weight: 700;
          color: var(--dd-primary-600, #2563EB);
        }

        .dd-session-mini-more {
          text-align: center;
          font-size: 13px;
          color: var(--dd-text-muted, #64748B);
          padding: 8px;
        }

        [data-theme="dark"] .dd-quick-stat {
          background: var(--dd-bg-card, rgba(30, 41, 59, 0.7));
        }

        [data-theme="dark"] .dd-section-tabs {
          background: var(--dd-bg-tertiary, #334155);
        }

        [data-theme="dark"] .dd-section-tab.active {
          background: var(--dd-bg-secondary, #1E293B);
        }

        [data-theme="dark"] .dd-session-mini-item {
          background: var(--dd-bg-tertiary, #334155);
        }
      `}</style>
    </WaveBackground>
  );
};

export default Dashboard;
