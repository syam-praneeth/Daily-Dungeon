import React, { createContext, useEffect, useState } from "react";
import axios from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const loadMe = async () => {
    if (!localStorage.getItem("token")) {
      setUser(null);
      return;
    }
    try {
      const res = await axios.get("/auth/me");
      setUser(res.data || null);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
    }
  };

  useEffect(() => {
    if (token) loadMe();
    else setUser(null);
  }, [token]);

  const login = async (email, password) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await axios.post("/auth/login", { email, password });
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      await loadMe();
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
      await loadMe();
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
      value={{
        user,
        token,
        login,
        register,
        logout,
        loadMe,
        authLoading,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
