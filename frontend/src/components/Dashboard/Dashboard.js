import React, { useEffect, useState } from "react";
import Quote from "./Quote";
import ReadingHeatmap from "./ReadingHeatmap";
import TodayStats from "./TodayStats";
import TimetableOverview from "./TimetableOverview";
import TaskList from "../Tasks/TaskList";
import TaskForm from "../Tasks/TaskForm";
import Timer from "../ReadingTimer/Timer";
import JournalForm from "../Journal/JournalForm";
import JournalList from "../Journal/JournalList";
import TimetableForm from "../Timetable/TimetableForm";
import TimetableList from "../Timetable/TimetableList";

const Dashboard = () => {
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    import("../../api/axios").then(({ default: axios }) =>
      axios
        .get("/dashboard")
        .then((res) => {
          if (mounted) setDash(res.data);
        })
        .catch(() => setError("Failed to load dashboard"))
        .finally(() => setLoading(false))
    );
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "2rem auto",
        background: "#fff",
        padding: 16,
        borderRadius: 12,
      }}
    >
      <h2>Daily Dungeon Dashboard</h2>
      {loading && <div>Loading dashboard...</div>}
      {error && <div className="error">{error}</div>}

      <div className="dashboard-grid">
        <div className="col-12 soft-section accent-purple">
          <Quote />
        </div>

        {dash && (
          <div className="col-12 soft-section accent-blue">
            <strong>Today overview</strong>
            <div className="row" style={{ gap: 16, marginTop: 8 }}>
              <div>Tasks today: {dash.tasksToday?.length || 0}</div>
              <div>
                Reading today:{" "}
                {Math.round((dash.reading?.totalSeconds || 0) / 60)}m
              </div>
              <div>Journal entries: {dash.journal?.count || 0}</div>
            </div>
          </div>
        )}

        <div className="col-12 soft-section accent-emerald heatmap-xs heatmap-tiny">
          <ReadingHeatmap />
        </div>

        <div className="col-6 soft-section accent-amber">
          <TodayStats />
        </div>
        <div className="col-6 soft-section accent-rose">
          <TimetableOverview />
        </div>

        <div className="col-6 soft-section accent-blue form-narrow">
          <TaskForm />
        </div>
        <div className="col-6 soft-section accent-blue">
          <TaskList />
        </div>

        <div className="col-6 soft-section accent-emerald form-narrow">
          <Timer />
        </div>
        <div className="col-6 soft-section accent-emerald">
          {/* Reserved for recent sessions list or additional stats */}
        </div>

        <div className="col-6 soft-section accent-amber form-narrow">
          <JournalForm />
        </div>
        <div className="col-6 soft-section accent-amber">
          <JournalList />
        </div>

        <div className="col-6 soft-section accent-purple form-narrow">
          <TimetableForm />
        </div>
        <div className="col-6 soft-section accent-purple">
          <TimetableList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
