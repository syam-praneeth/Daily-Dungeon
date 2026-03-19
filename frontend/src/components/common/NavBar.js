import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "../../api/axios";

// Professional SVG Icon Components
const Icons = {
  Dashboard: ({ active }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Tasks: ({ active }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  Timer: ({ active }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Bookmarks: ({ active }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  ),
  Journal: ({ active }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  Timetable: ({ active }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Link: ({ active }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  ),
  Logout: ({ active }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  ExternalLink: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
};

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

  useEffect(() => {
    const width = expanded ? "240px" : "64px";
    try {
      document.documentElement.style.setProperty("--dd-sidebar-width", width);
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

  const navLinks = [
    { path: "/", icon: Icons.Dashboard, label: "Dashboard" },
    { path: "/tasks", icon: Icons.Tasks, label: "Tasks" },
    { path: "/timer", icon: Icons.Timer, label: "Focus Timer" },
    { path: "/bookmarks", icon: Icons.Bookmarks, label: "Bookmarks" },
    { path: "/journal", icon: Icons.Journal, label: "Journal" },
    { path: "/timetable", icon: Icons.Timetable, label: "Schedule" },
    ...(user?.isAdmin
      ? [{ path: "/admin/deletions", icon: Icons.Shield, label: "Admin" }]
      : []),
  ];

  return (
    <>
      <aside
        className={`dd-sidebar ${expanded ? "dd-sidebar--expanded" : "dd-sidebar--collapsed"}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Header */}
        <div className="dd-sidebar__header">
          <div className="dd-sidebar__brand">
            <div className="dd-sidebar__logo">
              <Icons.Shield />
            </div>
            {expanded && (
              <div className="dd-sidebar__title">
                <span className="dd-sidebar__title-text">Daily Dungeon</span>
                <span className="dd-sidebar__title-sub">Performance Hub</span>
              </div>
            )}
          </div>
          <button
            className="dd-sidebar__toggle"
            onClick={() => setExpandedByClick((s) => !s)}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? <Icons.ChevronLeft /> : <Icons.ChevronRight />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="dd-sidebar__nav">
          <div className="dd-sidebar__section">
            {expanded && <div className="dd-sidebar__section-label">Navigation</div>}
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`dd-sidebar__link ${active ? "dd-sidebar__link--active" : ""}`}
                  title={!expanded ? link.label : undefined}
                >
                  <span className="dd-sidebar__link-icon">
                    <IconComponent active={active} />
                  </span>
                  {expanded && <span className="dd-sidebar__link-label">{link.label}</span>}
                  {active && <span className="dd-sidebar__link-indicator" />}
                </Link>
              );
            })}
          </div>

          {/* Quick Links */}
          {bookmarks.length > 0 && (
            <div className="dd-sidebar__section dd-sidebar__section--bookmarks">
              {expanded && <div className="dd-sidebar__section-label">Quick Links</div>}
              <div className="dd-sidebar__bookmarks">
                {bookmarks.slice(0, 5).map((b) => (
                  <a
                    key={b._id}
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dd-sidebar__bookmark"
                    title={`${b.name} — ${b.url}`}
                  >
                    <span className="dd-sidebar__bookmark-icon">
                      <Icons.ExternalLink />
                    </span>
                    {expanded && (
                      <span className="dd-sidebar__bookmark-name">{b.name}</span>
                    )}
                  </a>
                ))}
                {bookmarks.length > 5 && expanded && (
                  <Link to="/bookmarks" className="dd-sidebar__bookmark dd-sidebar__bookmark--more">
                    <span className="dd-sidebar__bookmark-icon">
                      <Icons.Link />
                    </span>
                    <span className="dd-sidebar__bookmark-name">
                      View all ({bookmarks.length})
                    </span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="dd-sidebar__footer">
          {expanded && (
            <div
              className="dd-sidebar__user"
              onClick={() => navigate("/profile")}
              role="button"
              tabIndex={0}
            >
              <div className="dd-sidebar__avatar">
                {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
              </div>
              <div className="dd-sidebar__user-info">
                <span className="dd-sidebar__user-name">
                  {user?.name?.split(" ")[0] || user?.email?.split("@")[0]}
                </span>
                <span className="dd-sidebar__user-role">Developer</span>
              </div>
            </div>
          )}
          <button
            className="dd-sidebar__logout"
            onClick={logout}
            title="Sign out"
          >
            <span className="dd-sidebar__logout-icon">
              <Icons.Logout />
            </span>
            {expanded && <span className="dd-sidebar__logout-label">Sign Out</span>}
          </button>
        </div>
      </aside>

      <style>{`
        .dd-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          background: var(--dd-sidebar-bg, #0F172A);
          transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .dd-sidebar--expanded {
          width: 240px;
        }

        .dd-sidebar--collapsed {
          width: 64px;
        }

        /* Header */
        .dd-sidebar__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 12px;
          border-bottom: 1px solid var(--dd-sidebar-border, rgba(148, 163, 184, 0.1));
        }

        .dd-sidebar__brand {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow: hidden;
        }

        .dd-sidebar__logo {
          width: 40px;
          height: 40px;
          min-width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          border-radius: 10px;
          color: white;
        }

        .dd-sidebar__logo svg {
          width: 22px;
          height: 22px;
        }

        .dd-sidebar__title {
          display: flex;
          flex-direction: column;
          white-space: nowrap;
        }

        .dd-sidebar__title-text {
          font-size: 15px;
          font-weight: 700;
          color: #F8FAFC;
          letter-spacing: -0.02em;
        }

        .dd-sidebar__title-sub {
          font-size: 11px;
          font-weight: 500;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dd-sidebar__toggle {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(148, 163, 184, 0.1);
          border: none;
          border-radius: 6px;
          color: #94A3B8;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .dd-sidebar__toggle:hover {
          background: rgba(148, 163, 184, 0.2);
          color: #F8FAFC;
        }

        .dd-sidebar__toggle svg {
          width: 16px;
          height: 16px;
        }

        .dd-sidebar--collapsed .dd-sidebar__toggle {
          display: none;
        }

        /* Navigation */
        .dd-sidebar__nav {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 12px 8px;
        }

        .dd-sidebar__section {
          margin-bottom: 20px;
        }

        .dd-sidebar__section-label {
          padding: 0 12px 8px;
          font-size: 11px;
          font-weight: 600;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .dd-sidebar__link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          margin: 2px 0;
          border-radius: 8px;
          color: #94A3B8;
          text-decoration: none;
          transition: all 0.15s ease;
          position: relative;
        }

        .dd-sidebar__link:hover {
          background: rgba(148, 163, 184, 0.1);
          color: #F8FAFC;
        }

        .dd-sidebar__link--active {
          background: rgba(59, 130, 246, 0.15);
          color: #60A5FA;
        }

        .dd-sidebar__link--active:hover {
          background: rgba(59, 130, 246, 0.2);
          color: #60A5FA;
        }

        .dd-sidebar__link-icon {
          width: 20px;
          height: 20px;
          min-width: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dd-sidebar__link-icon svg {
          width: 20px;
          height: 20px;
        }

        .dd-sidebar__link-label {
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
        }

        .dd-sidebar__link-indicator {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: linear-gradient(180deg, #3B82F6, #8B5CF6);
          border-radius: 3px 0 0 3px;
        }

        .dd-sidebar--collapsed .dd-sidebar__link {
          justify-content: center;
          padding: 12px;
        }

        .dd-sidebar--collapsed .dd-sidebar__link-indicator {
          display: none;
        }

        /* Bookmarks */
        .dd-sidebar__section--bookmarks {
          padding-top: 12px;
          border-top: 1px solid var(--dd-sidebar-border, rgba(148, 163, 184, 0.1));
        }

        .dd-sidebar__bookmarks {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .dd-sidebar__bookmark {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 6px;
          color: #64748B;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .dd-sidebar__bookmark:hover {
          background: rgba(148, 163, 184, 0.08);
          color: #94A3B8;
        }

        .dd-sidebar__bookmark-icon {
          width: 16px;
          height: 16px;
          min-width: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dd-sidebar__bookmark-icon svg {
          width: 14px;
          height: 14px;
        }

        .dd-sidebar__bookmark-name {
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dd-sidebar__bookmark--more {
          color: #3B82F6;
        }

        .dd-sidebar__bookmark--more:hover {
          color: #60A5FA;
        }

        .dd-sidebar--collapsed .dd-sidebar__bookmark {
          justify-content: center;
          padding: 10px;
        }

        /* Footer */
        .dd-sidebar__footer {
          padding: 12px 8px;
          border-top: 1px solid var(--dd-sidebar-border, rgba(148, 163, 184, 0.1));
        }

        .dd-sidebar__user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          margin-bottom: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .dd-sidebar__user:hover {
          background: rgba(148, 163, 184, 0.1);
        }

        .dd-sidebar__avatar {
          width: 36px;
          height: 36px;
          min-width: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #8B5CF6, #3B82F6);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          color: white;
        }

        .dd-sidebar__user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .dd-sidebar__user-name {
          font-size: 14px;
          font-weight: 600;
          color: #F8FAFC;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dd-sidebar__user-role {
          font-size: 12px;
          color: #64748B;
        }

        .dd-sidebar__logout {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #F87171;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .dd-sidebar__logout:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.5);
        }

        .dd-sidebar__logout-icon {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dd-sidebar__logout-icon svg {
          width: 18px;
          height: 18px;
        }

        .dd-sidebar--collapsed .dd-sidebar__logout {
          border: none;
          padding: 12px;
        }

        .dd-sidebar--collapsed .dd-sidebar__logout:hover {
          background: rgba(239, 68, 68, 0.15);
        }

        /* Scrollbar */
        .dd-sidebar__nav::-webkit-scrollbar {
          width: 4px;
        }

        .dd-sidebar__nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .dd-sidebar__nav::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 4px;
        }

        .dd-sidebar__nav::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.3);
        }

        /* Mobile */
        @media (max-width: 768px) {
          .dd-sidebar {
            transform: translateX(-100%);
          }

          .dd-sidebar--expanded {
            transform: translateX(0);
            width: 260px;
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.3);
          }
        }

        /* Light theme override */
        [data-theme="light"] .dd-sidebar {
          background: #FFFFFF;
          box-shadow: 2px 0 8px rgba(15, 23, 42, 0.04);
        }

        [data-theme="light"] .dd-sidebar__title-text {
          color: #0F172A;
        }

        [data-theme="light"] .dd-sidebar__link {
          color: #64748B;
        }

        [data-theme="light"] .dd-sidebar__link:hover {
          background: rgba(59, 130, 246, 0.08);
          color: #0F172A;
        }

        [data-theme="light"] .dd-sidebar__link--active {
          background: rgba(59, 130, 246, 0.12);
          color: #3B82F6;
        }

        [data-theme="light"] .dd-sidebar__user-name {
          color: #0F172A;
        }
      `}</style>
    </>
  );
};

export default NavBar;
