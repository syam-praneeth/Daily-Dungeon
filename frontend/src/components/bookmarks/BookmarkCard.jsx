import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.995 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 220, damping: 22 },
  },
  exit: { opacity: 0, y: -6, scale: 0.995, transition: { duration: 0.14 } },
};

export default function BookmarkCard({
  bookmark,
  onEdit,
  onDelete,
  onPin,
  className,
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState({
    name: bookmark.name,
    url: bookmark.url,
  });
  const nameRef = useRef(null);

  function startEdit() {
    setEditing(true);
    setTimeout(() => nameRef.current?.focus(), 50);
  }

  function cancel() {
    setLocal({ name: bookmark.name, url: bookmark.url });
    setEditing(false);
  }

  return (
    <motion.article
      layoutId={bookmark._id}
      layout
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={cardVariants}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      className={className}
      style={{
        background: "linear-gradient(180deg,#ffffff,#f8fafc)",
        borderRadius: 12,
        padding: 14,
        boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      {!editing ? (
        <>
          <div
            role="link"
            tabIndex={0}
            onClick={(e) => {
              // default behavior: navigate to url
              window.open(bookmark.url, "_blank", "noopener,noreferrer");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                window.open(bookmark.url, "_blank", "noopener,noreferrer");
            }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              gap: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>
                {bookmark.name}
              </h3>
              <div
                style={{
                  color: "#065f46",
                  fontSize: 13,
                  marginTop: 6,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={bookmark.url}
              >
                {bookmark.url}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "start",
                flex: "0 0 auto",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPin?.(bookmark);
                }}
                aria-label={
                  bookmark.pinned
                    ? `Unpin ${bookmark.name}`
                    : `Pin ${bookmark.name}`
                }
                title={bookmark.pinned ? "Unpin" : "Pin"}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  flex: "0 0 auto",
                }}
              >
                {bookmark.pinned ? "📌" : "📍"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit();
                }}
                aria-label={`Edit ${bookmark.name}`}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  flex: "0 0 auto",
                }}
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(bookmark);
                }}
                aria-label={`Delete ${bookmark.name}`}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  flex: "0 0 auto",
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "grid", gap: 8 }}>
            <input
              ref={nameRef}
              value={local.name}
              onChange={(e) =>
                setLocal((s) => ({ ...s, name: e.target.value }))
              }
              style={{
                padding: 8,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            />
            <input
              value={local.url}
              onChange={(e) => setLocal((s) => ({ ...s, url: e.target.value }))}
              style={{
                padding: 8,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  onEdit(bookmark._id, local);
                  setEditing(false);
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "#0f172a",
                  color: "white",
                  border: "none",
                }}
              >
                Save
              </button>
              <button
                onClick={cancel}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "white",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </motion.article>
  );
}
