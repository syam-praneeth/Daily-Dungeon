import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "./AuthContext";

export const QuoteContext = createContext();

export const QuoteProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");

  const fetchQuote = async () => {
    const res = await axios.get("/quotes");
    setQuote(res.data.quote || "");
    setAuthor(res.data.author || "");
  };

  const fetchRandomQuote = async () => {
    const res = await axios.get("/quotes/random");
    setQuote(res.data.quote || "");
    setAuthor(res.data.author || "");
  };

  const addQuote = async ({ text, author, category }) => {
    const res = await axios.post("/quotes", { text, author, category });
    setQuote(res.data.text || "");
    setAuthor(res.data.author || "");
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
      value={{ quote, author, fetchQuote, fetchRandomQuote, addQuote }}
    >
      {children}
    </QuoteContext.Provider>
  );
};
