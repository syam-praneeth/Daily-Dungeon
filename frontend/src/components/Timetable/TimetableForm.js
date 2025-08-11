import React, { useState, useContext } from "react";
import { TimetableContext } from "../../context/TimetableContext";

const TimetableForm = () => {
  const { addEntry } = useContext(TimetableContext);
  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [subject, setSubject] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addEntry({ day, startTime, endTime, subject });
    setStartTime("");
    setEndTime("");
    setSubject("");
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
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </label>
        <label>
          <span>End</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
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
      <button className="btn" type="submit">
        Add Entry
      </button>
    </form>
  );
};

export default TimetableForm;
