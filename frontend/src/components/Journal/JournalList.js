import React, { useContext } from "react";
import { JournalContext } from "../../context/JournalContext";

const JournalList = ({ items }) => {
  const { journals, deleteJournal } = useContext(JournalContext);
  const list = items || journals;
  return (
    <ul className="list">
      {list.map((journal) => (
        <li
          key={journal._id}
          className="item"
          style={{ justifyContent: "space-between" }}
        >
          <div>
            <strong>{journal.date?.slice(0, 10)}</strong>:{" "}
            {journal.content || journal.text}
            {journal.mood && <span className="pill">{journal.mood}</span>}
            {journal.tags?.length ? (
              <span className="muted"> #{journal.tags.join(" #")}</span>
            ) : null}
          </div>
          <button
            className="btn-danger"
            onClick={() => deleteJournal(journal._id)}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
};

export default JournalList;
