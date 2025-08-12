import React, { useState, useContext, useMemo } from "react";
import { JournalContext } from "../../context/JournalContext";
import TextareaAutosize from "react-textarea-autosize";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MarkdownEditor from "./MarkdownEditor";

const JournalForm = () => {
  const { addJournal } = useContext(JournalContext);
  const [text, setText] = useState("");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
  );
  const [showPreview, setShowPreview] = useState(false);

  // Normalize markdown by collapsing extra blank lines and trimming trailing spaces,
  // while keeping fenced code blocks intact.
  const normalizeMd = (md) => {
    if (!md) return "";
    const parts = md.split(/(```[\s\S]*?```)/g);
    const cleaned = parts
      .map((part) => {
        if (part.startsWith("```")) return part; // keep code blocks untouched
        let s = part.replace(/\r\n/g, "\n");
        s = s.replace(/[ \t]+\n/g, "\n"); // strip trailing spaces before newline
        s = s.replace(/\n{3,}/g, "\n\n"); // collapse 3+ newlines to single blank line
        // Remove extra blank line directly before headings/lists/quotes
        s = s.replace(/\n{2,}(?=(?:#{1,6}\s|[-*]\s|\d+\.\s|>\s))/g, "\n");
        // Ensure at most one blank line after a heading
        s = s.replace(/^(#{1,6} .*)\n{2,}/gm, "$1\n");
        return s;
      })
      .join("");
    return cleaned.trim();
  };
  const previewText = useMemo(() => normalizeMd(text), [text]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addJournal({ date, content: normalizeMd(text) });
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
      <div>
        <div
          className="row"
          style={{ justifyContent: "space-between", marginBottom: 6 }}
        >
          <span style={{ color: "#6b7280", fontSize: 12 }}>
            Entry (Markdown supported)
          </span>
          <button
            type="button"
            className="btn-outline amber"
            onClick={() => setShowPreview((s) => !s)}
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
        </div>
        {!showPreview ? (
          <MarkdownEditor value={text} onChange={setText} />
        ) : (
          <div className="soft-section markdown-preview">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {previewText || "Nothing to preview."}
            </ReactMarkdown>
          </div>
        )}
      </div>
      <button className="btn" type="submit">
        Add Entry
      </button>
    </form>
  );
};

export default JournalForm;
