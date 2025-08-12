import React from "react";
import PlatformIcon, { platformMeta } from "./PlatformIcons";

const order = [
  "leetcode",
  "codechef",
  "codeforces",
  "smartinterviews",
  "striverSheet",
  "linkedin",
  "github",
  "discord",
  "spotify",
  "eduprime",
  "youtube",
  "gmail",
  "atcoder",
  "spoj",
  "hackerrank",
  "interviewbit",
];

export default function LinksGrid({ links = {}, onEdit, loading = false }) {
  const items = order.filter((k) => platformMeta[k]);

  return (
    <div>
      <style>{`
        .links-grid { display:grid; gap:12px; }
        @media (min-width: 768px){ .links-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 767px){ .links-grid { grid-template-columns: repeat(1, 1fr); } }
  .link-card { border-radius: 9999px; overflow: hidden; padding: 10px 15px; box-shadow: 0 10px 30px -12px rgba(0,0,0,.5); border: 1px solid rgba(255,255,255,0.12); background-clip: padding-box; display:flex; align-items:center; justify-content:space-between; min-height:64px; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; outline: none; text-decoration: none; }
        .link-card:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 14px 36px -14px rgba(0,0,0,.6); border-color: rgba(255,255,255,0.2); }
        .link-card:focus-visible { box-shadow: 0 0 0 3px #a78bfa, 0 14px 36px -14px rgba(0,0,0,.6); }
        .link-meta { display:flex; align-items:center; gap:10px; min-width:0; }
        .link-title { font-weight:700; margin:0; letter-spacing:.2px }
        .link-title a { color: inherit; text-decoration: none; }
        .link-title a:hover, .link-title a:focus { text-decoration: underline; }
  .link-cta { background: rgba(255,255,255,0.12); color: inherit; padding: 6px 10px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.18); font-weight:600; }
  .skeleton { background: linear-gradient(90deg, #111827, #1f2937, #111827); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 9999px; height:64px; }
        @keyframes shimmer { 0%{ background-position: 200% 0 } 100%{ background-position: -200% 0 } }
      `}</style>

      <div className="links-grid" role="list">
        {loading
          ? Array.from({ length: items.length || 8 }).map((_, i) => (
              <div key={i} className="skeleton" />
            ))
          : items.map((key) => {
              const meta = platformMeta[key];
              const url = links[key] || "";
              const has = !!url;

              return has ? (
                <a
                  key={key}
                  className="card link-card"
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: meta.bg,
                    backgroundImage: `linear-gradient(135deg, ${meta.bg} 0%, color-mix(in srgb, ${meta.bg} 80%, white) 35%, #000 100%)`,
                    color: meta.fg,
                    boxShadow: `0 12px 32px -12px ${meta.fg}33`,
                  }}
                  role="listitem"
                  aria-label={`${meta.name} link card (opens in new tab)`}
                >
                  <div className="link-meta">
                    <div style={{ flex: "0 0 auto" }}>
                      <PlatformIcon
                        keyName={key}
                        ariaLabel={`${meta.name} icon`}
                        size={32}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 className="link-title">{meta.name}</h3>
                    </div>
                  </div>
                  <span className="link-cta" aria-hidden="true">
                    Visit
                  </span>
                </a>
              ) : (
                <div
                  key={key}
                  className="card link-card"
                  style={{
                    backgroundColor: meta.bg,
                    backgroundImage: `linear-gradient(135deg, ${meta.bg} 0%, color-mix(in srgb, ${meta.bg} 80%, white) 35%, #000 100%)`,
                    color: meta.fg,
                  }}
                  tabIndex={0}
                  role="listitem"
                  aria-label={`${meta.name} link card`}
                >
                  <div className="link-meta">
                    <div style={{ flex: "0 0 auto" }}>
                      <PlatformIcon
                        keyName={key}
                        ariaLabel={`${meta.name} icon`}
                        size={32}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 className="link-title">{meta.name}</h3>
                    </div>
                  </div>
                  <button
                    className="button"
                    onClick={onEdit}
                    aria-label={`Add ${meta.name} link`}
                  >
                    Add Link
                  </button>
                </div>
              );
            })}
      </div>
    </div>
  );
}
