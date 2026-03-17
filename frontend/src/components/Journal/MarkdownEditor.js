import React, { useEffect, useMemo, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

const options = [
  {
    key: "h1",
    label: "Heading 1",
    icon: "H1",
    apply: (line) => ({
      text: `# ${line.replace(/^\s*#*\s*/, "")}`,
      caretShift: 0,
    }),
  },
  {
    key: "h2",
    label: "Heading 2",
    icon: "H2",
    apply: (line) => ({
      text: `## ${line.replace(/^\s*#*\s*/, "")}`,
      caretShift: 0,
    }),
  },
  {
    key: "p",
    label: "Paragraph",
    icon: "P",
    apply: (line) => ({
      text: line.replace(/^(\s*#*\s*|\s*[-*]\s+|\s*\d+\.\s+|\s*>\s+)/, ""),
      caretShift: 0,
    }),
  },
  {
    key: "ul",
    label: "Bullet List",
    icon: "•",
    apply: (line) => ({
      text: `- ${line.replace(/^\s*([-*]|\d+\.)\s+/, "")}`,
      caretShift: 0,
    }),
  },
  {
    key: "ol",
    label: "Numbered List",
    icon: "1.",
    apply: (line) => ({
      text: `1. ${line.replace(/^\s*([-*]|\d+\.)\s+/, "")}`,
      caretShift: 0,
    }),
  },
  {
    key: "quote",
    label: "Quote",
    icon: "❝",
    apply: (line) => ({
      text: `> ${line.replace(/^\s*>\s*/, "")}`,
      caretShift: 0,
    }),
  },
  { key: "code", label: "Code Block", icon: "</>", applyBlock: true },
];

export default function MarkdownEditor({ value, onChange }) {
  const [showMenu, setShowMenu] = useState(false);
  const [filter, setFilter] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const taRef = useRef(null);
  const wrapperRef = useRef(null);

  const filtered = useMemo(() => {
    const f = (filter || "").replace(/^[\\\/]+/, "").toLowerCase();
    const list = !f
      ? options
      : options.filter(
          (o) => o.label.toLowerCase().includes(f) || o.key.includes(f)
        );
    return list;
  }, [filter]);

  const closeMenu = () => {
    setShowMenu(false);
    setFilter("");
    setActiveIndex(0);
  };

  const insertAtLineStart = (applyFn) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? start;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const lineStart = before.lastIndexOf("\n") + 1;
    const lineEndRel = after.indexOf("\n");
    const lineEnd = lineEndRel >= 0 ? end + lineEndRel : value.length;
    const currentLine = value.slice(lineStart, lineEnd);

    const { text: newLine } = applyFn(currentLine);
    const newValue = value.slice(0, lineStart) + newLine + value.slice(lineEnd);
    const newCaret = lineStart + newLine.length;
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newCaret, newCaret);
    });
    closeMenu();
  };

  const insertCodeBlock = () => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? start;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const snippet = "```\n\n```";
    const caretPos = start + 4;
    const newValue = before + snippet + after;
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(caretPos, caretPos);
    });
    closeMenu();
  };

  const handleKeyDown = (e) => {
    if (e.key === "/") {
      e.preventDefault();
      setShowMenu(true);
      setFilter("");
      setActiveIndex(0);
      return;
    }
    if (showMenu && e.key === "Escape") {
      e.preventDefault();
      closeMenu();
    }
  };

  const handleMenuKeyDown = (e) => {
    if (!showMenu) return;
    const last = Math.max(0, filtered.length - 1);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i >= last ? 0 : i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? last : i - 1));
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (!filtered.length) return;
      e.preventDefault();
      const opt = filtered[activeIndex] || filtered[0];
      if (opt.applyBlock) {
        insertCodeBlock();
      } else {
        insertAtLineStart(opt.apply);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
    }
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) closeMenu();
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [filter, showMenu]);

  return (
    <div className="dd-md-editor" ref={wrapperRef}>
      <TextareaAutosize
        ref={taRef}
        minRows={5}
        maxRows={20}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className="dd-md-editor__textarea"
        placeholder="Start typing... (Press '/' for formatting options)"
      />

      {showMenu && (
        <div className="dd-md-editor__menu">
          <div className="dd-md-editor__menu-header">
            <input
              autoFocus
              className="dd-md-editor__menu-search"
              placeholder="Search formatting..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={handleMenuKeyDown}
            />
          </div>
          <ul className="dd-md-editor__menu-list" onKeyDown={handleMenuKeyDown}>
            {filtered.map((opt, idx) => (
              <li key={opt.key}>
                <button
                  type="button"
                  className={`dd-md-editor__menu-item ${idx === activeIndex ? "active" : ""}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() =>
                    opt.applyBlock ? insertCodeBlock() : insertAtLineStart(opt.apply)
                  }
                >
                  <span className="dd-md-editor__menu-icon">{opt.icon}</span>
                  <span className="dd-md-editor__menu-label">{opt.label}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="dd-md-editor__menu-empty">No matching commands</li>
            )}
          </ul>
        </div>
      )}

      <style>{`
        .dd-md-editor {
          position: relative;
          width: 100%;
          overflow: visible;
        }

        .dd-md-editor__textarea {
          width: 100%;
          min-height: 120px;
          padding: 16px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 12px;
          background: var(--dd-bg-card-solid, #FFFFFF);
          color: var(--dd-text-primary, #0F172A);
          font-family: inherit;
          font-size: 15px;
          line-height: 1.6;
          resize: vertical;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .dd-md-editor__textarea:focus {
          outline: none;
          border-color: var(--dd-lavender-400, #A78BFA);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }

        .dd-md-editor__textarea::placeholder {
          color: var(--dd-text-muted, #94A3B8);
        }

        .dd-md-editor__menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 280px;
          background: var(--dd-bg-card-solid, #FFFFFF);
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(15, 23, 42, 0.15);
          z-index: 1000;
          overflow: hidden;
          animation: dd-menu-appear 0.15s ease;
        }

        @keyframes dd-menu-appear {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dd-md-editor__menu-header {
          padding: 12px;
          border-bottom: 1px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
        }

        .dd-md-editor__menu-search {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 8px;
          background: var(--dd-bg-secondary, #F8FAFC);
          color: var(--dd-text-primary, #0F172A);
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .dd-md-editor__menu-search:focus {
          outline: none;
          border-color: var(--dd-lavender-400, #A78BFA);
          background: var(--dd-bg-card-solid, #FFFFFF);
        }

        .dd-md-editor__menu-search::placeholder {
          color: var(--dd-text-muted, #94A3B8);
        }

        .dd-md-editor__menu-list {
          list-style: none;
          margin: 0;
          padding: 8px;
          max-height: 240px;
          overflow-y: auto;
        }

        .dd-md-editor__menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: var(--dd-text-primary, #0F172A);
          font-size: 14px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .dd-md-editor__menu-item:hover,
        .dd-md-editor__menu-item.active {
          background: var(--dd-lavender-100, #EDE9FE);
          color: var(--dd-lavender-700, #6D28D9);
        }

        .dd-md-editor__menu-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: var(--dd-bg-secondary, #F1F5F9);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          color: var(--dd-text-muted, #64748B);
          flex-shrink: 0;
        }

        .dd-md-editor__menu-item:hover .dd-md-editor__menu-icon,
        .dd-md-editor__menu-item.active .dd-md-editor__menu-icon {
          background: var(--dd-lavender-200, #DDD6FE);
          color: var(--dd-lavender-600, #7C3AED);
        }

        .dd-md-editor__menu-label {
          flex: 1;
        }

        .dd-md-editor__menu-empty {
          padding: 16px;
          text-align: center;
          color: var(--dd-text-muted, #64748B);
          font-size: 14px;
        }

        /* Dark theme */
        [data-theme="dark"] .dd-md-editor__textarea {
          background: var(--dd-bg-secondary, #1E293B);
          border-color: var(--dd-border-medium, #334155);
        }

        [data-theme="dark"] .dd-md-editor__menu {
          background: var(--dd-bg-secondary, #1E293B);
          border-color: var(--dd-border-medium, #334155);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        [data-theme="dark"] .dd-md-editor__menu-search {
          background: var(--dd-bg-tertiary, #334155);
          border-color: var(--dd-border-medium, #334155);
        }

        [data-theme="dark"] .dd-md-editor__menu-icon {
          background: var(--dd-bg-tertiary, #334155);
        }

        [data-theme="dark"] .dd-md-editor__menu-item:hover,
        [data-theme="dark"] .dd-md-editor__menu-item.active {
          background: rgba(139, 92, 246, 0.2);
        }
      `}</style>
    </div>
  );
}
