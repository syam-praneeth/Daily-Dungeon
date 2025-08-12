import React, { useContext, useMemo, useState } from "react";
import { JournalContext } from "../../context/JournalContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MarkdownEditor from "./MarkdownEditor";

const JournalList = ({ items }) => {
  const { journals, deleteJournal, updateJournal } = useContext(JournalContext);
  const list = items || journals;
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState("");

  const beginEdit = (j) => {
    setEditingId(j._id);
    setEditText(j.content ?? j.text ?? "");
    const d = j.date ? new Date(j.date) : new Date();
    const ist = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    setEditDate(ist);
  };

  const normalizeMd = (md) => {
    if (!md) return "";
    const parts = md.split(/(```[\s\S]*?```)/g);
    const cleaned = parts
      .map((part) => {
        if (part.startsWith("```")) return part;
        let s = part.replace(/\r\n/g, "\n");
        s = s.replace(/[ \t]+\n/g, "\n");
        s = s.replace(/\n{3,}/g, "\n\n");
        s = s.replace(/\n{2,}(?=(?:#{1,6}\s|[-*]\s|\d+\.\s|>\s))/g, "\n");
        s = s.replace(/^(#{1,6} .*)\n{2,}/gm, "$1\n");
        return s;
      })
      .join("");
    return cleaned.trim();
  };

  const saveEdit = async (id) => {
    await updateJournal(id, {
      content: editText,
      date: new Date(editDate).toISOString(),
    });
    setEditingId(null);
    setEditText("");
    setEditDate("");
  };

  return (
    <ul className="task-list">
      {list.map((journal) => {
        const isEditing = editingId === journal._id;
        return (
          <li
            key={journal._id}
            className="soft-section"
            style={{ width: "100%", boxSizing: "border-box" }}
          >
            {/* Header row with date and actions */}
            <div
              className="row"
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <div>
                <strong>{journal.date?.slice(0, 10)}</strong>
                {journal.mood && <span className="pill">{journal.mood}</span>}
                {journal.tags?.length ? (
                  <span className="muted"> #{journal.tags.join(" #")}</span>
                ) : null}
              </div>
              {!isEditing && (
                <div className="row" style={{ gap: 6 }}>
                  <button
                    className="btn-outline amber"
                    onClick={() => beginEdit(journal)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-outline red"
                    onClick={() => deleteJournal(journal._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Content or editor */}
            {!isEditing ? (
              <div
                className="soft-section markdown-preview"
                style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {normalizeMd(journal.content ?? journal.text)}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="grid" style={{ gap: 8 }}>
                <label>
                  <span>Date</span>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </label>
                <MarkdownEditor value={editText} onChange={setEditText} />
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn" onClick={() => saveEdit(journal._id)}>
                    Save
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default JournalList;
