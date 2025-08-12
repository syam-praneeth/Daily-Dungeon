import React, { useContext, useEffect, useState } from "react";
import JournalForm from "../components/Journal/JournalForm";
import JournalList from "../components/Journal/JournalList";
import { JournalContext } from "../context/JournalContext";

const JournalPage = () => {
  const { journals, journalError } = useContext(JournalContext);
  const [filter, setFilter] = useState("");
  const [filtered, setFiltered] = useState(journals);

  useEffect(() => {
    const toISTDay = (d) =>
      new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    setFiltered(journals.filter((j) => !filter || toISTDay(j.date) === filter));
  }, [filter, journals]);

  return (
    <div className="container">
      <h2>Daily Journal</h2>
      <div className="soft-section accent-amber">
        <JournalForm />
      </div>
      {journalError && <div className="error">{journalError}</div>}
      <div className="toolbar">
        <label>
          Filter by date{" "}
          <input
            type="date"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </label>
      </div>
      <div className="soft-section accent-amber">
        <JournalList items={filtered} />
      </div>
    </div>
  );
};

export default JournalPage;
