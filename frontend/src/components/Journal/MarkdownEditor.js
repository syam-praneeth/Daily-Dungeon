import React, { useEffect, useMemo, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

const options = [
  {
    key: "h1",
    label: "Heading 1",
    apply: (line) => ({
      text: `# ${line.replace(/^\s*#*\s*/, "")}`,
      caretShift: 0,
    }),
  },
  {
    key: "h2",
    label: "Heading 2",
    apply: (line) => ({
      text: `## ${line.replace(/^\s*#*\s*/, "")}`,
      caretShift: 0,
    }),
  },
  {
    key: "p",
    label: "Text",
    apply: (line) => ({
      text: line.replace(/^(\s*#*\s*|\s*[-*]\s+|\s*\d+\.\s+|\s*>\s+)/, ""),
      caretShift: 0,
    }),
  },
  {
    key: "ul",
    label: "Bulleted list",
    apply: (line) => ({
      text: `- ${line.replace(/^\s*([-*]|\d+\.)\s+/, "")}`,
      caretShift: 0,
    }),
  },
  {
    key: "ol",
    label: "Numbered list",
    apply: (line) => ({
      text: `1. ${line.replace(/^\s*([-*]|\d+\.)\s+/, "")}`,
      caretShift: 0,
    }),
  },
  {
    key: "quote",
    label: "Quote",
    apply: (line) => ({
      text: `> ${line.replace(/^\s*>\s*/, "")}`,
      caretShift: 0,
    }),
  },
  { key: "code", label: "Code block", applyBlock: true },
];

export default function MarkdownEditor({ value, onChange }) {
  const [showMenu, setShowMenu] = useState(false);
  const [filter, setFilter] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const taRef = useRef(null);
  const wrapperRef = useRef(null);

  // Sanitize the query so typing '/' doesn't hide results
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
    const caretPos = start + 4; // position inside block
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
      // open menu and keep focus flow natural
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

  // Reset selection when list changes
  useEffect(() => {
    setActiveIndex(0);
  }, [filter, showMenu]);

  return (
    <div className="markdown-editor" ref={wrapperRef}>
      <TextareaAutosize
        ref={taRef}
        minRows={4}
        maxRows={16}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        style={{
          width: "100%",
          padding: 10,
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          fontFamily: "inherit",
          fontSize: 16,
          boxSizing: "border-box",
          overflow: "auto",
        }}
        placeholder="Type '/' for commands (Heading 1, Heading 2, Text, Bulleted list, Numbered list, Quote, Code block)"
      />
      <div
        className="slash-menu-container"
        style={{ maxHeight: showMenu ? 280 : 0 }}
        aria-hidden={!showMenu}
      >
        {showMenu && (
          <div className="slash-menu-panel">
            <div className="slash-search">
              <input
                autoFocus
                placeholder="Search commands"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                onKeyDown={handleMenuKeyDown}
              />
            </div>
            <ul className="slash-list" onKeyDown={handleMenuKeyDown}>
              {filtered.map((opt, idx) => (
                <li key={opt.key}>
                  <button
                    type="button"
                    className={`slash-item ${
                      idx === activeIndex ? "active" : ""
                    }`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() =>
                      opt.applyBlock
                        ? insertCodeBlock()
                        : insertAtLineStart(opt.apply)
                    }
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="slash-empty">No commands</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
