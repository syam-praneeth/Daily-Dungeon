import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 220, damping: 24 },
  },
  exit: { opacity: 0, y: -8, scale: 0.99, transition: { duration: 0.16 } },
};

function getHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "invalid-url";
  }
}

export default function BookmarkCard({ bookmark, onEdit, onDelete, onPin }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState({
    name: bookmark.name,
    url: bookmark.url,
  });
  const nameRef = useRef(null);

  function startEdit() {
    setEditing(true);
    setTimeout(() => nameRef.current?.focus(), 40);
  }

  function cancel() {
    setLocal({ name: bookmark.name, url: bookmark.url });
    setEditing(false);
  }

  return (
    <motion.article
      layout
      layoutId={bookmark._id}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={cardVariants}
      whileHover={{ y: -3 }}
      className={`bookmark-card ${bookmark.pinned ? "is-pinned" : ""}`}
    >
      {!editing ? (
        <>
          <div className="bookmark-card__head">
            <span className="bookmark-card__host">{getHost(bookmark.url)}</span>
            <button
              type="button"
              className="bookmark-card__pin"
              onClick={() => onPin?.(bookmark)}
              aria-label={bookmark.pinned ? `Unpin ${bookmark.name}` : `Pin ${bookmark.name}`}
              title={bookmark.pinned ? "Unpin" : "Pin"}
            >
              {bookmark.pinned ? "PINNED" : "PIN"}
            </button>
          </div>

          <button
            type="button"
            className="bookmark-card__body"
            onClick={() => window.open(bookmark.url, "_blank", "noopener,noreferrer")}
          >
            <h3>{bookmark.name}</h3>
            <p title={bookmark.url}>{bookmark.url}</p>
          </button>

          <div className="bookmark-card__actions">
            <button type="button" onClick={startEdit}>
              Edit
            </button>
            <button type="button" onClick={() => onDelete(bookmark)} className="danger">
              Delete
            </button>
          </div>
        </>
      ) : (
        <div className="bookmark-card__editor">
          <label>
            Name
            <input
              ref={nameRef}
              value={local.name}
              onChange={(e) => setLocal((s) => ({ ...s, name: e.target.value }))}
            />
          </label>
          <label>
            URL
            <input
              value={local.url}
              onChange={(e) => setLocal((s) => ({ ...s, url: e.target.value }))}
            />
          </label>
          <div className="bookmark-card__actions">
            <button
              type="button"
              onClick={() => {
                onEdit(bookmark._id, local);
                setEditing(false);
              }}
            >
              Save
            </button>
            <button type="button" onClick={cancel} className="ghost">
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`
        .bookmark-card {
          border-radius: 14px;
          border: 1px solid rgba(148, 163, 184, 0.35);
          background:
            linear-gradient(165deg, rgba(255, 255, 255, 0.97), rgba(241, 245, 249, 0.86));
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.07);
          padding: 12px;
          display: grid;
          gap: 10px;
          min-height: 170px;
          position: relative;
          overflow: hidden;
        }

        .bookmark-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(140deg, rgba(14, 165, 233, 0.12), transparent 45%, rgba(251, 146, 60, 0.12));
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }

        .bookmark-card:hover::before {
          opacity: 1;
        }

        .bookmark-card.is-pinned {
          border-color: rgba(37, 99, 235, 0.45);
          box-shadow: 0 14px 30px rgba(37, 99, 235, 0.18);
        }

        .bookmark-card__head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .bookmark-card__host {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #0369a1;
          text-transform: uppercase;
        }

        .bookmark-card__pin {
          min-height: 28px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.55);
          background: rgba(255, 255, 255, 0.72);
          color: #334155;
          padding: 0 10px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.07em;
          cursor: pointer;
        }

        .bookmark-card__body {
          border: none;
          background: transparent;
          text-align: left;
          padding: 0;
          cursor: pointer;
          display: grid;
          gap: 5px;
        }

        .bookmark-card__body h3 {
          margin: 0;
          color: #0f172a;
          font-size: 1rem;
        }

        .bookmark-card__body p {
          margin: 0;
          color: #0f766e;
          font-size: 0.84rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bookmark-card__actions {
          margin-top: auto;
          display: flex;
          gap: 8px;
        }

        .bookmark-card__actions button {
          flex: 1;
          min-height: 34px;
          border-radius: 9px;
          border: 1px solid rgba(148, 163, 184, 0.5);
          background: white;
          color: #0f172a;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .bookmark-card__actions button.danger {
          border-color: rgba(244, 63, 94, 0.45);
          color: #be123c;
        }

        .bookmark-card__actions button.ghost {
          color: #475569;
        }

        .bookmark-card__editor {
          display: grid;
          gap: 8px;
        }

        .bookmark-card__editor label {
          display: grid;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #475569;
        }

        .bookmark-card__editor input {
          min-height: 38px;
          border-radius: 9px;
          border: 2px solid rgba(203, 213, 225, 0.75);
          padding: 8px 10px;
          font: inherit;
        }

        .bookmark-card__editor input:focus {
          outline: none;
          border-color: #0284c7;
          box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.2);
        }

        [data-theme="dark"] .bookmark-card {
          background: linear-gradient(165deg, rgba(30, 41, 59, 0.92), rgba(15, 23, 42, 0.86));
          border-color: rgba(71, 85, 105, 0.62);
        }

        [data-theme="dark"] .bookmark-card__body h3,
        [data-theme="dark"] .bookmark-card__actions button,
        [data-theme="dark"] .bookmark-card__editor label {
          color: #e2e8f0;
        }

        [data-theme="dark"] .bookmark-card__pin,
        [data-theme="dark"] .bookmark-card__actions button,
        [data-theme="dark"] .bookmark-card__editor input {
          background: rgba(15, 23, 42, 0.88);
          border-color: rgba(71, 85, 105, 0.75);
        }

        [data-theme="dark"] .bookmark-card__body p {
          color: #34d399;
        }
      `}</style>
    </motion.article>
  );
}
