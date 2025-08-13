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
  const baseItems = order.filter((k) => platformMeta[k]);
  const [pinned, setPinned] = React.useState(() => {
    try {
      const raw = localStorage.getItem("dd.links.pinned");
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  });
  const [copiedKey, setCopiedKey] = React.useState(null);

  const normalizedPinned = pinned.filter((k) => baseItems.includes(k));
  const sortedItems = [
    ...normalizedPinned,
    ...baseItems.filter((k) => !normalizedPinned.includes(k)),
  ];

  const savePinned = (arr) => {
    setPinned(arr);
    try {
      localStorage.setItem("dd.links.pinned", JSON.stringify(arr));
    } catch {}
  };
  const togglePin = (key) => {
    if (pinned.includes(key)) {
      savePinned(pinned.filter((k) => k !== key));
    } else {
      savePinned([...pinned, key]);
    }
  };
  const isPinned = (key) => pinned.includes(key);

  // Color helpers to derive pastel backgrounds and accents from brand color
  const hexToRgb = (hex) => {
    const h = hex.replace("#", "");
    const v =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;
    const num = parseInt(v, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  };
  const rgbToHex = ({ r, g, b }) =>
    `#${[r, g, b]
      .map((n) => {
        const m = Math.max(0, Math.min(255, Math.round(n)));
        const s = m.toString(16);
        return s.length === 1 ? "0" + s : s;
      })
      .join("")}`;
  const mix = (c1, c2, t) => {
    const a = hexToRgb(c1);
    const b = hexToRgb(c2);
    return rgbToHex({
      r: a.r + (b.r - a.r) * t,
      g: a.g + (b.g - a.g) * t,
      b: a.b + (b.b - a.b) * t,
    });
  };
  const rgba = (hex, a) => {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };
  const deriveTokens = (brand) => {
    // Pastel top/bottom (very light), bright border, stronger tile, accent
    const top = mix("#ffffff", brand, 0.12);
    const bottom = mix("#ffffff", brand, 0.18);
    const border = mix(brand, "#ffffff", 0.25);
    const accent = mix("#ffffff", brand, 0.5);
    const tileTop = mix("#ffffff", brand, 0.45);
    const tileBottom = mix("#ffffff", brand, 0.35);
    return { top, bottom, border, accent, tileTop, tileBottom };
  };

  return (
    <div>
      <style>{`
  .links-grid { display:grid; gap:20px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 767px){ .links-grid { grid-template-columns: 1fr; } }
  .link-card { border-radius: 28px; padding: 0; min-height: 96px; display:flex; align-items:stretch; justify-content:space-between; box-shadow: 0 8px 24px rgba(0,0,0,0.06); border: 2px solid transparent; transition: transform .2s cubic-bezier(.22,1,.36,1), box-shadow .2s, border-color .2s; outline: none; cursor: pointer; position: relative; overflow: hidden; }
        .link-card:hover { transform: translateY(-2px) scale(1.01); box-shadow: 0 10px 28px rgba(0,0,0,0.10); }
        .link-card:focus-visible { box-shadow: 0 0 0 2px rgba(99,102,241,.4), 0 8px 24px rgba(0,0,0,0.06); }
  .link-meta { display:flex; align-items:center; gap:16px; min-width:0; flex: 1; margin: 16px 18px; }
        .icon-tile { width: 52px; height: 52px; border-radius: 12px; display:grid; place-items:center; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.06); flex: 0 0 auto; }
  .content { flex: 1; min-width: 0; display:flex; flex-direction: column; justify-content: flex-start; gap: 10px; }
        .title-row { display:flex; align-items:center; gap: 10px; flex-wrap: wrap; }
        .link-title { font-weight:600; margin:0; font-size: 17px; color: #0b0b0b; }
         .subtitle { font-size: 12px; color: #6b7280; line-height: 1; }
        .chip { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px; border: 1px solid transparent; }
  .actions { display:flex; align-items:center; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
        .btn { height: 36px; border-radius: 999px; padding: 0 14px; font-weight: 600; font-size: 14px; border: 2px solid transparent; background: transparent; color: #0b0b0b; }
        .btn:disabled { opacity: .7; cursor: not-allowed; }
        .skeleton { background: linear-gradient(90deg, #eef1f5, #f7f9fb, #eef1f5); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 28px; height:128px; }
        @keyframes shimmer { 0%{ background-position: 200% 0 } 100%{ background-position: -200% 0 } }
      `}</style>

      <div className="links-grid" role="list">
        {loading
          ? Array.from({ length: baseItems.length || 8 }).map((_, i) => (
              <div key={i} className="skeleton" />
            ))
          : sortedItems.map((key) => {
              const meta = platformMeta[key];
              const url = links[key] || "";
              const has = !!url;
              const tokens = deriveTokens(meta.bg);
              // Gmail special-case: black border and black edit text
              if (key === "gmail") {
                tokens.border = "#000000";
                tokens.accent = "#000000";
              }

              const getHost = (u) => {
                if (!u) return "";
                try {
                  const parsed = new URL(u);
                  return parsed.hostname.replace(/^www\./, "");
                } catch {
                  try {
                    const parsed = new URL("https://" + u);
                    return parsed.hostname.replace(/^www\./, "");
                  } catch {
                    return "";
                  }
                }
              };
              const open = () => {
                if (has) window.open(url, "_blank", "noreferrer");
              };
              return (
                <div
                  key={key}
                  className="card link-card"
                  style={{
                    background: `linear-gradient(180deg, ${tokens.top}, ${tokens.bottom})`,
                    borderColor: key === "gmail" ? "#000" : tokens.border,
                  }}
                  role="listitem"
                  aria-label={`${meta.name} score card${
                    has ? " (connected)" : " (link not added)"
                  }`}
                  tabIndex={0}
                  onClick={open}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && has) {
                      e.preventDefault();
                      open();
                    }
                  }}
                >
                  {/* Pin toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(key);
                    }}
                    aria-label={
                      isPinned(key) ? `Unpin ${meta.name}` : `Pin ${meta.name}`
                    }
                    title={isPinned(key) ? "Unpin" : "Pin"}
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 999,
                      background: rgba(tokens.top, 0.65),
                      border: `1px solid ${rgba(tokens.border, 0.6)}`,
                      color: tokens.accent,
                      zIndex: 2,
                      cursor: "pointer",
                      lineHeight: 0,
                      boxShadow: `0 2px 6px ${rgba(tokens.border, 0.25)}`,
                    }}
                  >
                    <svg
                      style={{ display: "block" }}
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      preserveAspectRatio="xMidYMid meet"
                      fill={isPinned(key) ? tokens.accent : "none"}
                      stroke={tokens.accent}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M12 17.27L18.18 21 16.54 13.97 22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </button>
                  {/* Decorative background layers */}
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                    }}
                  >
                    {/* Blob top-left */}
                    <div
                      style={{
                        position: "absolute",
                        top: -30,
                        left: -40,
                        width: 180,
                        height: 180,
                        background: `radial-gradient(closest-side, ${rgba(
                          tokens.accent,
                          0.18
                        )}, transparent 70%)`,
                        filter: "blur(8px)",
                      }}
                    />
                    {/* Blob bottom-right */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: -40,
                        right: -30,
                        width: 200,
                        height: 200,
                        background: `radial-gradient(closest-side, ${rgba(
                          tokens.tileTop,
                          0.16
                        )}, transparent 70%)`,
                        filter: "blur(10px)",
                      }}
                    />
                    {/* Accent arc curve */}
                    <div
                      style={{
                        position: "absolute",
                        top: -60,
                        right: -60,
                        width: 220,
                        height: 220,
                        borderRadius: "50%",
                        border: `18px solid ${rgba(tokens.border, 0.25)}`,
                        borderLeftColor: "transparent",
                        borderBottomColor: "transparent",
                        transform: "rotate(20deg)",
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <div className="link-meta">
                    <div
                      className="icon-tile"
                      style={{
                        background: `linear-gradient(180deg, ${tokens.tileTop}, ${tokens.tileBottom})`,
                        borderColor: tokens.border,
                      }}
                    >
                      <PlatformIcon
                        keyName={key}
                        ariaLabel={`${meta.name} icon`}
                        size={32}
                      />
                    </div>
                    <div className="content">
                      <div className="title-row">
                        <h3 className="link-title">{meta.name}</h3>
                        {has ? (
                          <div
                            className="subtitle"
                            aria-label={`${meta.name} host`}
                          >
                            {getHost(url)}
                          </div>
                        ) : null}
                        <span
                          className="chip"
                          style={{
                            background: has
                              ? mix(tokens.top, tokens.accent, 0.18)
                              : "#eef2f7",
                            color: has ? "#0b0b0b" : "#475569",
                            borderColor: has ? tokens.border : "#dbe2ea",
                          }}
                        >
                          {has ? "Connected" : "Link not added"}
                        </span>
                      </div>
                      <div className="actions">
                        <button
                          className="btn"
                          style={{
                            background: has
                              ? mix(tokens.top, tokens.accent, 0.22)
                              : "#f3f6fb",
                            color: has ? "#0b0b0b" : "#64748b",
                            borderColor: has ? tokens.border : "#cbd5e1",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (has) open();
                          }}
                          disabled={!has}
                          aria-label={
                            has
                              ? `Visit ${meta.name}`
                              : `${meta.name} link not added`
                          }
                        >
                          Visit
                        </button>
                        {has ? (
                          <button
                            className="btn"
                            style={{
                              background: mix(tokens.top, tokens.accent, 0.12),
                              color: "#0b0b0b",
                              borderColor: tokens.border,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const doCopy = async () => {
                                try {
                                  if (
                                    navigator.clipboard &&
                                    navigator.clipboard.writeText
                                  ) {
                                    await navigator.clipboard.writeText(url);
                                  } else {
                                    const ta =
                                      document.createElement("textarea");
                                    ta.value = url;
                                    document.body.appendChild(ta);
                                    ta.select();
                                    document.execCommand("copy");
                                    document.body.removeChild(ta);
                                  }
                                  setCopiedKey(key);
                                  setTimeout(() => setCopiedKey(null), 1200);
                                } catch {}
                              };
                              doCopy();
                            }}
                            aria-label={`Copy ${meta.name} link`}
                          >
                            {copiedKey === key ? "Copied" : "Copy"}
                          </button>
                        ) : null}
                        <button
                          className="btn"
                          style={{
                            color: key === "gmail" ? "#000" : tokens.accent,
                            borderColor:
                              key === "gmail" ? "#000" : tokens.border,
                            background: "transparent",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.();
                          }}
                          aria-label={`Edit ${meta.name} link`}
                        >
                          Edit Link
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
