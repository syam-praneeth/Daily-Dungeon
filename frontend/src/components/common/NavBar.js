import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const NavBar = () => {
  const { token, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  if (!token) return null;
  const isActive = (path) =>
    path === "/"
      ? location.pathname === path
      : location.pathname.startsWith(path);
  return (
    <div className="navbar">
      <div className="nav-inner">
        <Link to="/" className="brand" style={{ textDecoration: "none" }}>
          Daily Dungeon
        </Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            Dashboard
          </Link>
          <Link
            to="/tasks"
            className={`nav-link ${isActive("/tasks") ? "active" : ""}`}
          >
            Tasks
          </Link>
          <Link
            to="/timer"
            className={`nav-link ${isActive("/timer") ? "active" : ""}`}
          >
            Timer
          </Link>
          <Link
            to="/journal"
            className={`nav-link ${isActive("/journal") ? "active" : ""}`}
          >
            Journal
          </Link>
          <Link
            to="/timetable"
            className={`nav-link ${isActive("/timetable") ? "active" : ""}`}
          >
            Timetable
          </Link>
          {/* Chat removed */}
          {/* Profile link removed; avatar icon handles navigation */}
        </div>
        <div className="nav-actions">
          <div
            className="avatar"
            title={user?.email || user?.name || "User"}
            onClick={() => navigate("/profile")}
            style={{ cursor: "pointer" }}
          >
            {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
          </div>
          <button onClick={logout} className="btn">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
