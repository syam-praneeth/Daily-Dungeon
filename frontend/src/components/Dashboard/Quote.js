import React, { useContext, useState, useEffect, useRef } from "react";
import Spinner from "../common/Spinner";
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

  // Auto refresh every 5 seconds
  // Auto refresh every 5s with pause support
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!paused) fetchRandomQuote();
    }, 5000);
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
  };

  return (
    <div style={{ margin: "1rem 0" }}>
      <div
        className="quote-box"
        style={{ fontStyle: "italic", color: "#555" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="quote-fade" key={fadeKey}>
          <span>"{quote}"</span>
          {author ? <span> — {author}</span> : null}
        </div>
        {paused && (
          <div className="quote-paused" aria-label="Paused auto-rotate">
            Paused
          </div>
        )}
      </div>
      <div style={{ marginTop: 8 }}>
        <button
          type="button"
          className="btn"
          onClick={() => setShowForm((s) => !s)}
          aria-expanded={showForm}
        >
          {showForm ? "Cancel" : "Add Quote"}
        </button>
      </div>
      {showForm && (
        <form
          onSubmit={submit}
          className="row"
          style={{ gap: 8, marginTop: 8 }}
        >
          <input
            placeholder="Add your quote"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ flex: 1, padding: 8 }}
          />
          <input
            placeholder="Author (optional)"
            value={formAuthor}
            onChange={(e) => setFormAuthor(e.target.value)}
            style={{ width: 200, padding: 8 }}
          />
          <button className="btn" type="submit" disabled={!text.trim()}>
            {nextLoading ? <Spinner onDark size="sm" /> : "Save"}
          </button>
        </form>
      )}
    </div>
  );
};

export default Quote;
