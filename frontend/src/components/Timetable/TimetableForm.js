import React, { useState, useContext, useEffect, useMemo, useRef } from "react";
import { TimetableContext } from "../../context/TimetableContext";

const TimetableForm = () => {
  const { addEntry, entries } = useContext(TimetableContext);
  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState(30); // minutes
  const [customEnd, setCustomEnd] = useState(false);
  const [showAllSlots, setShowAllSlots] = useState(false);
  const [is12h, setIs12h] = useState(() => {
    try {
      const v = localStorage.getItem("timetable_is12h");
      return v === "true";
    } catch (_) {
      return false;
    }
  });
  const [recentSubjects, setRecentSubjects] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("timetable_recentSubjects") || "[]"
      );
      return Array.isArray(saved) ? saved : [];
    } catch (_) {
      return [];
    }
  });
  const [chainNext, setChainNext] = useState(() => {
    try {
      const v = localStorage.getItem("timetable_chainNext");
      return v === null ? true : v === "true"; // default true
    } catch (_) {
      return true;
    }
  });
  const [lastEnd, setLastEnd] = useState("");
  // unified interface: manual input + quick slot pills (no mode toggle)

  // Helper: get next half-hour slot
  const nextHalfHour = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    const m = now.getMinutes();
    if (m < 30) now.setMinutes(30);
    else {
      now.setHours(now.getHours() + 1);
      now.setMinutes(0);
    }
    return now.toTimeString().slice(0, 5);
  };

  const addMinutes = (hhmm, mins) => {
    if (!hhmm) return "";
    const [h, m] = hhmm.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m + mins, 0, 0);
    return d.toTimeString().slice(0, 5);
  };

  // Initialize times on first render
  useEffect(() => {
    const start = nextHalfHour();
    setStartTime(start);
    setEndTime(addMinutes(start, duration));
  }, []);

  // Persist toggles
  useEffect(() => {
    try {
      localStorage.setItem("timetable_is12h", String(is12h));
    } catch (_) {}
  }, [is12h]);
  useEffect(() => {
    try {
      localStorage.setItem("timetable_chainNext", String(chainNext));
    } catch (_) {}
  }, [chainNext]);
  useEffect(() => {
    try {
      localStorage.setItem(
        "timetable_recentSubjects",
        JSON.stringify(recentSubjects)
      );
    } catch (_) {}
  }, [recentSubjects]);

  // Recalculate end time when startTime or duration changes, unless user manually edited end
  useEffect(() => {
    if (!customEnd && startTime) setEndTime(addMinutes(startTime, duration));
  }, [startTime, duration, customEnd]);

  const onChangeEnd = (v) => {
    setEndTime(v);
    setCustomEnd(true);
    // try to infer duration (round to nearest from presets)
    if (startTime && v > startTime) {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = v.split(":").map(Number);
      const mins = eh * 60 + em - (sh * 60 + sm);
      if (mins > 0) setDuration(mins);
    }
  };

  const invalid = startTime && endTime && endTime <= startTime;
  const preview = subject
    ? `${day} ${startTime || "--:--"}-${endTime || "--:--"} • ${subject}`
    : `${day} ${startTime || "--:--"}-${endTime || "--:--"}`;

  // Day specific entries & slot boundaries
  const dayEntries = useMemo(
    () => entries.filter((e) => (e.dayOfWeek || e.day) === day),
    [entries, day]
  );
  const overlaps = useMemo(() => {
    if (!startTime || !endTime) return [];
    return dayEntries.filter(
      (e) =>
        e.startTime &&
        e.endTime &&
        startTime < e.endTime &&
        endTime > e.startTime
    );
  }, [startTime, endTime, dayEntries]);
  const overlapInvalid = overlaps.length > 0;
  const dayMin = useMemo(() => {
    const starts = dayEntries
      .map((e) => e.startTime)
      .filter(Boolean)
      .sort();
    return starts[0] || "05:00";
  }, [dayEntries]);
  const dayMax = useMemo(() => {
    const ends = dayEntries
      .map((e) => e.endTime)
      .filter(Boolean)
      .sort();
    return ends[ends.length - 1] || "22:30";
  }, [dayEntries]);
  const slotTimes = useMemo(() => {
    const out = [];
    const [sH, sM] = dayMin.split(":").map(Number);
    const [eH, eM] = dayMax.split(":").map(Number);
    let t = sH * 60 + sM;
    const end = eH * 60 + eM;
    while (t <= end) {
      const h = Math.floor(t / 60);
      const m = t % 60;
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      t += 30;
    }
    return out;
  }, [dayMin, dayMax]);

  // keep reference to boundaries in UI
  const boundaryLabel = `${dayMin}–${dayMax}`;

  // helper used by slot pills
  const pickStart = (t) => {
    setStartTime(t);
    setCustomEnd(false);
  };

  // Keyboard navigation refs
  const timeRefs = useRef([]);
  const durationRefs = useRef([]);

  const handleTimeKey = (e) => {
    const list = showAllSlots ? slotTimes : slotTimes.slice(0, 20);
    const idx = list.indexOf(startTime);
    if (["ArrowRight", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      const next = list[(idx + 1) % list.length];
      pickStart(next);
      const ref = timeRefs.current[list.indexOf(next)];
      if (ref) ref.focus();
    } else if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      const prev = list[(idx - 1 + list.length) % list.length];
      pickStart(prev);
      const ref = timeRefs.current[list.indexOf(prev)];
      if (ref) ref.focus();
    }
  };

  const handleDurationKey = (e) => {
    const list = durationOptions;
    const idx = list.indexOf(duration);
    if (["ArrowRight", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      const next = list[(idx + 1) % list.length];
      setDuration(next);
      setCustomEnd(false);
      const ref = durationRefs.current[list.indexOf(next)];
      if (ref) ref.focus();
    } else if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      const prev = list[(idx - 1 + list.length) % list.length];
      setDuration(prev);
      setCustomEnd(false);
      const ref = durationRefs.current[list.indexOf(prev)];
      if (ref) ref.focus();
    }
  };
  const durationOptions = [15, 30, 45, 60, 90, 120];

  // Format time label if 12h toggle active
  const formatLabel = (t) => {
    if (!is12h) return t;
    const [h, m] = t.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const hh = h % 12 === 0 ? 12 : h % 12;
    return `${hh}:${m.toString().padStart(2, "0")} ${suffix}`;
  };

  const displayPreview = is12h
    ? preview.replace(/(\b\d{2}:\d{2}\b)/g, (match) => formatLabel(match))
    : preview;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (invalid || overlapInvalid) return;
    await addEntry({ day, startTime, endTime, subject });
    // maintain list of recent subjects
    if (subject.trim()) {
      setRecentSubjects((prev) => {
        const next = [
          subject.trim(),
          ...prev.filter((s) => s !== subject.trim()),
        ];
        return next.slice(0, 8);
      });
    }
    setLastEnd(endTime);
    // chain next start from previous end if enabled
    const newStart = chainNext && endTime ? endTime : nextHalfHour();
    setStartTime(newStart);
    setEndTime(addMinutes(newStart, duration));
    setSubject("");
    setCustomEnd(false);
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="grid"
      style={{ gap: 8, marginBottom: 10 }}
    >
      <select value={day} onChange={(e) => setDay(e.target.value)}>
        {[
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          className="time-pill"
          onClick={() => setIs12h((v) => !v)}
          aria-pressed={is12h}
        >
          {is12h ? "24h" : "12h"}
        </button>
        <button
          type="button"
          className={`time-pill ${chainNext ? "active" : ""}`}
          onClick={() => setChainNext((c) => !c)}
          aria-pressed={chainNext}
        >
          Chain Next
        </button>
        <button
          type="button"
          className="time-pill"
          onClick={() => setShowAllSlots((s) => !s)}
          aria-pressed={showAllSlots}
        >
          {showAllSlots ? "Less Slots" : "More Slots"}
        </button>
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))",
          gap: 8,
        }}
      >
        <label>
          <span>Start</span>
          <input
            type="time"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              setCustomEnd(false);
            }}
            required
          />
        </label>
        <label>
          <span>End</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => onChangeEnd(e.target.value)}
            required
          />
        </label>
        <label>
          <span>Duration</span>
          <select
            value={duration}
            onChange={(e) => {
              setDuration(Number(e.target.value));
              setCustomEnd(false);
            }}
          >
            {durationOptions.map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
            {customEnd && (
              <option value={duration}>{duration} min (custom)</option>
            )}
          </select>
        </label>
        <label>
          <span>Subject/Activity</span>
          <input
            placeholder="Subject/Activity"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </label>
      </div>
      <div
        role="listbox"
        aria-label="Start time slots"
        tabIndex={0}
        onKeyDown={handleTimeKey}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          maxHeight: showAllSlots ? 180 : undefined,
          overflowY: showAllSlots ? "auto" : "visible",
          paddingRight: showAllSlots ? 4 : 0,
          outline: "none",
        }}
      >
        {(showAllSlots ? slotTimes : slotTimes.slice(0, 20)).map((t, i) => (
          <button
            key={t}
            ref={(el) => (timeRefs.current[i] = el)}
            type="button"
            className={`time-pill ${startTime === t ? "active" : ""}`}
            onClick={() => pickStart(t)}
            aria-selected={startTime === t}
            role="option"
          >
            {formatLabel(t)}
          </button>
        ))}
        <button
          type="button"
          className="time-pill"
          onClick={() => pickStart(nextHalfHour())}
          title="Set to next half hour"
        >
          Now →
        </button>
      </div>
      <div style={{ fontSize: 10, color: "#64748b" }}>
        Day range: {boundaryLabel}
      </div>
      <div
        role="listbox"
        aria-label="Durations"
        tabIndex={0}
        onKeyDown={handleDurationKey}
        style={{ display: "flex", gap: 6, flexWrap: "wrap", outline: "none" }}
      >
        {durationOptions.map((m, i) => {
          const bucket = m <= 30 ? "short" : m <= 60 ? "medium" : "long";
          return (
            <button
              key={m}
              ref={(el) => (durationRefs.current[i] = el)}
              type="button"
              className={`time-pill duration-pill ${bucket} ${
                duration === m ? "active" : ""
              }`}
              onClick={() => {
                setDuration(m);
                setCustomEnd(false);
              }}
              aria-selected={duration === m}
              role="option"
            >
              {m}m
            </button>
          );
        })}
      </div>
      {recentSubjects.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {recentSubjects.map((s) => (
            <button
              key={s}
              type="button"
              className={`time-pill ${subject === s ? "active" : ""}`}
              onClick={() => setSubject(s)}
              title="Use recent subject"
            >
              {s.length > 18 ? s.slice(0, 16) + "…" : s}
            </button>
          ))}
        </div>
      )}
      <div
        style={{
          fontSize: 12,
          color: invalid || overlapInvalid ? "#dc2626" : "#64748b",
        }}
      >
        {invalid
          ? "End time must be after start time"
          : overlapInvalid
          ? `Overlap with ${overlaps.length} entr${
              overlaps.length === 1 ? "y" : "ies"
            }`
          : displayPreview}
      </div>
      <button
        className="btn"
        type="submit"
        disabled={invalid || overlapInvalid}
      >
        {invalid
          ? "Fix Time"
          : overlapInvalid
          ? "Resolve Overlap"
          : "Add Entry"}
      </button>
    </form>
  );
};

export default TimetableForm;
