import React, { useEffect } from "react";

export default function Toast({ open, message, onClose, duration = 2500 }) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(id);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 60 }}>
      <div
        role="status"
        aria-live="polite"
        style={{
          background: "#111827",
          color: "#e5e7eb",
          border: "1px solid #374151",
          borderRadius: 12,
          padding: "10px 14px",
          boxShadow: "0 12px 32px -12px rgba(0,0,0,.5)",
          maxWidth: 360,
        }}
      >
        {message}
      </div>
    </div>
  );
}
