import React, { useEffect, useState } from "react";

const fields = [
  { key: "leetcode", label: "LeetCode" },
  { key: "codechef", label: "CodeChef" },
  { key: "codeforces", label: "Codeforces" },
  { key: "hackerrank", label: "HackerRank" },
  { key: "spoj", label: "SPOJ" },
  { key: "interviewbit", label: "InterviewBit" },
  { key: "atcoder", label: "AtCoder" },
  { key: "smartinterviews", label: "SmartInterviews" },
  { key: "striverSheet", label: "Striver Sheet" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
  { key: "discord", label: "Discord" },
  { key: "spotify", label: "Spotify" },
  { key: "eduprime", label: "EduPrime" },
  { key: "youtube", label: "YouTube" },
  { key: "gmail", label: "Gmail" },
];

export default function LinksModal({ open, initial, onClose, onSave }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues(initial || {});
    setErrors({});
  }, [initial, open]);

  if (!open) return null;

  const validate = () => {
    const errs = {};
    for (const f of fields) {
      const v = (values[f.key] || "").trim();
      // Allow empty. Only flag obvious invalid characters; backend will normalize protocol.
      if (v && /["'<>\s]/.test(v)) errs[f.key] = "Contains invalid characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="modal-backdrop"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="modal" style={{ maxHeight: "80vh", overflow: "auto" }}>
        <h3 style={{ marginTop: 0 }}>Edit Links</h3>
        <div className="grid" style={{ gap: 10 }}>
          {fields.map((f) => (
            <label key={f.key} style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: 12 }}>{f.label}</span>
              <input
                aria-label={f.label}
                placeholder={`https://... (${f.label})`}
                value={values[f.key] || ""}
                onChange={(e) =>
                  setValues({ ...values, [f.key]: e.target.value })
                }
              />
              {errors[f.key] && (
                <span role="alert" style={{ color: "#ef4444", fontSize: 12 }}>
                  {errors[f.key]}
                </span>
              )}
            </label>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 12,
          }}
        >
          <button className="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="button primary"
            onClick={() => {
              if (!validate()) return;
              onSave(values);
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
