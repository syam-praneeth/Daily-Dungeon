import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "../../api/axios";

const NavBar = () => {
  const { token, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [bookmarks, setBookmarks] = useState([]);
  const [expandedByClick, setExpandedByClick] = useState(false);
  const [hovered, setHovered] = useState(false);
  const mountedRef = useRef(false);

  const expanded = hovered || expandedByClick;

  const isActive = (path) =>
    path === "/"
      ? location.pathname === path
      : location.pathname.startsWith(path);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    let canceled = false;
    async function fetchBookmarks() {
      try {
        const res = await axios.get("/bookmarks?limit=50&page=1");
        if (canceled) return;
        setBookmarks(res.data.items || []);
      } catch (err) {
        // ignore
      }
    }
    fetchBookmarks();
    return () => {
      canceled = true;
    };
  }, [token]);

  // Add a document-level marker only when the user is authenticated so
  // layout rules that push the main content only apply to logged-in pages.
  useEffect(() => {
    if (token) {
      try {
        document.documentElement.classList.add("has-dd-sidebar");
      } catch (e) {}
    } else {
      try {
        document.documentElement.classList.remove("has-dd-sidebar");
      } catch (e) {}
    }
    return () => {
      try {
        document.documentElement.classList.remove("has-dd-sidebar");
      } catch (e) {}
    };
  }, [token]);

  // Expose current sidebar width to CSS so the main content can avoid being overlapped
  useEffect(() => {
    const width = expanded ? "260px" : "56px";
    try {
      document.documentElement.style.setProperty("--dd-sidebar-width", width);
      // add a class so CSS can force a push-layout (no overlay/transparent layer)
      if (expanded) {
        document.documentElement.classList.add("dd-sidebar-expanded");
      } else {
        document.documentElement.classList.remove("dd-sidebar-expanded");
      }
    } catch (e) {}
    return () => {
      try {
        document.documentElement.style.removeProperty("--dd-sidebar-width");
        document.documentElement.classList.remove("dd-sidebar-expanded");
      } catch (e) {}
    };
  }, [expanded]);

  if (!token) return null;

  return (
    <aside
      className={`sidebar ${expanded ? "expanded" : "collapsed"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-hidden={false}
    >
      <div className="sidebar-inner">
        <div className="sidebar-top">
          <div className="sidebar-brand" role="banner">
            <div className="brand-icon" aria-hidden>
              🛡️
            </div>
            {expanded && <div className="brand-title">Daily Dungeon</div>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setExpandedByClick((s) => !s)}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            ☰
          </button>
        </div>

        <nav className="sidebar-links" aria-label="Main">
          <Link
            to="/"
            className={`sb-link ${isActive("/") ? "active" : ""}`}
            title="Dashboard"
          >
            <span className="sb-icon">🏠</span>
            {expanded && <span className="sb-label">Dashboard</span>}
          </Link>
          <Link
            to="/tasks"
            className={`sb-link ${isActive("/tasks") ? "active" : ""}`}
            title="Tasks"
          >
            <span className="sb-icon">✅</span>
            {expanded && <span className="sb-label">Tasks</span>}
          </Link>
          <Link
            to="/timer"
            className={`sb-link ${isActive("/timer") ? "active" : ""}`}
            title="Timer"
          >
            <span className="sb-icon">⏱️</span>
            {expanded && <span className="sb-label">Timer</span>}
          </Link>
          <Link
            to="/bookmarks"
            className={`sb-link ${isActive("/bookmarks") ? "active" : ""}`}
            title="Bookmarks"
          >
            <span className="sb-icon">🔖</span>
            {expanded && <span className="sb-label">Bookmarks</span>}
          </Link>
          <Link
            to="/journal"
            className={`sb-link ${isActive("/journal") ? "active" : ""}`}
            title="Journal"
          >
            <span className="sb-icon">📓</span>
            {expanded && <span className="sb-label">Journal</span>}
          </Link>
          <Link
            to="/timetable"
            className={`sb-link ${isActive("/timetable") ? "active" : ""}`}
            title="Timetable"
          >
            <span className="sb-icon">📅</span>
            {expanded && <span className="sb-label">Timetable</span>}
          </Link>
        </nav>

        <div className="sidebar-bookmarks" aria-label="Bookmarks">
          {expanded && <div className="bookmarks-title">Bookmarks</div>}
          <ul className="bookmarks-list">
            {bookmarks.map((b) => (
              <li key={b._id} className="bookmark-item">
                <a
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${b.name} — ${b.url}`}
                >
                  <span className="bm-fav">🔗</span>
                  {expanded ? <span className="bm-text">{b.name}</span> : null}
                </a>
              </li>
            ))}
            {bookmarks.length === 0 && expanded && (
              <li className="bookmark-empty">No bookmarks</li>
            )}
          </ul>
        </div>

        <div className="sidebar-footer">
          {expanded && (
            <div className="profile-row">
              <div
                className="avatar"
                onClick={() => navigate("/profile")}
                title={user?.email || user?.name || "User"}
              >
                {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
              </div>
              <div style={{ marginLeft: 8 }}>
                {user?.name?.split(" ")[0] || user?.email}
              </div>
            </div>
          )}
          <button className="sb-logout" onClick={logout} title="Logout">
            {expanded ? "Logout" : "⎋"}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default NavBar;
