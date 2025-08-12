import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { TimerContext } from "../context/TimerContext";
import ProgressRing from "../components/Dashboard/ProgressRing";
import Sparkline from "../components/charts/Sparkline";
import BarChart from "../components/charts/BarChart";
import axios from "../api/axios";
import LinksGrid from "../components/links/LinksGrid";
import LinksModal from "../components/links/LinksModal";
import Toast from "../components/common/Toast";

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const { streak, fetchStreak } = useContext(TimerContext);
  const [recentSessions, setRecentSessions] = useState([]);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  // CP State
  const [cpLoading, setCpLoading] = useState(false);
  const [cp, setCp] = useState({
    mode: "manual",
    links: {},
    usernames: {},
    preferences: { showScorecards: true, theme: "auto" },
    selfReportedStats: {},
  });
  // My Links state
  const [links, setLinks] = useState({});
  const [linksOpen, setLinksOpen] = useState(false);
  const [linksLoading, setLinksLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "" });

  const save = (e) => {
    e.preventDefault();
    // TODO: implement profile save endpoint
    alert("Profile saved (mock).");
  };

  useEffect(() => {
    fetchStreak?.();
    // fetch last ~60 days of sessions for charts
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 60);
    const qs = `from=${encodeURIComponent(
      start.toISOString()
    )}&to=${encodeURIComponent(end.toISOString())}`;
    axios
      .get(`/readingSessions?${qs}`)
      .then((res) => setRecentSessions(res.data || []))
      .catch(() => setRecentSessions([]));
  }, []);

  // Load CP config
  const loadCP = async () => {
    try {
      setCpLoading(true);
      const a = await axios.get("/profile/cp");
      setCp(a.data || cp);
    } catch (e) {
      // noop: keep defaults
    } finally {
      setCpLoading(false);
    }
  };
  useEffect(() => {
    loadCP();
  }, []);

  // Load My Links
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

  // Consistency scoring (last 30 days, IST-based)
  const tz = "Asia/Kolkata";
  const toISTDate = (d) =>
    new Date(d).toLocaleDateString("en-CA", { timeZone: tz });
  const today = useMemo(
    () => new Date().toLocaleDateString("en-CA", { timeZone: tz }),
    []
  );
  const activeSet = useMemo(() => {
    const s = new Set();
    (streak || [])
      .filter((d) => d.isActive)
      .forEach((d) => {
        if (d.date) s.add(toISTDate(d.date));
      });
    return s;
  }, [streak]);

  const lastNDays = (n) => {
    const out = [];
    const base = new Date(`${today}T00:00:00+05:30`);
    for (let i = n - 1; i >= 0; i--) {
      const dt = new Date(base);
      dt.setDate(base.getDate() - i);
      out.push(dt.toLocaleDateString("en-CA", { timeZone: tz }));
    }
    return out;
  };

  const days30 = lastNDays(30);
  const active30 = days30.map((d) => (activeSet.has(d) ? 1 : 0));
  const consistency30 = active30.reduce((a, b) => a + b, 0) / 30; // 0..1

  // Simple “streak momentum”: rolling 7-day average for sparkline
  const spark = useMemo(() => {
    const win = 7;
    const arr = [];
    for (let i = 0; i < active30.length; i++) {
      const start = Math.max(0, i - win + 1);
      const slice = active30.slice(start, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      arr.push(Number((avg * 100).toFixed(0))); // percent for nicer scale
    }
    return arr;
  }, [active30]);

  // Growth charts from recentSessions

  const weekdayDistribution = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const totals = Array(7).fill(0);
    recentSessions.forEach((s) => {
      const src = s.date || s.startTime;
      if (!src) return;
      const d = new Date(src);
      // Convert to IST weekday
      const dStr = d.toLocaleDateString("en-CA", { timeZone: tz });
      const ist = new Date(dStr + "T00:00:00+05:30");
      const wd = ist.getDay(); // 0..6 Sun..Sat
      const idx = (wd + 6) % 7; // 0..6 Mon..Sun
      totals[idx] += Math.round((Number(s.duration) || 0) / 60);
    });
    return { labels: days, values: totals };
  }, [recentSessions]);

  return (
    <div className="container">
      <h2>Profile & Settings</h2>
      <style>{`
        .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:50}
        .modal{background:var(--card-bg, #111827);color:var(--fg, #e5e7eb);padding:16px;border-radius:8px;min-width:320px;max-width:560px;width:100%}
        .badge{background:#e5e7eb;color:#111;border-radius:999px;padding:2px 8px;font-size:12px}
        .primary{background:#6366f1;border-color:#6366f1}
      `}</style>
      <div className="card">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
          <div style={{ flex: "0 0 auto" }}>
            <ProgressRing
              value={consistency30}
              label={`${Math.round(consistency30 * 100)}% consistency`}
              caption={"Last 30 days"}
              color="#6366f1"
            />
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              7-day momentum
            </div>
            <Sparkline data={spark} width={420} height={80} />
            <div className="muted" style={{ marginTop: 6 }}>
              Daily activity (1 = active, 0 = inactive) smoothed over 7 days.
            </div>
          </div>
        </div>
      </div>
      {/* Competitive Programming overview removed per request */}
      {/* My Links */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0 }}>My Links</h3>
          <button className="button primary" onClick={() => setLinksOpen(true)}>
            Edit Links
          </button>
        </div>
        <div style={{ marginTop: 12 }}>
          <LinksGrid
            links={links}
            loading={linksLoading}
            onEdit={() => setLinksOpen(true)}
          />
        </div>
      </div>
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
          } catch {}
        }}
      />
      <Toast
        open={toast.open}
        message={toast.msg}
        onClose={() => setToast({ open: false, msg: "" })}
      />
      <div className="card">
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            Weekday distribution
          </div>
          <BarChart
            values={weekdayDistribution.values}
            labels={weekdayDistribution.labels}
            width={720}
            height={160}
            color="#f59e0b"
            showAxis
          />
        </div>
      </div>
      <div className="card">
        <form onSubmit={save} className="grid">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
