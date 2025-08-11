import React, { useContext, useState } from "react";
import { QuoteContext } from "../../context/QuoteContext";

const Quote = () => {
  const { quote, author, fetchRandomQuote, addQuote } =
    useContext(QuoteContext);
  const [text, setText] = useState("");
  const [formAuthor, setFormAuthor] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addQuote({ text, author: formAuthor });
    setText("");
    setFormAuthor("");
  };

  return (
    <div style={{ margin: "1rem 0" }}>
      <div className="quote-box" style={{ fontStyle: "italic", color: "#555" }}>
        <span>"{quote}"</span>
        {author ? <span> — {author}</span> : null}
        <button className="btn quote-next" onClick={fetchRandomQuote}>
          Next Quote
        </button>
      </div>
      <form onSubmit={submit} className="row" style={{ gap: 8, marginTop: 8 }}>
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
        <button className="btn" type="submit">
          Save
        </button>
      </form>
    </div>
  );
};

export default Quote;
