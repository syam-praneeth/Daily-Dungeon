import React, { useContext, useState, useEffect, useRef } from "react";
import { QuoteContext } from "../../context/QuoteContext";

const Quote = () => {
  const { quote, author, fetchRandomQuote, addQuote, nextLoading } =
    useContext(QuoteContext);
  const [text, setText] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);
  const intervalRef = useRef(null);

  // Auto refresh every 8 seconds with pause support
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!paused) fetchRandomQuote();
    }, 8000);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [fetchRandomQuote, paused]);

  // Trigger fade animation on quote change
  useEffect(() => {
    setFadeKey((k) => k + 1);
  }, [quote, author]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addQuote({ text, author: formAuthor });
    setText("");
    setFormAuthor("");
    setShowForm(false);
  };

  return (
    <div className="dd-quote">
      <div
        className="dd-quote-display"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="dd-quote-icon">💭</div>
        <div className="dd-quote-content" key={fadeKey}>
          <blockquote className="dd-quote-text">"{quote}"</blockquote>
          {author && <cite className="dd-quote-author">— {author}</cite>}
        </div>
        {paused && (
          <div className="dd-quote-paused">
            <span className="dd-paused-icon">⏸</span>
          </div>
        )}
        <button
          type="button"
          className="dd-quote-refresh"
          onClick={fetchRandomQuote}
          title="Get new quote"
        >
          ↻
        </button>
      </div>

      <div className="dd-quote-actions">
        <button
          type="button"
          className={`dd-quote-add-btn ${showForm ? "active" : ""}`}
          onClick={() => setShowForm((s) => !s)}
          aria-expanded={showForm}
        >
          {showForm ? "Cancel" : "+ Add Your Own"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="dd-quote-form">
          <div className="dd-quote-form-row">
            <div className="dd-quote-field">
              <input
                className="dd-quote-input"
                placeholder="Enter an inspiring quote..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div className="dd-quote-field dd-quote-field--author">
              <input
                className="dd-quote-input"
                placeholder="Author (optional)"
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
              />
            </div>
            <button
              className="dd-quote-submit"
              type="submit"
              disabled={!text.trim() || nextLoading}
            >
              {nextLoading ? (
                <span className="dd-quote-spinner" />
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      )}

      <style>{`
        .dd-quote {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dd-quote-display {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.08));
          border-radius: 16px;
          position: relative;
          min-height: 80px;
          transition: all 0.3s ease;
        }

        .dd-quote-display:hover {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(59, 130, 246, 0.12));
        }

        .dd-quote-icon {
          font-size: 32px;
          flex-shrink: 0;
          animation: dd-quote-float 3s ease-in-out infinite;
        }

        @keyframes dd-quote-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .dd-quote-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          animation: dd-quote-fade 0.5s ease;
        }

        @keyframes dd-quote-fade {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dd-quote-text {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          font-style: italic;
          color: var(--dd-text-primary, #0F172A);
          line-height: 1.6;
        }

        .dd-quote-author {
          font-size: 14px;
          font-weight: 600;
          font-style: normal;
          color: var(--dd-lavender-600, #7C3AED);
        }

        .dd-quote-paused {
          position: absolute;
          top: 12px;
          right: 44px;
          padding: 4px 8px;
          background: var(--dd-bg-secondary, #F1F5F9);
          border-radius: 6px;
          font-size: 12px;
        }

        .dd-paused-icon {
          font-size: 10px;
        }

        .dd-quote-refresh {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 8px;
          background: var(--dd-bg-card-solid, #FFFFFF);
          color: var(--dd-text-muted, #64748B);
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dd-quote-refresh:hover {
          background: var(--dd-primary-100, #DBEAFE);
          color: var(--dd-primary-600, #2563EB);
          transform: rotate(180deg);
        }

        .dd-quote-actions {
          display: flex;
          justify-content: flex-end;
        }

        .dd-quote-add-btn {
          padding: 8px 14px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 10px;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: var(--dd-text-muted, #64748B);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dd-quote-add-btn:hover {
          border-color: var(--dd-lavender-400, #A78BFA);
          color: var(--dd-lavender-600, #7C3AED);
        }

        .dd-quote-add-btn.active {
          background: var(--dd-lavender-100, #EDE9FE);
          border-color: var(--dd-lavender-400, #A78BFA);
          color: var(--dd-lavender-600, #7C3AED);
        }

        .dd-quote-form {
          animation: dd-slide-down 0.2s ease;
        }

        @keyframes dd-slide-down {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dd-quote-form-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .dd-quote-field {
          flex: 2;
          min-width: 150px;
        }

        .dd-quote-field--author {
          flex: 1;
          min-width: 120px;
        }

        .dd-quote-input {
          width: 100%;
          padding: 12px 14px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 10px;
          font-size: 14px;
          background: var(--dd-bg-card-solid, #FFFFFF);
          color: var(--dd-text-primary, #0F172A);
          transition: all 0.2s ease;
        }

        .dd-quote-input:focus {
          outline: none;
          border-color: var(--dd-lavender-400, #A78BFA);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }

        .dd-quote-input::placeholder {
          color: var(--dd-text-muted, #64748B);
        }

        .dd-quote-submit {
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--dd-lavender-500, #8B5CF6), var(--dd-primary-500, #3B82F6));
          font-size: 14px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dd-quote-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .dd-quote-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dd-quote-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: dd-spin 0.8s linear infinite;
        }

        @keyframes dd-spin {
          to { transform: rotate(360deg); }
        }

        [data-theme="dark"] .dd-quote-display {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15));
        }

        [data-theme="dark"] .dd-quote-display:hover {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
        }

        [data-theme="dark"] .dd-quote-refresh {
          background: var(--dd-bg-secondary, #1E293B);
        }

        [data-theme="dark"] .dd-quote-input {
          background: var(--dd-bg-secondary, #1E293B);
        }

        [data-theme="dark"] .dd-quote-paused {
          background: var(--dd-bg-tertiary, #334155);
        }
      `}</style>
    </div>
  );
};

export default Quote;
