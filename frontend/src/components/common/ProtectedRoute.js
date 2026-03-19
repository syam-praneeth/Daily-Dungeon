import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const ProtectedRoute = () => {
  const { token } = useContext(AuthContext);
  const persistedToken = localStorage.getItem("token");
  if (!token && !persistedToken) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
