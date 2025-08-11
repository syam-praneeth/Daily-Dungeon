import React, { createContext, useState } from "react";
import axios from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const login = async (email, password) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await axios.post("/auth/login", { email, password });
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      setUser({ email });
    } catch (e) {
      setAuthError(e?.response?.data?.msg || "Login failed");
      throw e;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await axios.post("/auth/register", { name, email, password });
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      setUser({ name, email });
    } catch (e) {
      setAuthError(e?.response?.data?.msg || "Registration failed");
      throw e;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, authLoading, authError }}
    >
      {children}
    </AuthContext.Provider>
  );
};
