import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import axios from "../api/axios";
import { AuthContext } from "./AuthContext";

export const QuoteContext = createContext();

export const QuoteProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [nextLoading, setNextLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const recentRef = useRef([]); // keep last few quotes to avoid quick repeats

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

  const fetchRandomQuote = useCallback(async () => {
    if (!token) return; // guard
    setNextLoading(true);
    try {
      let attempts = 0;
      let newQuote = quote;
      let newAuthor = author;
      const recent = recentRef.current || [];
      while (
        attempts < 5 &&
        (!newQuote || newQuote === quote || recent.includes(newQuote))
      ) {
        const res = await axios.get("/quotes/random");
        newQuote = res.data.quote || "";
        newAuthor = res.data.author || "";
        attempts += 1;
      }
      setQuote(newQuote);
      setAuthor(newAuthor);
      // update recent cache (keep last 5)
      if (newQuote) {
        recentRef.current = [
          newQuote,
          ...recent.filter((q) => q !== newQuote),
        ].slice(0, 5);
      }
      setQuoteError("");
    } catch (e) {
      try {
        const res = await axios.get("/quotes");
        const q = res.data.quote || "";
        const a = res.data.author || "";
        setQuote(q);
        setAuthor(a);
        if (q) {
          recentRef.current = [
            q,
            ...recentRef.current.filter((r) => r !== q),
          ].slice(0, 5);
        }
        setQuoteError("");
      } catch {
        setQuoteError("Unable to load quote.");
      }
    } finally {
      setNextLoading(false);
    }
  }, [token, quote, author]);

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
