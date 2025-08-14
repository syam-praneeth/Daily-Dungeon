import React, { useContext } from "react";
import Quote from "./Quote";
import ReadingHeatmap from "./ReadingHeatmap";
import TodayStats from "./TodayStats";
import TimetableOverview from "./TimetableOverview";
import TaskList from "../Tasks/TaskList";
import TaskForm from "../Tasks/TaskForm";
import Timer from "../ReadingTimer/Timer";
import JournalForm from "../Journal/JournalForm";
import JournalList from "../Journal/JournalList";
import { TaskContext } from "../../context/TaskContext";
import { TimerContext } from "../../context/TimerContext";
import { JournalContext } from "../../context/JournalContext";
import { TimetableContext } from "../../context/TimetableContext";
import { Card, CardBody, CardHeader, CardMenu } from "../ui/Card";
import ProgressRing from "./ProgressRing";
import "./dashboard-grid.css";
import { useSettings } from "../../context/SettingsContext";

const Dashboard = () => {
  const { tasks } = useContext(TaskContext);
  const { readingToday, sessionsToday } = useContext(TimerContext);
  const { journals } = useContext(JournalContext);
  const { entries } = useContext(TimetableContext);
  const { settings, setFocusGoal, toggleTheme } = useSettings();

  const tz = "Asia/Kolkata";
  const todayStr = new Date().toLocaleDateString("en-CA", {
    timeZone: tz,
  });
  const isSameDayIST = (d) =>
    new Date(d).toLocaleDateString("en-CA", { timeZone: tz }) === todayStr;

  const tasksToday = (tasks || []).filter((t) =>
    t.dueDate ? isSameDayIST(t.dueDate) : false
  );
  // Pending count should include tasks with no due date (floating) + tasks due today
  const pendingToday = (tasks || []).filter(
    (t) => t.status !== "completed" && (!t.dueDate || isSameDayIST(t.dueDate))
  ).length;
  // Completed count should include all completed tasks, regardless of due date
  const completedCount = (tasks || []).filter(
    (t) => t.status === "completed"
  ).length;
  const journalsToday = (journals || []).filter((j) => isSameDayIST(j.date));

  return (
    <div style={{ maxWidth: 1280, margin: "16px auto", overflow: "hidden" }}>
      <div className="dd-grid">
        {/* Top: Quote full width */}
        <Card className="col-span-12 sm:col-span-12 dd-card--violet">
          <CardHeader title="Quote of the Day" actions={<CardMenu />} />
          <CardBody>
            <Quote />
            <div
              style={{
                marginTop: 12,
                borderTop: "1px solid #e2e8f0",
                paddingTop: 12,
              }}
            >
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                Quick Task
              </div>
              <TaskForm compact />
            </div>
          </CardBody>
        </Card>

        {/* Row 1: KPIs */}
        <Card className="col-span-4 lg:col-span-4 sm:col-span-12 dd-card--emerald">
          <CardHeader
            title="Focus Time Today"
            actions={
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  className="dd-card__menu"
                  onClick={toggleTheme}
                  title="Toggle theme"
                >
                  🌓
                </button>
              </div>
            }
          />
          <CardBody>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ProgressRing
                value={Math.min(
                  1,
                  (readingToday || 0) / ((settings.focusGoalMinutes || 60) * 60)
                )}
                label={`${Math.round((readingToday || 0) / 60)} minutes`}
                caption={`of ${settings.focusGoalMinutes}m goal`}
                color="#10b981"
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label
                  htmlFor="goal"
                  style={{ fontSize: 12, color: "#64748b" }}
                >
                  Daily goal
                </label>
                <input
                  id="goal"
                  type="number"
                  min={1}
                  step={1}
                  value={settings.focusGoalMinutes}
                  onChange={(e) => setFocusGoal(e.target.value)}
                  style={{
                    width: 84,
                    padding: "6px 8px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                  }}
                />
                <span style={{ fontSize: 12, color: "#64748b" }}>minutes</span>
              </div>
              <div className="spark" aria-hidden />
            </div>
          </CardBody>
        </Card>
        <Card className="col-span-4 lg:col-span-4 sm:col-span-12 dd-card--amber">
          <CardHeader title="Sessions Today" actions={<CardMenu />} />
          <CardBody>
            <div className="kpi">
              <div className="value">{sessionsToday?.length || 0}</div>
              <div className="label">Sessions</div>
            </div>
          </CardBody>
        </Card>
        <Card className="col-span-4 lg:col-span-4 sm:col-span-12 dd-card--blue">
          <CardHeader title="Tasks" actions={<CardMenu />} />
          <CardBody>
            <div className="kpi" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="label">Pending</div>
                <div className="value">{pendingToday}</div>
              </div>
              <div>
                <div className="label">Completed</div>
                <div className="value">{completedCount}</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Row 2: Heatmap and Timetable */}
        <Card className="col-span-7 lg:col-span-7 sm:col-span-12 dd-card--slate">
          <CardHeader title="Streak Heatmap" actions={<CardMenu />} />
          <CardBody>
            <ReadingHeatmap />
          </CardBody>
        </Card>
        <Card className="col-span-5 lg:col-span-5 sm:col-span-12 dd-card--rose">
          <CardHeader title="Today’s Timetable" actions={<CardMenu />} />
          <CardBody>
            <TimetableOverview />
          </CardBody>
        </Card>

        {/* Row 3: Sessions and Journals */}
        <Card className="col-span-6 lg:col-span-6 sm:col-span-12 dd-card--violet">
          <CardHeader title="Today’s Sessions" actions={<CardMenu />} />
          <CardBody>
            {sessionsToday?.length ? (
              <table className="table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Session</th>
                    <th className="text-right">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionsToday.map((s) => (
                    <tr key={s._id}>
                      <td>{s.sessionName || "Reading"}</td>
                      <td className="text-right">
                        {Math.round((s.duration || 0) / 60)}m
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>No sessions today.</div>
            )}
          </CardBody>
        </Card>
        <Card className="col-span-6 lg:col-span-6 sm:col-span-12 dd-card--emerald">
          <CardHeader title="Journals Snapshot" actions={<CardMenu />} />
          <CardBody style={{ maxHeight: 300, overflowY: "auto" }}>
            <JournalList items={journalsToday} />
          </CardBody>
        </Card>

        {/* Timer / Stopwatch clock */}
        <Card className="col-span-12 sm:col-span-12 dd-card--slate">
          <CardHeader title="Focus Timer" actions={<CardMenu />} />
          <CardBody>
            <Timer />
          </CardBody>
        </Card>

        {/* Bottom: Tasks full width */}
        <Card className="col-span-12 sm:col-span-12 dd-card--blue">
          <CardHeader title="Upcoming Tasks" actions={<CardMenu />} />
          <CardBody>
            <TaskForm />
            <TaskList />
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
