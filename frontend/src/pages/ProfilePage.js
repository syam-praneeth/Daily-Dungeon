import React, { useContext, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { TimerContext } from "../context/TimerContext";
import LinksGrid from "../components/links/LinksGrid";
import LinksModal from "../components/links/LinksModal";
import Toast from "../components/common/Toast";

const tz = "Asia/Kolkata";

const toISTKey = (value) =>
  new Date(value).toLocaleDateString("en-CA", { timeZone: tz });

const formatMinutes = (mins) => {
  const safe = Math.max(0, Math.round(Number(mins) || 0));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const numberFmt = new Intl.NumberFormat("en-IN");

function buildDayKeys(count) {
  const keys = [];
  const now = new Date();
  const todayKey = toISTKey(now);
  const base = new Date(`${todayKey}T00:00:00+05:30`);
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    keys.push(d.toLocaleDateString("en-CA", { timeZone: tz }));
  }
  return keys;
}

function computeCurrentStreak(activeSet) {
  const keys = buildDayKeys(400);
  let count = 0;
  for (let i = keys.length - 1; i >= 0; i--) {
    if (activeSet.has(keys[i])) count += 1;
    else break;
  }
  return count;
}

function computeBestStreak(activeSet) {
  const keys = buildDayKeys(400);
  let best = 0;
  let run = 0;
  keys.forEach((k) => {
    if (activeSet.has(k)) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  });
  return best;
}

function buildSmoothPath(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    d += ` Q ${cx} ${prev.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function AnimatedTrendGraph({
  title,
  subtitle,
  values,
  color,
  unit = "min",
  wide = false,
}) {
  const width = wide ? 980 : 760;
  const height = 260;
  const pad = { top: 24, right: 20, bottom: 30, left: 24 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const data = values.length ? values : [0, 0, 0, 0, 0];
  const maxV = Math.max(...data, 1);
  const minV = 0;

  const points = data.map((v, i) => {
    const x =
      pad.left + (i * innerW) / Math.max(1, data.length - 1);
    const y =
      pad.top + innerH - ((v - minV) / (maxV - minV || 1)) * innerH;
    return { x, y, v };
  });

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${pad.left + innerW} ${pad.top + innerH} L ${pad.left} ${pad.top + innerH} Z`;

  return (
    <motion.section
      className="profile-graph"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="profile-graph__meta">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="profile-graph__svg" role="img" aria-label={title}>
        <defs>
          <linearGradient id={`dd-grad-${title.replace(/\s+/g, "-")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <g className="profile-graph__grid">
          {[0, 1, 2, 3, 4].map((n) => {
            const y = pad.top + (innerH * n) / 4;
            return <line key={n} x1={pad.left} x2={pad.left + innerW} y1={y} y2={y} />;
          })}
        </g>

        <path d={areaPath} fill={`url(#dd-grad-${title.replace(/\s+/g, "-")})`} className="profile-graph__area" />
        <path d={linePath} stroke={color} className="profile-graph__line" />

        {points.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r="4" fill={color} className="profile-graph__dot" style={{ animationDelay: `${idx * 45}ms` }}>
            <title>{`${numberFmt.format(Math.round(p.v))} ${unit}`}</title>
          </circle>
        ))}
      </svg>
    </motion.section>
  );
}

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const { streak, fetchStreak } = useContext(TimerContext);
  const navigate = useNavigate();

  const [recentSessions, setRecentSessions] = useState([]);
  const [activeRange, setActiveRange] = useState("week");

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [links, setLinks] = useState({});
  const [linksOpen, setLinksOpen] = useState(false);
  const [linksLoading, setLinksLoading] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "" });

  useEffect(() => {
    fetchStreak?.();
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 370);
    const qs = `from=${encodeURIComponent(start.toISOString())}&to=${encodeURIComponent(end.toISOString())}`;

    axios
      .get(`/readingSessions?${qs}`)
      .then((res) => setRecentSessions(res.data || []))
      .catch(() => setRecentSessions([]));
  }, []);

  const loadLinks = async () => {
    try {
      setLinksLoading(true);
      const res = await axios.get("/profile/links");
      setLinks(res.data || {});
    } catch {
      setLinks({});
    } finally {
      setLinksLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const save = (e) => {
    e.preventDefault();
    alert("Profile saved (mock).");
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm(
      "Delete your account? This hides your account and your tasks from your dashboard."
    );
    if (!ok) return;

    try {
      setDeletingAccount(true);
      await axios.delete("/auth/me");
      logout();
      navigate("/login", { replace: true });
    } catch (e) {
      setToast({
        open: true,
        msg: e?.response?.data?.msg || "Failed to delete account",
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  const activeSet = useMemo(() => {
    const set = new Set();
    (streak || []).forEach((d) => {
      if (d.isActive && d.date) set.add(toISTKey(d.date));
    });
    return set;
  }, [streak]);

  const sessionByDay = useMemo(() => {
    const map = new Map();
    recentSessions.forEach((s) => {
      const src = s.startTime || s.date;
      if (!src) return;
      const key = toISTKey(src);
      const minutes = Math.round((Number(s.duration) || 0) / 60);
      map.set(key, (map.get(key) || 0) + minutes);
    });
    return map;
  }, [recentSessions]);

  const todayKey = useMemo(() => toISTKey(new Date()), []);
  const weekKeys = useMemo(() => buildDayKeys(7), []);
  const monthKeys = useMemo(() => buildDayKeys(30), []);

  const dailyMinutes = sessionByDay.get(todayKey) || 0;
  const weeklyMinutes = weekKeys.reduce((sum, key) => sum + (sessionByDay.get(key) || 0), 0);
  const monthlyMinutes = monthKeys.reduce((sum, key) => sum + (sessionByDay.get(key) || 0), 0);

  const todaySessions = useMemo(() => {
    return recentSessions.filter((s) => toISTKey(s.startTime || s.date) === todayKey);
  }, [recentSessions, todayKey]);

  const dayByHour = useMemo(() => {
    const arr = Array(24).fill(0);
    todaySessions.forEach((s) => {
      if (!s.startTime && !s.date) return;
      const d = new Date(s.startTime || s.date);
      const hour = Number(
        d.toLocaleTimeString("en-GB", {
          timeZone: tz,
          hour12: false,
          hour: "2-digit",
        })
      );
      arr[Number.isNaN(hour) ? 0 : hour] += Math.round((Number(s.duration) || 0) / 60);
    });
    return arr;
  }, [todaySessions]);

  const weekSeries = useMemo(() => weekKeys.map((k) => sessionByDay.get(k) || 0), [weekKeys, sessionByDay]);
  const monthSeries = useMemo(() => monthKeys.map((k) => sessionByDay.get(k) || 0), [monthKeys, sessionByDay]);

  const activeDays30 = monthKeys.filter((k) => activeSet.has(k)).length;
  const consistency = Math.round((activeDays30 / 30) * 100);
  const currentStreak = computeCurrentStreak(activeSet);
  const bestStreak = computeBestStreak(activeSet);

  const weeklyAverage = Math.round(weeklyMinutes / 7);
  const monthlyAverage = Math.round(monthlyMinutes / 30);
  const longestSession = todaySessions.reduce((max, s) => Math.max(max, Math.round((Number(s.duration) || 0) / 60)), 0);

  const stats = [
    {
      label: "Current Streak",
      value: `${currentStreak} days`,
      sub: `Best: ${bestStreak} days`,
      tone: "gold",
    },
    {
      label: "Today",
      value: formatMinutes(dailyMinutes),
      sub: `${todaySessions.length} sessions`,
      tone: "blue",
    },
    {
      label: "This Week",
      value: formatMinutes(weeklyMinutes),
      sub: `${formatMinutes(weeklyAverage)}/day avg`,
      tone: "green",
    },
    {
      label: "This Month",
      value: formatMinutes(monthlyMinutes),
      sub: `${formatMinutes(monthlyAverage)}/day avg`,
      tone: "rose",
    },
  ];

  const insightLines = [
    `Consistency over last 30 days: ${consistency}% (${activeDays30}/30 active days).`,
    `Longest session today: ${formatMinutes(longestSession)}.`,
    `Week pace: ${formatMinutes(weeklyAverage)} daily average with ${weekSeries.filter((v) => v > 0).length} active days.`,
    `Month pace: ${formatMinutes(monthlyAverage)} daily average with ${monthSeries.filter((v) => v > 0).length} active days.`,
  ];

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div>
          <p className="profile-eyebrow">Profile Dashboard</p>
          <h1>{user?.name || "Reader"}, your performance cockpit</h1>
          <p>
            Track streak quality, compare day/week/month performance, and spot
            consistency dips before they break momentum.
          </p>
        </div>
        <div className="profile-hero__chip-grid">
          {stats.map((s) => (
            <motion.article
              key={s.label}
              className={`profile-stat profile-stat--${s.tone}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <span>{s.label}</span>
              <strong>{s.value}</strong>
              <small>{s.sub}</small>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="profile-panel">
        <div className="profile-panel__head">
          <h2>Performance Graphs</h2>
          <div className="profile-segmented" role="tablist" aria-label="Performance range">
            {["day", "week", "month"].map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                className={activeRange === key ? "active" : ""}
                onClick={() => setActiveRange(key)}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {activeRange === "day" && (
          <AnimatedTrendGraph
            title="Today by Hour"
            subtitle="Minutes invested each hour in IST timezone"
            values={dayByHour}
            color="#2563EB"
            unit="minutes"
            wide
          />
        )}

        {activeRange === "week" && (
          <AnimatedTrendGraph
            title="Last 7 Days"
            subtitle="Daily volume trend for the current week window"
            values={weekSeries}
            color="#10B981"
            unit="minutes"
            wide
          />
        )}

        {activeRange === "month" && (
          <AnimatedTrendGraph
            title="Last 30 Days"
            subtitle="Month-level consistency with smooth animated trend"
            values={monthSeries}
            color="#F59E0B"
            unit="minutes"
            wide
          />
        )}
      </section>

      <section className="profile-layout">
        <article className="profile-panel profile-insights">
          <h2>Detailed Insights</h2>
          <ul>
            {insightLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </article>

        <article className="profile-panel profile-account">
          <h2>Account Settings</h2>
          <form onSubmit={save} className="profile-form">
            <label>
              Name
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Email
              <input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <button type="submit">Save Profile</button>
          </form>
          <div className="profile-danger-zone">
            <p>
              Need to leave? You can delete your account. Deleted data is kept
              for admin audit.
            </p>
            <button
              type="button"
              className="profile-danger-btn"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
            >
              {deletingAccount ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </article>
      </section>

      <section className="profile-panel">
        <div className="profile-panel__head">
          <h2>My Links</h2>
          <button className="profile-cta" onClick={() => setLinksOpen(true)}>
            Edit Links
          </button>
        </div>
        <LinksGrid links={links} loading={linksLoading} onEdit={() => setLinksOpen(true)} />
      </section>

      <LinksModal
        open={linksOpen}
        initial={links}
        onClose={() => setLinksOpen(false)}
        onSave={async (vals) => {
          try {
            await axios.put("/profile/links", { links: vals });
            setLinksOpen(false);
            await loadLinks();
            setToast({ open: true, msg: "Links saved" });
          } catch {
            setToast({ open: true, msg: "Could not save links" });
          }
        }}
      />
      <Toast
        open={toast.open}
        message={toast.msg}
        onClose={() => setToast({ open: false, msg: "" })}
      />

      <style>{`
        .profile-page {
          max-width: 1280px;
          margin: 18px auto 42px;
          padding: 0 18px;
          color: var(--dd-text-primary, #0f172a);
        }

        .profile-hero {
          border-radius: 24px;
          padding: 24px;
          background:
            radial-gradient(circle at 16% 10%, rgba(37, 99, 235, 0.28), transparent 48%),
            radial-gradient(circle at 75% 12%, rgba(16, 185, 129, 0.24), transparent 46%),
            linear-gradient(125deg, rgba(255, 255, 255, 0.96), rgba(240, 253, 250, 0.88));
          border: 1px solid rgba(148, 163, 184, 0.4);
          box-shadow: 0 18px 55px rgba(15, 23, 42, 0.08);
        }

        .profile-eyebrow {
          margin: 0;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #0f766e;
          text-transform: uppercase;
        }

        .profile-hero h1 {
          margin: 6px 0;
          font-size: clamp(1.45rem, 3.1vw, 2.25rem);
          line-height: 1.15;
        }

        .profile-hero p {
          margin: 0;
          color: #334155;
          max-width: 720px;
        }

        .profile-hero__chip-grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }

        .profile-stat {
          border-radius: 16px;
          padding: 12px 14px;
          border: 1px solid rgba(148, 163, 184, 0.32);
          display: grid;
          gap: 4px;
          background: rgba(255, 255, 255, 0.82);
        }

        .profile-stat span {
          font-size: 12px;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 700;
        }

        .profile-stat strong {
          font-size: 1.15rem;
          line-height: 1.2;
        }

        .profile-stat small {
          color: #64748b;
          font-size: 0.82rem;
        }

        .profile-stat--gold strong { color: #a16207; }
        .profile-stat--blue strong { color: #1d4ed8; }
        .profile-stat--green strong { color: #047857; }
        .profile-stat--rose strong { color: #be123c; }

        .profile-panel {
          margin-top: 16px;
          border-radius: 20px;
          border: 1px solid rgba(148, 163, 184, 0.34);
          background: rgba(255, 255, 255, 0.92);
          padding: 18px;
          box-shadow: 0 12px 40px rgba(15, 23, 42, 0.06);
        }

        .profile-panel__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .profile-panel h2 {
          margin: 0;
          font-size: 1.05rem;
        }

        .profile-segmented {
          display: inline-flex;
          border: 1px solid rgba(148, 163, 184, 0.4);
          border-radius: 999px;
          padding: 4px;
          background: #f8fafc;
        }

        .profile-segmented button {
          border: none;
          border-radius: 999px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #334155;
          background: transparent;
          cursor: pointer;
        }

        .profile-segmented button.active {
          background: #0f172a;
          color: white;
        }

        .profile-graph {
          border-radius: 14px;
          border: 1px solid rgba(203, 213, 225, 0.6);
          padding: 12px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.8));
        }

        .profile-graph__meta h3 {
          margin: 0;
          font-size: 0.95rem;
        }

        .profile-graph__meta p {
          margin: 2px 0 12px;
          color: #64748b;
          font-size: 0.84rem;
        }

        .profile-graph__svg {
          width: 100%;
          display: block;
        }

        .profile-graph__grid line {
          stroke: rgba(148, 163, 184, 0.24);
          stroke-width: 1;
        }

        .profile-graph__line {
          fill: none;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 1200;
          stroke-dashoffset: 1200;
          animation: dd-profile-line 1.15s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }

        .profile-graph__area {
          opacity: 0;
          animation: dd-profile-area 0.8s ease forwards;
          animation-delay: 180ms;
        }

        .profile-graph__dot {
          opacity: 0;
          transform-origin: center;
          animation: dd-profile-dot 0.45s ease forwards;
        }

        .profile-layout {
          margin-top: 16px;
          display: grid;
          gap: 16px;
          grid-template-columns: 1.2fr 0.8fr;
        }

        .profile-insights ul {
          margin: 10px 0 0;
          padding-left: 18px;
          display: grid;
          gap: 8px;
        }

        .profile-insights li {
          color: #334155;
        }

        .profile-form {
          margin-top: 10px;
          display: grid;
          gap: 10px;
        }

        .profile-form label {
          display: grid;
          gap: 6px;
          font-size: 12px;
          color: #475569;
          font-weight: 600;
        }

        .profile-form input {
          min-height: 42px;
          border-radius: 10px;
          border: 2px solid rgba(203, 213, 225, 0.65);
          padding: 10px 12px;
          background: #fff;
        }

        .profile-form input:focus {
          outline: none;
          border-color: #38bdf8;
          box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.2);
        }

        .profile-form button,
        .profile-cta {
          min-height: 42px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(130deg, #0ea5e9, #2563eb);
          color: white;
          font-weight: 700;
          padding: 0 14px;
          cursor: pointer;
        }

        .profile-cta {
          min-height: 38px;
        }

        .profile-danger-zone {
          margin-top: 12px;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 10px;
          background: rgba(254, 242, 242, 0.8);
        }

        .profile-danger-zone p {
          margin: 0 0 8px;
          font-size: 13px;
          color: #7f1d1d;
        }

        .profile-danger-btn {
          min-height: 38px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(130deg, #dc2626, #b91c1c);
          color: white;
          font-weight: 700;
          padding: 0 14px;
          cursor: pointer;
        }

        .profile-danger-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        @keyframes dd-profile-line {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes dd-profile-area {
          to {
            opacity: 1;
          }
        }

        @keyframes dd-profile-dot {
          from {
            opacity: 0;
            transform: scale(0.3);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        [data-theme="dark"] .profile-hero {
          background:
            radial-gradient(circle at 16% 10%, rgba(37, 99, 235, 0.32), transparent 48%),
            radial-gradient(circle at 75% 12%, rgba(16, 185, 129, 0.32), transparent 46%),
            linear-gradient(125deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.92));
        }

        [data-theme="dark"] .profile-hero p,
        [data-theme="dark"] .profile-insights li,
        [data-theme="dark"] .profile-stat small {
          color: #cbd5e1;
        }

        [data-theme="dark"] .profile-panel,
        [data-theme="dark"] .profile-stat,
        [data-theme="dark"] .profile-graph {
          background: rgba(30, 41, 59, 0.84);
          border-color: rgba(71, 85, 105, 0.62);
        }

        [data-theme="dark"] .profile-segmented {
          background: rgba(15, 23, 42, 0.8);
        }

        [data-theme="dark"] .profile-segmented button {
          color: #e2e8f0;
        }

        [data-theme="dark"] .profile-form input {
          background: rgba(15, 23, 42, 0.9);
          color: #e2e8f0;
          border-color: rgba(71, 85, 105, 0.72);
        }

        [data-theme="dark"] .profile-danger-zone {
          background: rgba(127, 29, 29, 0.22);
          border-color: rgba(248, 113, 113, 0.36);
        }

        [data-theme="dark"] .profile-danger-zone p {
          color: #fecaca;
        }

        @media (max-width: 920px) {
          .profile-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .profile-page {
            padding: 0 12px;
          }

          .profile-hero,
          .profile-panel {
            padding: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
