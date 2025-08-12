import React, { useMemo } from "react";

// Simple SVG sparkline for small time series
export default function Sparkline({
  data = [], // array of numbers
  width = 300,
  height = 80,
  stroke = "#6366f1",
  fill = "rgba(99,102,241,0.12)",
  strokeWidth = 2,
}) {
  const { path, area } = useMemo(() => {
    if (!data || data.length === 0) return { path: "", area: "" };
    const n = data.length;
    const max = Math.max(1, ...data);
    const min = Math.min(0, ...data);
    const span = Math.max(1, max - min);
    const dx = n > 1 ? width / (n - 1) : 0;
    const points = data.map((v, i) => {
      const x = i * dx;
      const y = height - ((v - min) / span) * height;
      return [x, y];
    });
    const d = points
      .map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`))
      .join(" ");
    const a = [
      `M 0,${height}`,
      ...points.map(([x, y], i) => (i === 0 ? `L ${x},${y}` : `L ${x},${y}`)),
      `L ${width},${height}`,
      "Z",
    ].join(" ");
    return { path: d, area: a };
  }, [data, width, height]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {area ? <path d={area} fill={fill} stroke="none" /> : null}
      {path ? (
        <path
          d={path}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
}
