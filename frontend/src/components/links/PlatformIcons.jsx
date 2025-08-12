import React from "react";

// Minimal, brand-inspired monogram SVGs to avoid heavy assets
// Each icon is a rounded square with a two-letter code; colors follow brand accents
export const platformMeta = {
  leetcode: { name: "LeetCode", fg: "#f59e0b", bg: "#0f0f0f", code: "LC" },
  codechef: { name: "CodeChef", fg: "#f5e6ca", bg: "#3b2f2f", code: "CC" },
  codeforces: { name: "Codeforces", fg: "#ef4444", bg: "#0b2e5b", code: "CF" },
  smartinterviews: {
    name: "SmartInterviews",
    fg: "#34d399",
    bg: "#0b3a5b",
    code: "SI",
  },
  striverSheet: {
    name: "Striver Sheet",
    fg: "#34d399",
    bg: "#0b3d1f",
    code: "SS",
  },
  linkedin: { name: "LinkedIn", fg: "#ffffff", bg: "#0a66c2", code: "in" },
  github: { name: "GitHub", fg: "#e5e7eb", bg: "#000000", code: "GH" },
  discord: { name: "Discord", fg: "#ffffff", bg: "#5865F2", code: "DC" },
  spotify: { name: "Spotify", fg: "#0b0b0b", bg: "#1DB954", code: "SP" },
  eduprime: { name: "EduPrime", fg: "#ffffff", bg: "#1e3a8a", code: "ED" },
  youtube: { name: "YouTube", fg: "#ffffff", bg: "#ff0000", code: "YT" },
  gmail: { name: "Gmail", fg: "#111827", bg: "#ffffff", code: "GM" },
  atcoder: { name: "AtCoder", fg: "#a5f3fc", bg: "#0b2e5b", code: "AC" },
  spoj: { name: "SPOJ", fg: "#60a5fa", bg: "#1f2937", code: "SJ" },
  hackerrank: { name: "HackerRank", fg: "#2ec866", bg: "#0b3d2a", code: "HR" },
  interviewbit: {
    name: "InterviewBit",
    fg: "#38bdf8",
    bg: "#0b2e5b",
    code: "IB",
  },
};

export function PlatformIcon({ keyName, size = 44, radius = 10, ariaLabel }) {
  const meta = platformMeta[keyName] || {
    name: keyName,
    fg: "#e5e7eb",
    bg: "#111827",
    code: keyName?.slice(0, 2)?.toUpperCase() || "?",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={ariaLabel || meta.name}
      style={{ display: "block" }}
    >
      <rect x="0" y="0" width={size} height={size} rx={radius} fill={meta.bg} />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif"
        fontSize={Math.round(size * 0.42)}
        fill={meta.fg}
      >
        {meta.code}
      </text>
    </svg>
  );
}

export default PlatformIcon;
