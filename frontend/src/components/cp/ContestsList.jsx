import React, { useMemo, useState } from "react";

const pillColor = (p) =>
  ({ LeetCode: "#f59e0b", CodeChef: "#8b5e34", Codeforces: "#3b82f6" }[p] ||
  "#9ca3af");

export default function ContestsList({
  items,
  onEdit,
  onDelete,
  onToggleRemind,
}) {
  const [filter, setFilter] = useState({ platform: "all", status: "all" });
  const sorted = useMemo(
    () =>
      [...(items || [])].sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      ),
    [items]
  );

  const filtered = useMemo(() => {
    return sorted.filter((c) => {
      if (filter.platform !== "all" && c.platform !== filter.platform)
        return false;
      if (filter.status !== "all" && c.status !== filter.status) return false;
      return true;
    });
  }, [sorted, filter]);

  return (
    <div className="card">
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select
          value={filter.platform}
          onChange={(e) => setFilter({ ...filter, platform: e.target.value })}
        >
          <option value="all">All platforms</option>
          <option value="LeetCode">LeetCode</option>
          <option value="CodeChef">CodeChef</option>
          <option value="Codeforces">Codeforces</option>
        </select>
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="all">All statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="running">Running</option>
          <option value="finished">Finished</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="muted">No contests.</div>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: 8,
          }}
        >
          {filtered.map((c) => (
            <li key={c._id} className="card" style={{ padding: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      background: pillColor(c.platform),
                      color: "#111",
                      borderRadius: 999,
                      padding: "2px 8px",
                      fontWeight: 600,
                    }}
                  >
                    {c.platform}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{c.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      {new Date(c.startTime).toLocaleString()} ·{" "}
                      {c.durationMinutes} min
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <a
                    className="button"
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Go to Contest
                  </a>
                  <button className="button" onClick={() => onEdit(c)}>
                    Edit
                  </button>
                  <button className="button" onClick={() => onDelete(c)}>
                    Delete
                  </button>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!c.remind}
                      onChange={(e) => onToggleRemind(c, e.target.checked)}
                    />
                    Remind me
                  </label>
                </div>
              </div>
              {c.notes && (
                <div className="muted" style={{ marginTop: 6 }}>
                  {c.notes}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
