import React, { useMemo } from "react";

export default function ProgressRing({
  value = 0, // 0..1
  size = 96,
  stroke = 10,
  trackColor = "#e2e8f0",
  color = "#10b981", // emerald
  label,
  caption,
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, value)) * c;
  const rest = c - dash;
  const center = size / 2;
  const pct = Math.round((value || 0) * 100);
  const gradientId = useMemo(
    () => `prg_${Math.random().toString(36).slice(2)}`,
    []
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${rest}`}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: "stroke-dasharray 600ms ease" }}
        />
        <text
          x={center}
          y={center + 4}
          textAnchor="middle"
          fontSize="16"
          fontWeight="700"
          fill="#0f172a"
        >
          {pct}%
        </text>
      </svg>
      <div>
        {label ? (
          <div style={{ fontWeight: 700, lineHeight: 1.2 }}>{label}</div>
        ) : null}
        {caption ? (
          <div style={{ color: "#64748b", fontSize: 12 }}>{caption}</div>
        ) : null}
      </div>
    </div>
  );
}
