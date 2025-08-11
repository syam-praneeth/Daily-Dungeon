import React, { useContext, useEffect, useState } from "react";
import JournalForm from "../components/Journal/JournalForm";
import JournalList from "../components/Journal/JournalList";
import { JournalContext } from "../context/JournalContext";

const JournalPage = () => {
  const { journals } = useContext(JournalContext);
  const [filter, setFilter] = useState("");
  const [filtered, setFiltered] = useState(journals);

  useEffect(() => {
    setFiltered(
      journals.filter((j) => !filter || j.date.slice(0, 10) === filter)
    );
  }, [filter, journals]);

  return (
    <div className="container">
      <h2>Daily Journal</h2>
      <div className="card">
        <JournalForm />
      </div>
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
      <div className="card">
        <JournalList items={filtered} />
      </div>
    </div>
  );
};

export default JournalPage;
