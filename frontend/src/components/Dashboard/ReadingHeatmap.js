import React, { useContext, useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import CalendarHeatmap from "react-calendar-heatmap";
import { TimerContext } from "../../context/TimerContext";
import { AuthContext } from "../../context/AuthContext";
import "react-calendar-heatmap/dist/styles.css";
import axios from "../../api/axios";

// SVG Icons for stats
const StatIcons = {
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Flame: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </svg>
  ),
  Trophy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0012 0V2z" />
    </svg>
  ),
};

const ReadingHeatmap = () => {
  const { streak, fetchStreak, timerError } = useContext(TimerContext);
  const { token } = useContext(AuthContext);
  const containerRef = useRef(null);
  const [tip, setTip] = useState(null);

  const fmtIST = (d) =>
    new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const todayIST = () =>
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  useEffect(() => {
    if (token) fetchStreak();
  }, [token]);

  const [dayTotals, setDayTotals] = useState({});
  const [maxTotal, setMaxTotal] = useState(0);
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 180);

  useEffect(() => {
    const from = new Date(start);
    from.setHours(0, 0, 0, 0);
    const to = new Date(end);
    to.setHours(23, 59, 59, 999);
    const fromStr = from.toISOString();
    const toStr = to.toISOString();
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(
          `/readingSessions?from=${encodeURIComponent(fromStr)}&to=${encodeURIComponent(toStr)}`
        );
        const totals = {};
        for (const s of res.data || []) {
          const dateSource = s.date || s.startTime;
          const key = dateSource
            ? new Date(dateSource).toLocaleDateString("en-CA", {
                timeZone: "Asia/Kolkata",
              })
            : "";
          if (!key) continue;
          totals[key] = (totals[key] || 0) + (Number(s.duration) || 0);
        }
        if (!cancelled) {
          setDayTotals(totals);
          const max = Object.values(totals).reduce((m, v) => Math.max(m, v), 0);
          setMaxTotal(max);
        }
      } catch (e) {
        // silent fail
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const values = useMemo(() => {
    return Object.entries(dayTotals).map(([date, total]) => ({
      date,
      count: total,
    }));
  }, [dayTotals]);

  const { totalActive, currentStreak, maxStreak } = useMemo(() => {
    if (!streak || streak.length === 0)
      return { totalActive: 0, currentStreak: 0, maxStreak: 0 };
    const activeDates = new Set(
      streak
        .filter((d) => d.isActive)
        .map((d) => (d.date ? fmtIST(d.date) : ""))
    );
    if (activeDates.size === 0)
      return { totalActive: 0, currentStreak: 0, maxStreak: 0 };

    const shiftIST = (str, deltaDays) => {
      const dt = new Date(str + "T00:00:00+05:30");
      dt.setDate(dt.getDate() + deltaDays);
      return dt.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    };

    const todayStr = todayIST();
    let cur = 0;
    let cursor = todayStr;
    while (activeDates.has(cursor)) {
      cur += 1;
      cursor = shiftIST(cursor, -1);
    }

    const sorted = Array.from(activeDates).sort();
    let max = 0;
    let run = 0;
    let prev = null;
    for (const s of sorted) {
      if (!prev || s !== shiftIST(prev, 1)) {
        run = 1;
      } else {
        run += 1;
      }
      if (run > max) max = run;
      prev = s;
    }
    return {
      totalActive: activeDates.size,
      currentStreak: cur,
      maxStreak: Math.max(max, cur),
    };
  }, [streak]);

  return (
    <div className="dd-heatmap" ref={containerRef}>
      {/* Header */}
      <div className="dd-heatmap__header">
        <h3 className="dd-heatmap__title">
          <span className="dd-heatmap__title-icon">
            <StatIcons.Calendar />
          </span>
          Activity Overview
        </h3>
        <div className="dd-heatmap__stats">
          <div className="dd-heatmap__stat">
            <span className="dd-heatmap__stat-icon dd-heatmap__stat-icon--days">
              <StatIcons.Calendar />
            </span>
            <div className="dd-heatmap__stat-content">
              <span className="dd-heatmap__stat-value">{totalActive}</span>
              <span className="dd-heatmap__stat-label">Active Days</span>
            </div>
          </div>
          <div className="dd-heatmap__stat">
            <span className="dd-heatmap__stat-icon dd-heatmap__stat-icon--streak">
              <StatIcons.Flame />
            </span>
            <div className="dd-heatmap__stat-content">
              <span className="dd-heatmap__stat-value">{currentStreak}</span>
              <span className="dd-heatmap__stat-label">Current Streak</span>
            </div>
          </div>
          <div className="dd-heatmap__stat">
            <span className="dd-heatmap__stat-icon dd-heatmap__stat-icon--max">
              <StatIcons.Trophy />
            </span>
            <div className="dd-heatmap__stat-content">
              <span className="dd-heatmap__stat-value">{maxStreak}</span>
              <span className="dd-heatmap__stat-label">Best Streak</span>
            </div>
          </div>
        </div>
      </div>

      {timerError && (
        <div className="dd-heatmap__error">{timerError}</div>
      )}

      {/* Heatmap */}
      <div className="dd-heatmap__chart">
        <CalendarHeatmap
          startDate={start}
          endDate={end}
          values={values}
          gutterSize={2}
          showWeekdayLabels={false}
          showMonthLabels={true}
          classForValue={(v) => {
            if (!v || !v.count) return "dd-hc dd-hc-0";
            const minutes = (v.count || 0) / 60;
            if (minutes <= 0) return "dd-hc dd-hc-0";
            if (minutes <= 15) return "dd-hc dd-hc-1";
            if (minutes <= 30) return "dd-hc dd-hc-2";
            if (minutes <= 60) return "dd-hc dd-hc-3";
            return "dd-hc dd-hc-4";
          }}
          titleForValue={() => null}
          transformDayElement={(el, v) =>
            React.cloneElement(el, {
              onMouseEnter: (e) => {
                if (!v?.date) return;
                const x = e.clientX + 12;
                const y = e.clientY + 12;
                const d = new Date(v.date + "T00:00:00");
                const formatted = d.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  timeZone: "Asia/Kolkata",
                });
                const mins = v?.count ? Math.round((v.count || 0) / 60) : 0;
                const duration = mins > 0 ? `${mins} min focused` : "No activity";
                setTip({ x, y, date: formatted, duration });
              },
              onMouseMove: (e) => {
                if (!v?.date) return;
                const x = e.clientX + 12;
                const y = e.clientY + 12;
                setTip((prev) => prev ? { ...prev, x, y } : null);
              },
              onMouseLeave: () => setTip(null),
            })
          }
        />
      </div>

      {/* Legend */}
      <div className="dd-heatmap__legend">
        <span className="dd-heatmap__legend-label">Less</span>
        <div className="dd-heatmap__legend-scale">
          <span className="dd-heatmap__legend-box dd-hc-0" />
          <span className="dd-heatmap__legend-box dd-hc-1" />
          <span className="dd-heatmap__legend-box dd-hc-2" />
          <span className="dd-heatmap__legend-box dd-hc-3" />
          <span className="dd-heatmap__legend-box dd-hc-4" />
        </div>
        <span className="dd-heatmap__legend-label">More</span>
      </div>

      {/* Tooltip */}
      {tip &&
        createPortal(
          <div className="dd-heatmap__tooltip" style={{ left: tip.x, top: tip.y }}>
            <div className="dd-heatmap__tooltip-date">{tip.date}</div>
            <div className="dd-heatmap__tooltip-duration">{tip.duration}</div>
          </div>,
          document.body
        )}

      <style>{`
        .dd-heatmap {
          padding: 20px;
          background: var(--dd-bg-card-solid, #FFFFFF);
          border: 1px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 16px;
        }

        .dd-heatmap__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .dd-heatmap__title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--dd-text-primary, #0F172A);
        }

        .dd-heatmap__title-icon {
          width: 20px;
          height: 20px;
          color: var(--dd-primary-500, #3B82F6);
        }

        .dd-heatmap__title-icon svg {
          width: 100%;
          height: 100%;
        }

        .dd-heatmap__stats {
          display: flex;
          gap: 24px;
        }

        .dd-heatmap__stat {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dd-heatmap__stat-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          padding: 8px;
        }

        .dd-heatmap__stat-icon svg {
          width: 100%;
          height: 100%;
        }

        .dd-heatmap__stat-icon--days {
          background: rgba(59, 130, 246, 0.1);
          color: #3B82F6;
        }

        .dd-heatmap__stat-icon--streak {
          background: rgba(245, 158, 11, 0.1);
          color: #F59E0B;
        }

        .dd-heatmap__stat-icon--max {
          background: rgba(139, 92, 246, 0.1);
          color: #8B5CF6;
        }

        .dd-heatmap__stat-content {
          display: flex;
          flex-direction: column;
        }

        .dd-heatmap__stat-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--dd-text-primary, #0F172A);
          line-height: 1.2;
        }

        .dd-heatmap__stat-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--dd-text-muted, #64748B);
        }

        .dd-heatmap__error {
          padding: 12px 16px;
          margin-bottom: 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          color: #DC2626;
          font-size: 14px;
        }

        .dd-heatmap__chart {
          margin-bottom: 16px;
        }

        .dd-heatmap__chart .react-calendar-heatmap {
          width: 100%;
        }

        .dd-heatmap__chart .react-calendar-heatmap text {
          font-size: 10px;
          fill: var(--dd-text-muted, #64748B);
        }

        /* Heatmap cells */
        .dd-hc {
          rx: 3;
          ry: 3;
          transition: all 0.15s ease;
        }

        .dd-hc:hover {
          stroke: var(--dd-primary-400, #60A5FA);
          stroke-width: 2;
        }

        .dd-hc-0 {
          fill: var(--dd-bg-secondary, #F1F5F9);
        }

        .dd-hc-1 {
          fill: rgba(59, 130, 246, 0.25);
        }

        .dd-hc-2 {
          fill: rgba(59, 130, 246, 0.5);
        }

        .dd-hc-3 {
          fill: rgba(59, 130, 246, 0.75);
        }

        .dd-hc-4 {
          fill: #3B82F6;
        }

        /* Legend */
        .dd-heatmap__legend {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }

        .dd-heatmap__legend-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--dd-text-muted, #64748B);
        }

        .dd-heatmap__legend-scale {
          display: flex;
          gap: 4px;
        }

        .dd-heatmap__legend-box {
          width: 14px;
          height: 14px;
          border-radius: 3px;
        }

        /* Tooltip */
        .dd-heatmap__tooltip {
          position: fixed;
          z-index: 10000;
          padding: 10px 14px;
          background: var(--dd-bg-dark, #0F172A);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          pointer-events: none;
          animation: dd-tooltip-fade 0.15s ease;
        }

        @keyframes dd-tooltip-fade {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dd-heatmap__tooltip-date {
          font-size: 13px;
          font-weight: 600;
          color: #F8FAFC;
          margin-bottom: 2px;
        }

        .dd-heatmap__tooltip-duration {
          font-size: 12px;
          color: #94A3B8;
        }

        /* Dark theme */
        [data-theme="dark"] .dd-heatmap {
          background: var(--dd-bg-secondary, #1E293B);
          border-color: var(--dd-border-medium, #334155);
        }

        [data-theme="dark"] .dd-hc-0 {
          fill: var(--dd-bg-tertiary, #334155);
        }

        /* Responsive */
        @media (max-width: 640px) {
          .dd-heatmap__header {
            flex-direction: column;
          }

          .dd-heatmap__stats {
            width: 100%;
            justify-content: space-between;
          }

          .dd-heatmap__stat-content {
            display: none;
          }

          .dd-heatmap__stat-icon {
            width: 42px;
            height: 42px;
          }
        }
      `}</style>
    </div>
  );
};

export default ReadingHeatmap;
