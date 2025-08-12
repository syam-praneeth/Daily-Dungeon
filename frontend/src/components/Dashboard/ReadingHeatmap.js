import React, { useContext, useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import CalendarHeatmap from "react-calendar-heatmap";
import { TimerContext } from "../../context/TimerContext";
import { AuthContext } from "../../context/AuthContext";
import "react-calendar-heatmap/dist/styles.css";
import axios from "../../api/axios";

const ReadingHeatmap = () => {
  const { streak, fetchStreak, timerError } = useContext(TimerContext);
  const { token } = useContext(AuthContext);
  const containerRef = useRef(null);
  const [tip, setTip] = useState(null); // { x, y, text }

  // Helpers to format dates in IST (Asia/Kolkata)
  const fmtIST = (d) =>
    new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
  const todayIST = () =>
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  useEffect(() => {
    if (token) fetchStreak();
  }, [token]);
  // Build values from per-day total reading seconds for intensity mapping
  const [dayTotals, setDayTotals] = useState({}); // { 'YYYY-MM-DD': totalSeconds }
  const [maxTotal, setMaxTotal] = useState(0);
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 180); // show ~6 months for a wide horizontal strip

  useEffect(
    () => {
      // fetch sessions in range and aggregate durations per day (IST-aware)
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
            `/readingSessions?from=${encodeURIComponent(
              fromStr
            )}&to=${encodeURIComponent(toStr)}`
          );
          const totals = {};
          for (const s of res.data || []) {
            // Use IST day string to match backend streak/day semantics
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
            const max = Object.values(totals).reduce(
              (m, v) => Math.max(m, v),
              0
            );
            setMaxTotal(max);
          }
        } catch (e) {
          // keep quiet; the heatmap will just render inactive
        }
      })();
      return () => {
        cancelled = true;
      };
    },
    [
      /* start/end are constants in component lifecycle */
    ]
  );

  const values = useMemo(() => {
    // Convert totals map to values array expected by CalendarHeatmap
    return Object.entries(dayTotals).map(([date, total]) => ({
      date,
      count: total,
    }));
  }, [dayTotals]);
  // Compute totals and streaks
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

    // helper to shift an IST date string by N days and return IST YYYY-MM-DD
    const shiftIST = (str, deltaDays) => {
      const dt = new Date(str + "T00:00:00+05:30");
      dt.setDate(dt.getDate() + deltaDays);
      return dt.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    };

    // Current streak: consecutive IST days ending today
    const todayStr = todayIST();
    let cur = 0;
    let cursor = todayStr;
    while (activeDates.has(cursor)) {
      cur += 1;
      cursor = shiftIST(cursor, -1);
    }

    // Max streak: longest consecutive run across all active days
    const sorted = Array.from(activeDates).sort(); // YYYY-MM-DD sorts lexicographically
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
    <div
      className="heatmap-sm"
      style={{ margin: "1rem 0", position: "relative" }}
      ref={containerRef}
    >
      <div
        className="row"
        style={{ justifyContent: "space-between", marginBottom: 8 }}
      >
        <strong>Reading Streak</strong>
        <div className="row" style={{ gap: 12 }}>
          <span title="Total Active Days">
            ✅ Total Active Days : {totalActive}
          </span>
          <span title="Current Streak">
            {" "}
            | 🔥 Current Streak : {currentStreak}
          </span>
          <span title="Max Streak"> | 🏆 Max Streak : {maxStreak}</span>
          <span style={{ marginRight: "1px" }}></span>
        </div>
      </div>
      {timerError ? (
        <div className="error" style={{ marginBottom: 8 }}>
          {timerError}
        </div>
      ) : null}
      <CalendarHeatmap
        startDate={start}
        endDate={end}
        values={values}
        gutterSize={0}
        showWeekdayLabels={false}
        showMonthLabels={true}
        classForValue={(v) => {
          if (!v || !v.count) return "hc hc-0";
          const minutes = (v.count || 0) / 60;
          if (minutes <= 0) return "hc hc-0";
          if (minutes <= 15) return "hc hc-1"; // very light
          if (minutes <= 30) return "hc hc-2";
          if (minutes <= 60) return "hc hc-3";
          return "hc hc-4"; // 1hr+
        }}
        titleForValue={() => null}
        transformDayElement={(el, v) =>
          React.cloneElement(el, {
            onMouseEnter: (e) => {
              if (!v?.date) return;
              const x = e.clientX + 8;
              const y = e.clientY + 8;
              const d = new Date(v.date + "T00:00:00");
              const day = d.toLocaleString("en-GB", {
                day: "numeric",
                timeZone: "Asia/Kolkata",
              });
              const mon = d
                .toLocaleString("en-GB", {
                  month: "short",
                  timeZone: "Asia/Kolkata",
                })
                .toLowerCase();
              const yr = d.toLocaleString("en-GB", {
                year: "numeric",
                timeZone: "Asia/Kolkata",
              });
              const mins = v?.count ? Math.round((v.count || 0) / 60) : 0;
              const extra = mins > 0 ? ` — ${mins}m` : "";
              setTip({ x, y, text: `${day} ${mon} ${yr}${extra}` });
            },
            onMouseMove: (e) => {
              if (!v?.date) return;
              const x = e.clientX + 8;
              const y = e.clientY + 8;
              const d = new Date(v.date + "T00:00:00");
              const day = d.toLocaleString("en-GB", {
                day: "numeric",
                timeZone: "Asia/Kolkata",
              });
              const mon = d
                .toLocaleString("en-GB", {
                  month: "short",
                  timeZone: "Asia/Kolkata",
                })
                .toLowerCase();
              const yr = d.toLocaleString("en-GB", {
                year: "numeric",
                timeZone: "Asia/Kolkata",
              });
              const mins = v?.count ? Math.round((v.count || 0) / 60) : 0;
              const extra = mins > 0 ? ` — ${mins}m` : "";
              setTip({ x, y, text: `${day} ${mon} ${yr}${extra}` });
            },
            onMouseLeave: () => setTip(null),
          })
        }
      />
      {tip &&
        createPortal(
          <div
            className="heatmap-tooltip"
            style={{ left: tip.x, top: tip.y, position: "fixed" }}
            role="tooltip"
          >
            {tip.text}
          </div>,
          document.body
        )}
    </div>
  );
};

export default ReadingHeatmap;
