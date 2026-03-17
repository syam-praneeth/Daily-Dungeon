import React, { useContext, useState } from "react";
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
  const [expandedId, setExpandedId] = useState(null);

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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getMoodIcon = (mood) => {
    const moods = {
      happy: "😊",
      sad: "😢",
      excited: "🤩",
      anxious: "😰",
      calm: "😌",
      angry: "😠",
      tired: "😴",
      focused: "🎯",
      grateful: "🙏",
      inspired: "💡",
    };
    return moods[mood?.toLowerCase()] || "📝";
  };

  const getPreview = (content) => {
    const text = (content || "").replace(/[#*`_\[\]]/g, "").trim();
    return text.length > 100 ? text.slice(0, 100) + "..." : text;
  };

  return (
    <div className="dd-journal-list">
      {list.map((journal, index) => {
        const isEditing = editingId === journal._id;
        const isExpanded = expandedId === journal._id;
        const content = journal.content ?? journal.text ?? "";

        return (
          <div
            key={journal._id}
            className={`dd-journal-item ${isEditing ? "editing" : ""}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Header */}
            <div className="dd-journal-header">
              <div className="dd-journal-meta">
                <span className="dd-journal-icon">
                  {getMoodIcon(journal.mood)}
                </span>
                <div className="dd-journal-info">
                  <span className="dd-journal-date">
                    {formatDate(journal.date)}
                  </span>
                  {journal.mood && (
                    <span className="dd-journal-mood">{journal.mood}</span>
                  )}
                </div>
              </div>

              {!isEditing && (
                <div className="dd-journal-actions">
                  <button
                    className="dd-journal-action expand"
                    onClick={() => setExpandedId(isExpanded ? null : journal._id)}
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? "▲" : "▼"}
                  </button>
                  <button
                    className="dd-journal-action edit"
                    onClick={() => beginEdit(journal)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="dd-journal-action delete"
                    onClick={() => deleteJournal(journal._id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>

            {/* Tags */}
            {journal.tags?.length > 0 && (
              <div className="dd-journal-tags">
                {journal.tags.map((tag, i) => (
                  <span key={i} className="dd-journal-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            {!isEditing ? (
              <div className={`dd-journal-content ${isExpanded ? "expanded" : ""}`}>
                {isExpanded ? (
                  <div className="dd-journal-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {normalizeMd(content)}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="dd-journal-preview">{getPreview(content)}</p>
                )}
              </div>
            ) : (
              <div className="dd-journal-edit-form">
                <div className="dd-journal-edit-field">
                  <label className="dd-journal-edit-label">
                    <span>📅</span> Date
                  </label>
                  <input
                    type="date"
                    className="dd-journal-edit-input"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
                <div className="dd-journal-edit-field">
                  <label className="dd-journal-edit-label">
                    <span>📝</span> Content
                  </label>
                  <MarkdownEditor value={editText} onChange={setEditText} />
                </div>
                <div className="dd-journal-edit-actions">
                  <button
                    className="dd-journal-save"
                    onClick={() => saveEdit(journal._id)}
                  >
                    Save Changes
                  </button>
                  <button
                    className="dd-journal-cancel"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        .dd-journal-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dd-journal-item {
          padding: 16px;
          background: var(--dd-bg-card-solid, #FFFFFF);
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 16px;
          transition: all 0.2s ease;
          animation: dd-journal-fade-in 0.3s ease forwards;
          opacity: 0;
        }

        @keyframes dd-journal-fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dd-journal-item:hover {
          border-color: var(--dd-lavender-300, #C4B5FD);
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.08);
        }

        .dd-journal-item.editing {
          border-color: var(--dd-lavender-400, #A78BFA);
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), transparent);
        }

        .dd-journal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .dd-journal-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dd-journal-icon {
          font-size: 24px;
        }

        .dd-journal-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .dd-journal-date {
          font-size: 14px;
          font-weight: 700;
          color: var(--dd-text-primary, #0F172A);
        }

        .dd-journal-mood {
          font-size: 12px;
          font-weight: 500;
          color: var(--dd-lavender-600, #7C3AED);
          text-transform: capitalize;
        }

        .dd-journal-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .dd-journal-item:hover .dd-journal-actions {
          opacity: 1;
        }

        .dd-journal-action {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          background: transparent;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dd-journal-action:hover {
          background: var(--dd-bg-secondary, #F1F5F9);
        }

        .dd-journal-action.expand {
          font-size: 10px;
          color: var(--dd-text-muted, #64748B);
        }

        .dd-journal-action.delete:hover {
          background: var(--dd-error-light, #FEE2E2);
        }

        .dd-journal-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
        }

        .dd-journal-tag {
          padding: 4px 10px;
          background: var(--dd-lavender-100, #EDE9FE);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          color: var(--dd-lavender-600, #7C3AED);
        }

        .dd-journal-content {
          overflow: hidden;
        }

        .dd-journal-preview {
          margin: 0;
          font-size: 14px;
          color: var(--dd-text-secondary, #475569);
          line-height: 1.5;
        }

        .dd-journal-markdown {
          font-size: 14px;
          color: var(--dd-text-primary, #0F172A);
          line-height: 1.6;
        }

        .dd-journal-markdown h1,
        .dd-journal-markdown h2,
        .dd-journal-markdown h3 {
          margin: 16px 0 8px;
          font-weight: 700;
        }

        .dd-journal-markdown p {
          margin: 8px 0;
        }

        .dd-journal-markdown code {
          padding: 2px 6px;
          background: var(--dd-bg-secondary, #F1F5F9);
          border-radius: 4px;
          font-size: 13px;
        }

        .dd-journal-markdown pre {
          padding: 12px;
          background: var(--dd-bg-secondary, #F1F5F9);
          border-radius: 8px;
          overflow-x: auto;
        }

        .dd-journal-markdown blockquote {
          margin: 8px 0;
          padding-left: 16px;
          border-left: 3px solid var(--dd-lavender-400, #A78BFA);
          color: var(--dd-text-muted, #64748B);
          font-style: italic;
        }

        .dd-journal-markdown ul,
        .dd-journal-markdown ol {
          margin: 8px 0;
          padding-left: 24px;
        }

        .dd-journal-edit-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 12px;
        }

        .dd-journal-edit-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dd-journal-edit-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--dd-text-secondary, #475569);
        }

        .dd-journal-edit-input {
          padding: 12px 14px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 10px;
          font-size: 14px;
          background: var(--dd-bg-card-solid, #FFFFFF);
          color: var(--dd-text-primary, #0F172A);
          max-width: 200px;
          transition: all 0.2s ease;
        }

        .dd-journal-edit-input:focus {
          outline: none;
          border-color: var(--dd-lavender-400, #A78BFA);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }

        .dd-journal-edit-actions {
          display: flex;
          gap: 10px;
        }

        .dd-journal-save {
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--dd-lavender-500, #8B5CF6), var(--dd-primary-500, #3B82F6));
          font-size: 14px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dd-journal-save:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .dd-journal-cancel {
          padding: 10px 20px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 10px;
          background: transparent;
          font-size: 14px;
          font-weight: 600;
          color: var(--dd-text-muted, #64748B);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dd-journal-cancel:hover {
          border-color: var(--dd-text-muted, #64748B);
          color: var(--dd-text-primary, #0F172A);
        }

        [data-theme="dark"] .dd-journal-item {
          background: var(--dd-bg-secondary, #1E293B);
          border-color: var(--dd-border-medium, #334155);
        }

        [data-theme="dark"] .dd-journal-tag {
          background: rgba(139, 92, 246, 0.2);
        }

        [data-theme="dark"] .dd-journal-action:hover {
          background: var(--dd-bg-tertiary, #334155);
        }

        [data-theme="dark"] .dd-journal-edit-input {
          background: var(--dd-bg-tertiary, #334155);
        }
      `}</style>
    </div>
  );
};

export default JournalList;
