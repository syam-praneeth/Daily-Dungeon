import React, { useState } from "react";

const brand = {
  LeetCode: { bg: "#0f0f0f", fg: "#f59e0b" },
  CodeChef: { bg: "#3b2f2f", fg: "#f5e6ca" },
  Codeforces: { bg: "#0b2e5b", fg: "#ef4444" },
  Striver: { bg: "#0b3d1f", fg: "#34d399" },
};

export default function PlatformCard({ platform, link, stats, onEditStats }) {
  const [expanded, setExpanded] = useState(false);
  const b = brand[platform] || { bg: "#111827", fg: "#e5e7eb" };
  const safeLink = typeof link === "string" && /^https?:\/\//i.test(link);

  return (
    <div
      className="card"
      style={{
        background: `linear-gradient(135deg, ${b.bg} 0%, #111 100%)`,
        color: b.fg,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>{platform}</h3>
      </div>
      {stats ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 8,
          }}
        >
          {Object.entries(stats).map(([k, v]) =>
            v && k !== "lastUpdated" ? (
              <div key={k}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{k}</div>
                <div style={{ fontWeight: 600 }}>{v}</div>
              </div>
            ) : null
          )}
          {stats.lastUpdated && (
            <div style={{ gridColumn: "1 / -1", fontSize: 12, opacity: 0.8 }}>
              Last updated: {new Date(stats.lastUpdated).toLocaleString()}
            </div>
          )}
        </div>
      ) : (
        <div className="muted">Stats not provided.</div>
      )}
      <div
        style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}
      >
        {safeLink ? (
          <a className="button" href={link} target="_blank" rel="noreferrer">
            View Profile
          </a>
        ) : (
          <span className="muted" style={{ fontSize: 12 }}>
            Link not set
          </span>
        )}
        {onEditStats ? (
          <button className="button" onClick={() => setExpanded((x) => !x)}>
            {expanded ? "Hide" : "Edit Stats"}
          </button>
        ) : null}
      </div>
      {onEditStats && expanded ? (
        <div style={{ marginTop: 12 }}>{onEditStats}</div>
      ) : null}
    </div>
  );
}
