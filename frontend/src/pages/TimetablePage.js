import React, { useContext } from "react";
import TimetableForm from "../components/Timetable/TimetableForm";
import TimetableList from "../components/Timetable/TimetableList";
import { TimetableContext } from "../context/TimetableContext";

const TimetablePage = () => {
  const { entries, timetableError } = useContext(TimetableContext);
  return (
    <div className="container">
      <h2>Timetable</h2>
      <div className="soft-section accent-purple">
        <TimetableForm />
      </div>
      {timetableError && <div className="error">{timetableError}</div>}
      <div className="soft-section accent-purple">
        <TimetableList items={entries} />
      </div>
    </div>
  );
};

export default TimetablePage;
