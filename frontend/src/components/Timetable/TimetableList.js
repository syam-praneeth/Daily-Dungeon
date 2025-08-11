import React, { useContext } from "react";
import { TimetableContext } from "../../context/TimetableContext";

const TimetableList = ({ items }) => {
  const { entries, deleteEntry } = useContext(TimetableContext);
  const list = items || entries;
  return (
    <ul className="list">
      {list.map((entry) => (
        <li
          key={entry._id}
          className="item"
          style={{ justifyContent: "space-between" }}
        >
          <div>
            <strong>{entry.day || entry.dayOfWeek}</strong> {entry.startTime}-
            {entry.endTime}: {entry.subject || entry.activityName}
          </div>
          <button className="btn-danger" onClick={() => deleteEntry(entry._id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TimetableList;
