import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "./AuthContext";

export const QuoteContext = createContext();

export const QuoteProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [nextLoading, setNextLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const fetchQuote = async () => {
    try {
      const res = await axios.get("/quotes");
      setQuote(res.data.quote || "");
      setAuthor(res.data.author || "");
      setQuoteError("");
    } catch (e) {
      setQuoteError("Unable to load quote.");
    }
  };

  const fetchRandomQuote = async () => {
    if (!token) return; // guard
    setNextLoading(true);
    try {
      let attempts = 0;
      let newQuote = quote;
      let newAuthor = author;
      while (attempts < 3 && (!newQuote || newQuote === quote)) {
        const res = await axios.get("/quotes/random");
        newQuote = res.data.quote || "";
        newAuthor = res.data.author || "";
        attempts += 1;
      }
      setQuote(newQuote);
      setAuthor(newAuthor);
      setQuoteError("");
    } catch (e) {
      // fallback to default fetch to keep UI responsive
      try {
        const res = await axios.get("/quotes");
        setQuote(res.data.quote || "");
        setAuthor(res.data.author || "");
        setQuoteError("");
      } catch {
        setQuoteError("Unable to load quote.");
      }
    } finally {
      setNextLoading(false);
    }
  };

  const addQuote = async ({ text, author, category }) => {
    try {
      const res = await axios.post("/quotes", { text, author, category });
      setQuote(res.data.text || "");
      setAuthor(res.data.author || "");
      setQuoteError("");
    } catch (e) {
      setQuoteError("Failed to add quote.");
    }
  };

  useEffect(() => {
    if (token) {
      fetchQuote();
    } else {
      setQuote("");
      setAuthor("");
    }
  }, [token]);

  return (
    <QuoteContext.Provider
      value={{
        quote,
        author,
        fetchQuote,
        fetchRandomQuote,
        addQuote,
        nextLoading,
        quoteError,
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
};
