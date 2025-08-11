import React, { useState, useContext } from "react";
import { JournalContext } from "../../context/JournalContext";

const JournalForm = () => {
  const { addJournal } = useContext(JournalContext);
  const [text, setText] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addJournal({ date, text });
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid"
      style={{ gap: 8, marginBottom: 10 }}
    >
      <label>
        <span>Date</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <label>
        <span>Entry</span>
        <textarea
          placeholder="Write your journal..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </label>
      <button className="btn" type="submit">
        Add Entry
      </button>
    </form>
  );
};

export default JournalForm;
