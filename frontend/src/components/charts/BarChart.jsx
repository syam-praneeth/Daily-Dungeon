import React, { useMemo } from "react";

// Minimal SVG bar chart without external deps
export default function BarChart({
  values = [], // numbers
  labels = [], // strings same length as values (optional)
  width = 420,
  height = 140,
  barGap = 4,
  color = "#22c55e",
  showAxis = false,
  maxValue, // optional max for y scale
}) {
  const { bars, xLabels } = useMemo(() => {
    const n = values.length;
    if (!n) return { bars: [], xLabels: [] };
    const max = maxValue ?? Math.max(1, ...values);
    const barWidth = Math.max(1, Math.floor((width - (n - 1) * barGap) / n));
    let x = 0;
    const bs = values.map((v) => {
      const h = Math.round((Math.max(0, v) / max) * (height - 2));
      const bar = { x, y: height - h, w: barWidth, h };
      x += barWidth + barGap;
      return bar;
    });
    const xs = labels && labels.length === n ? labels : Array(n).fill("");
    return { bars: bs, xLabels: xs };
  }, [values, labels, width, height, barGap, maxValue]);

  return (
    <div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {showAxis ? (
          <g>
            <line
              x1={0}
              y1={height - 1}
              x2={width}
              y2={height - 1}
              stroke="#e5e7eb"
            />
            <line x1={0} y1={0} x2={0} y2={height} stroke="#e5e7eb" />
          </g>
        ) : null}
        {bars.map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx={3}
            fill={color}
            opacity={0.9}
          />
        ))}
      </svg>
      {xLabels.some(Boolean) ? (
        <div style={{ display: "flex", gap: barGap, marginTop: 6 }}>
          {xLabels.map((l, i) => (
            <div
              key={i}
              style={{
                width: `${Math.max(
                  1,
                  Math.floor(
                    (width - (xLabels.length - 1) * barGap) / xLabels.length
                  )
                )}px`,
                textAlign: "center",
                fontSize: 10,
                color: "#6b7280",
              }}
            >
              {l}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
