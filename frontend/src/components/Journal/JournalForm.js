import React, { useState, useContext, useMemo } from "react";
import { JournalContext } from "../../context/JournalContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MarkdownEditor from "./MarkdownEditor";

// SVG Icons
const Icons = {
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};

const JournalForm = () => {
  const { addJournal } = useContext(JournalContext);
  const [text, setText] = useState("");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
  );
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const previewText = useMemo(() => normalizeMd(text), [text]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addJournal({ date, content: normalizeMd(text) });
      setText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dd-journal-form">
      <form onSubmit={handleSubmit}>
        {/* Header Row */}
        <div className="dd-journal-form__header">
          <div className="dd-journal-form__date-field">
            <label className="dd-journal-form__label">
              <Icons.Calendar />
              Date
            </label>
            <input
              type="date"
              className="dd-journal-form__date-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <button
            type="button"
            className={`dd-journal-form__toggle ${showPreview ? "active" : ""}`}
            onClick={() => setShowPreview((s) => !s)}
          >
            {showPreview ? <><Icons.Edit /> Edit</> : <><Icons.Eye /> Preview</>}
          </button>
        </div>

        {/* Content Area */}
        <div className="dd-journal-form__content">
          {!showPreview ? (
            <MarkdownEditor value={text} onChange={setText} />
          ) : (
            <div className="dd-journal-form__preview">
              {previewText ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {previewText}
                </ReactMarkdown>
              ) : (
                <p className="dd-journal-form__preview-empty">Nothing to preview yet...</p>
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          className="dd-journal-form__submit"
          type="submit"
          disabled={!text.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <span className="dd-journal-form__spinner" />
          ) : (
            <>
              <Icons.Plus />
              Add Entry
            </>
          )}
        </button>
      </form>

      <style>{`
        /* Override card body overflow for the journal form */
        .dd-card__body:has(.dd-journal-form) {
          overflow: visible !important;
        }

        .dd-journal-form {
          margin-bottom: 24px;
          overflow: visible;
        }

        .dd-journal-form form {
          overflow: visible;
        }

        .dd-journal-form__header {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: end;
          gap: 16px;
          margin-bottom: 16px;
        }

        .dd-journal-form__date-field {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 6px;
          max-width: 340px;
        }

        .dd-journal-form__label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--dd-text-secondary, #475569);
          white-space: nowrap;
        }

        .dd-journal-form__label svg {
          color: var(--dd-lavender-500, #8B5CF6);
        }

        .dd-journal-form__date-input {
          padding: 12px 14px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 10px;
          background: var(--dd-bg-card-solid, #FFFFFF);
          color: var(--dd-text-primary, #0F172A);
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s ease;
          min-width: 160px;
          min-height: 42px;
          box-sizing: border-box;
          flex: 1;
        }

        .dd-journal-form__date-input:focus {
          outline: none;
          border-color: var(--dd-lavender-400, #A78BFA);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }

        .dd-journal-form__toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 10px;
          background: transparent;
          color: var(--dd-text-muted, #64748B);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 42px;
          align-self: end;
        }

        .dd-journal-form__toggle:hover {
          border-color: var(--dd-lavender-400, #A78BFA);
          color: var(--dd-lavender-600, #7C3AED);
        }

        .dd-journal-form__toggle.active {
          background: var(--dd-lavender-100, #EDE9FE);
          border-color: var(--dd-lavender-400, #A78BFA);
          color: var(--dd-lavender-600, #7C3AED);
        }

        .dd-journal-form__content {
          margin-bottom: 16px;
          position: relative;
          overflow: visible;
        }

        .dd-journal-form__preview {
          min-height: 150px;
          padding: 20px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 12px;
          background: var(--dd-bg-secondary, #F8FAFC);
          color: var(--dd-text-primary, #0F172A);
          font-size: 15px;
          line-height: 1.7;
        }

        .dd-journal-form__preview h1,
        .dd-journal-form__preview h2,
        .dd-journal-form__preview h3 {
          margin: 20px 0 12px;
          font-weight: 700;
          color: var(--dd-text-primary, #0F172A);
        }

        .dd-journal-form__preview h1 { font-size: 1.75em; }
        .dd-journal-form__preview h2 { font-size: 1.5em; }
        .dd-journal-form__preview h3 { font-size: 1.25em; }

        .dd-journal-form__preview p {
          margin: 12px 0;
        }

        .dd-journal-form__preview ul,
        .dd-journal-form__preview ol {
          margin: 12px 0;
          padding-left: 24px;
        }

        .dd-journal-form__preview li {
          margin: 6px 0;
        }

        .dd-journal-form__preview blockquote {
          margin: 16px 0;
          padding: 12px 20px;
          border-left: 4px solid var(--dd-lavender-400, #A78BFA);
          background: var(--dd-lavender-50, #F5F3FF);
          color: var(--dd-text-secondary, #475569);
          font-style: italic;
          border-radius: 0 8px 8px 0;
        }

        .dd-journal-form__preview code {
          padding: 3px 8px;
          background: var(--dd-bg-tertiary, #E2E8F0);
          border-radius: 4px;
          font-size: 0.9em;
          font-family: 'SF Mono', Monaco, monospace;
        }

        .dd-journal-form__preview pre {
          margin: 16px 0;
          padding: 16px;
          background: var(--dd-bg-dark, #0F172A);
          color: #E2E8F0;
          border-radius: 10px;
          overflow-x: auto;
        }

        .dd-journal-form__preview pre code {
          padding: 0;
          background: none;
          color: inherit;
        }

        .dd-journal-form__preview-empty {
          color: var(--dd-text-muted, #94A3B8);
          font-style: italic;
        }

        .dd-journal-form__submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 14px 24px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--dd-lavender-500, #8B5CF6), var(--dd-primary-500, #3B82F6));
          color: white;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dd-journal-form__submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35);
        }

        .dd-journal-form__submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dd-journal-form__spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: dd-form-spin 0.8s linear infinite;
        }

        @keyframes dd-form-spin {
          to { transform: rotate(360deg); }
        }

        /* Dark theme */
        [data-theme="dark"] .dd-journal-form__date-input {
          background: var(--dd-bg-secondary, #1E293B);
          border-color: var(--dd-border-medium, #334155);
        }

        [data-theme="dark"] .dd-journal-form__preview {
          background: var(--dd-bg-tertiary, #334155);
          border-color: var(--dd-border-medium, #334155);
        }

        [data-theme="dark"] .dd-journal-form__preview blockquote {
          background: rgba(139, 92, 246, 0.15);
        }

        [data-theme="dark"] .dd-journal-form__preview code {
          background: var(--dd-bg-secondary, #1E293B);
        }

        @media (max-width: 480px) {
          .dd-journal-form__header {
            grid-template-columns: 1fr;
            align-items: stretch;
          }

          .dd-journal-form__date-field,
          .dd-journal-form__date-input {
            width: 100%;
            max-width: none;
          }

          .dd-journal-form__date-field {
            flex-direction: column;
            align-items: stretch;
          }

          .dd-journal-form__toggle {
            justify-content: center;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default JournalForm;
