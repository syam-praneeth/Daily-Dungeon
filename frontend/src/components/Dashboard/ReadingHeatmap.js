import React, { useContext, useEffect, useMemo } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import { TimerContext } from "../../context/TimerContext";
import "react-calendar-heatmap/dist/styles.css";

const ReadingHeatmap = () => {
  const { streak, fetchStreak } = useContext(TimerContext);
  useEffect(() => {
    fetchStreak();
  }, []);
  const values = streak.map((e) => ({
    date: (e.date || "").slice(0, 10),
    count: e.isActive ? 1 : 0,
  }));
  // Compute totals and streaks
  const { totalActive, currentStreak, maxStreak } = useMemo(() => {
    if (!streak || streak.length === 0)
      return { totalActive: 0, currentStreak: 0, maxStreak: 0 };
    const activeDates = new Set(
      streak.filter((d) => d.isActive).map((d) => (d.date || "").slice(0, 10))
    );
    const dayToNum = (s) => Math.floor(new Date(s).getTime() / 86400000);
    if (activeDates.size === 0)
      return { totalActive: 0, currentStreak: 0, maxStreak: 0 };
    // Current streak: consecutive days ending today
    const todayStr = new Date().toISOString().slice(0, 10);
    let cur = 0;
    // If today isn't active, current streak is 0
    if (activeDates.has(todayStr)) {
      let d = dayToNum(todayStr);
      while (
        activeDates.has(new Date(d * 86400000).toISOString().slice(0, 10))
      ) {
        cur += 1;
        d -= 1;
      }
    }
    // Max streak: longest consecutive run
    const days = Array.from(activeDates)
      .map(dayToNum)
      .sort((a, b) => a - b);
    let max = 1;
    let run = 1;
    for (let i = 1; i < days.length; i++) {
      if (days[i] === days[i - 1] + 1) {
        run += 1;
        if (run > max) max = run;
      } else {
        run = 1;
      }
    }
    return {
      totalActive: activeDates.size,
      currentStreak: cur,
      maxStreak: Math.max(max, cur),
    };
  }, [streak]);
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 180); // show ~6 months for a wide horizontal strip
  return (
    <div className="heatmap-sm" style={{ margin: "1rem 0" }}>
      <div
        className="row"
        style={{ justifyContent: "space-between", marginBottom: 8 }}
      >
        <strong>Reading Streak</strong>
        <div className="row" style={{ gap: 12 }}>
          <span title="Total Active Days">✅ {totalActive}</span>
          <span title="Current Streak">🔥 {currentStreak}</span>
          <span title="Max Streak">🏆 {maxStreak}</span>
        </div>
      </div>
      <CalendarHeatmap
        startDate={start}
        endDate={end}
        values={values}
        gutterSize={1}
        showWeekdayLabels={false}
        showMonthLabels={false}
        classForValue={(v) => {
          if (!v || !v.count) return "hc hc-0";
          // single level for active days; can be expanded to multiple levels if duration count added
          return "hc hc-4";
        }}
        tooltipDataAttrs={(v) => ({
          "data-tip": `${v.date}: ${v.count ? "Active" : "No activity"}`,
        })}
      />
    </div>
  );
};

export default ReadingHeatmap;
