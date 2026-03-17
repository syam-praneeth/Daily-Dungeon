import React, { useContext, useMemo } from "react";
import { TimetableContext } from "../../context/TimetableContext";
import EmptyState from "../ui/EmptyState";

const TimetableOverview = () => {
  const { entries } = useContext(TimetableContext);
  const today = new Date().toLocaleString("en-US", { weekday: "long" });
  const currentTime = new Date();

  const todayEntries = useMemo(() => {
    return entries
      .filter((e) => (e.dayOfWeek || e.day) === today)
      .sort((a, b) => {
        const timeA = a.startTime?.replace(":", "") || "0000";
        const timeB = b.startTime?.replace(":", "") || "0000";
        return timeA.localeCompare(timeB);
      });
  }, [entries, today]);

  const isCurrentEntry = (entry) => {
    if (!entry.startTime || !entry.endTime) return false;
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const [startH, startM] = entry.startTime.split(":").map(Number);
    const [endH, endM] = entry.endTime.split(":").map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    return now >= start && now <= end;
  };

  const isPastEntry = (entry) => {
    if (!entry.endTime) return false;
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const [endH, endM] = entry.endTime.split(":").map(Number);
    const end = endH * 60 + endM;
    return now > end;
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getActivityIcon = (name) => {
    const lowName = (name || "").toLowerCase();
    if (lowName.includes("math") || lowName.includes("calculus")) return "📐";
    if (lowName.includes("physics")) return "⚛️";
    if (lowName.includes("chemistry")) return "🧪";
    if (lowName.includes("biology")) return "🧬";
    if (lowName.includes("english") || lowName.includes("writing")) return "📝";
    if (lowName.includes("history")) return "📜";
    if (lowName.includes("coding") || lowName.includes("programming")) return "💻";
    if (lowName.includes("exercise") || lowName.includes("workout") || lowName.includes("gym")) return "🏋️";
    if (lowName.includes("meditation") || lowName.includes("yoga")) return "🧘";
    if (lowName.includes("lunch") || lowName.includes("dinner") || lowName.includes("breakfast")) return "🍽️";
    if (lowName.includes("break") || lowName.includes("rest")) return "☕";
    if (lowName.includes("meeting") || lowName.includes("call")) return "📞";
    if (lowName.includes("reading") || lowName.includes("book")) return "📚";
    if (lowName.includes("music") || lowName.includes("piano") || lowName.includes("guitar")) return "🎵";
    return "📌";
  };

  if (todayEntries.length === 0) {
    return (
      <EmptyState
        icon="📅"
        title="No schedule today"
        description="Your timetable for today is clear"
        variant="compact"
      />
    );
  }

  return (
    <div className="dd-timetable-overview">
      <div className="dd-timetable-header">
        <span className="dd-timetable-day">{today}</span>
        <span className="dd-timetable-count">{todayEntries.length} events</span>
      </div>

      <div className="dd-timetable-timeline">
        {todayEntries.map((entry, index) => {
          const isCurrent = isCurrentEntry(entry);
          const isPast = isPastEntry(entry);

          return (
            <div
              key={entry._id}
              className={`dd-timetable-item ${isCurrent ? "current" : ""} ${
                isPast ? "past" : ""
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="dd-timetable-time">
                <span className="dd-timetable-start">
                  {formatTime(entry.startTime)}
                </span>
                <div className="dd-timetable-line">
                  <div className="dd-timetable-dot" />
                </div>
                <span className="dd-timetable-end">
                  {formatTime(entry.endTime)}
                </span>
              </div>

              <div className="dd-timetable-content">
                <span className="dd-timetable-icon">
                  {getActivityIcon(entry.activityName || entry.subject)}
                </span>
                <div className="dd-timetable-details">
                  <span className="dd-timetable-name">
                    {entry.activityName || entry.subject}
                  </span>
                  {entry.location && (
                    <span className="dd-timetable-location">
                      📍 {entry.location}
                    </span>
                  )}
                </div>
                {isCurrent && (
                  <span className="dd-timetable-now">NOW</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .dd-timetable-overview {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dd-timetable-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dd-timetable-day {
          font-size: 14px;
          font-weight: 700;
          color: var(--dd-text-primary, #0F172A);
        }

        .dd-timetable-count {
          font-size: 12px;
          font-weight: 500;
          color: var(--dd-text-muted, #64748B);
          padding: 4px 10px;
          background: var(--dd-bg-secondary, #F1F5F9);
          border-radius: 8px;
        }

        .dd-timetable-timeline {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dd-timetable-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: var(--dd-bg-card-solid, #FFFFFF);
          border: 1px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 12px;
          transition: all 0.2s ease;
          animation: dd-timetable-fade-in 0.3s ease forwards;
          opacity: 0;
        }

        @keyframes dd-timetable-fade-in {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .dd-timetable-item:hover {
          border-color: var(--dd-primary-300, #93C5FD);
          transform: translateX(4px);
        }

        .dd-timetable-item.current {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08));
          border-color: var(--dd-primary-400, #60A5FA);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .dd-timetable-item.past {
          opacity: 0.6;
        }

        .dd-timetable-time {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 60px;
        }

        .dd-timetable-start,
        .dd-timetable-end {
          font-size: 11px;
          font-weight: 600;
          color: var(--dd-text-muted, #64748B);
        }

        .dd-timetable-line {
          flex: 1;
          width: 2px;
          min-height: 16px;
          background: var(--dd-border-light, rgba(203, 213, 225, 0.5));
          position: relative;
        }

        .dd-timetable-item.current .dd-timetable-line {
          background: linear-gradient(180deg, var(--dd-primary-500, #3B82F6), var(--dd-lavender-500, #8B5CF6));
        }

        .dd-timetable-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background: var(--dd-border-medium, #CBD5E1);
          border-radius: 50%;
        }

        .dd-timetable-item.current .dd-timetable-dot {
          background: var(--dd-primary-500, #3B82F6);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
          animation: dd-timetable-pulse 2s ease-in-out infinite;
        }

        @keyframes dd-timetable-pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1);
          }
        }

        .dd-timetable-content {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .dd-timetable-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .dd-timetable-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .dd-timetable-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--dd-text-primary, #0F172A);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dd-timetable-location {
          font-size: 12px;
          color: var(--dd-text-muted, #64748B);
        }

        .dd-timetable-now {
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          background: linear-gradient(135deg, var(--dd-primary-500, #3B82F6), var(--dd-lavender-500, #8B5CF6));
          color: white;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        [data-theme="dark"] .dd-timetable-item {
          background: var(--dd-bg-secondary, #1E293B);
          border-color: var(--dd-border-medium, #334155);
        }

        [data-theme="dark"] .dd-timetable-count {
          background: var(--dd-bg-tertiary, #334155);
        }
      `}</style>
    </div>
  );
};

export default TimetableOverview;
