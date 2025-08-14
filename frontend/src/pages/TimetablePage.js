import React, { useContext, useMemo, useState } from "react";
import TimetableForm from "../components/Timetable/TimetableForm";
import TimetableList from "../components/Timetable/TimetableList";
import { TimetableContext } from "../context/TimetableContext";
import { Card, CardBody, CardHeader, CardMenu } from "../components/ui/Card";
import "../components/Dashboard/dashboard-grid.css";

const TimetablePage = () => {
  const { entries, timetableError } = useContext(TimetableContext);
  const [dayFilter, setDayFilter] = useState("");
  const [showAll, setShowAll] = useState(false);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const now = new Date();
  const currentDay = days[now.getDay() === 0 ? 6 : now.getDay() - 1];

  const filtered = useMemo(() => {
    return entries
      .filter((e) => !dayFilter || (e.dayOfWeek || e.day) === dayFilter)
      .sort((a, b) => {
        const aT = (a.startTime || "").padStart(5, "0");
        const bT = (b.startTime || "").padStart(5, "0");
        return aT.localeCompare(bT);
      });
  }, [entries, dayFilter]);

  const upcoming = useMemo(() => {
    // Determine next entry for today based on startTime > now
    const todayEntries = entries.filter(
      (e) => (e.dayOfWeek || e.day) === currentDay
    );
    const currentHM = now.toTimeString().slice(0, 5);
    const next = todayEntries
      .filter((e) => e.startTime >= currentHM)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
    return next;
  }, [entries, currentDay, now]);

  return (
    <div style={{ maxWidth: 1280, margin: "16px auto", overflow: "hidden" }}>
      <div className="dd-grid">
        <Card className="col-span-12 sm:col-span-12 dd-card--violet">
          <CardHeader title="Add Schedule Entry" actions={<CardMenu />} />
          <CardBody>
            <TimetableForm />
            {timetableError && (
              <div className="error" style={{ marginTop: 8 }}>
                {timetableError}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="col-span-4 lg:col-span-4 sm:col-span-12 dd-card--slate">
          <CardHeader title="Filters" actions={<CardMenu />} />
          <CardBody>
            <div className="grid" style={{ gap: 8 }}>
              <label style={{ fontSize: 12, color: "#64748b" }}>
                Day
                <select
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                >
                  <option value="">All days</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              {dayFilter && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setDayFilter("")}
                  style={{ fontSize: 12 }}
                >
                  Clear Day
                </button>
              )}
              <button
                type="button"
                className="btn-outline"
                style={{ fontSize: 12 }}
                onClick={() => setShowAll((s) => !s)}
              >
                {showAll ? "Collapse Days" : "Expand by Day"}
              </button>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
              Showing {filtered.length} / {entries.length} entries
            </div>
          </CardBody>
        </Card>

        <Card className="col-span-8 lg:col-span-8 sm:col-span-12 dd-card--emerald">
          <CardHeader
            title={dayFilter ? `${dayFilter} Schedule` : "Schedule"}
            subtitle={dayFilter ? "Ordered by start time" : "All (filtered)"}
            actions={<CardMenu />}
          />
          <CardBody>
            {!showAll && <TimetableList items={filtered} />}
            {showAll && (
              <div className="grid" style={{ gap: 16 }}>
                {days
                  .filter((d) =>
                    dayFilter
                      ? d === dayFilter
                      : filtered.some((e) => (e.dayOfWeek || e.day) === d)
                  )
                  .map((d) => {
                    const group = filtered.filter(
                      (e) => (e.dayOfWeek || e.day) === d
                    );
                    if (!group.length) return null;
                    return (
                      <div
                        key={d}
                        className="soft-section"
                        style={{ margin: 0 }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            marginBottom: 4,
                            fontSize: 14,
                            color: "#334155",
                          }}
                        >
                          {d}
                        </div>
                        <TimetableList items={group} />
                      </div>
                    );
                  })}
              </div>
            )}
            {!filtered.length && (
              <div style={{ fontSize: 14 }}>No entries match filters.</div>
            )}
          </CardBody>
        </Card>

        <Card className="col-span-12 sm:col-span-12 dd-card--amber">
          <CardHeader title="Next Up" actions={<CardMenu />} />
          <CardBody>
            {upcoming ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 18, fontWeight: 600 }}>
                  {(upcoming.activityName || upcoming.subject) ?? "(No name)"}
                </div>
                <div style={{ fontSize: 14, color: "#475569" }}>
                  Today {upcoming.startTime} - {upcoming.endTime}
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {currentDay}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 14 }}>No upcoming entries for today.</div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default TimetablePage;
