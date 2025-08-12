import React, { useContext } from "react";
import { TimetableContext } from "../../context/TimetableContext";

const TimetableOverview = () => {
  const { entries } = useContext(TimetableContext);
  const today = new Date().toLocaleString("en-US", { weekday: "long" });
  const todayEntries = entries.filter((e) => (e.dayOfWeek || e.day) === today);
  return (
    <div style={{ margin: "1rem 0" }}>
      <h4>Today's Timetable</h4>
      <ul>
        {todayEntries.map((e) => (
          <li key={e._id}>
            {e.startTime} - {e.endTime}: {e.activityName || e.subject}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TimetableOverview;
