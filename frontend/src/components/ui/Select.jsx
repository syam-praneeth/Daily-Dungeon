import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

/**
 * Professional Select/Dropdown component with smooth animations
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  label,
  icon,
  disabled = false,
  searchable = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Find the selected option
  const selectedOption = options.find((opt) =>
    typeof opt === "object" ? opt.value === value : opt === value
  );

  const getLabel = (opt) => (typeof opt === "object" ? opt.label : opt);
  const getValue = (opt) => (typeof opt === "object" ? opt.value : opt);

  // Filter options based on search
  const filteredOptions = searchable
    ? options.filter((opt) =>
        getLabel(opt).toLowerCase().includes(search.toLowerCase())
      )
    : options;

  // Update dropdown position
  const updatePosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = Math.min(filteredOptions.length * 44 + 8, 300);

      setDropdownPosition({
        top: spaceBelow > dropdownHeight ? rect.bottom + 4 : rect.top - dropdownHeight - 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [filteredOptions.length]);

  // Handle open/close
  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
      setSearch("");
      setHighlightedIndex(0);
    } else {
      setIsOpen(false);
    }
  };

  // Handle selection
  const handleSelect = (opt) => {
    onChange(getValue(opt));
    setIsOpen(false);
    setSearch("");
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        handleToggle();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) =>
          i < filteredOptions.length - 1 ? i + 1 : i
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => (i > 0 ? i - 1 : i));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlighted = listRef.current.children[highlightedIndex];
      if (highlighted) {
        highlighted.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const dropdownContent = isOpen && (
    <div
      className="dd-select-dropdown"
      style={{
        position: "fixed",
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 10000,
      }}
    >
      {searchable && (
        <div className="dd-select-search">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setHighlightedIndex(0);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      <ul ref={listRef} className="dd-select-options">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((opt, index) => (
            <li
              key={getValue(opt)}
              className={`dd-select-option ${
                getValue(opt) === value ? "selected" : ""
              } ${index === highlightedIndex ? "highlighted" : ""}`}
              onClick={() => handleSelect(opt)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {typeof opt === "object" && opt.icon && (
                <span className="dd-select-option-icon">{opt.icon}</span>
              )}
              <span>{getLabel(opt)}</span>
              {getValue(opt) === value && (
                <span className="dd-select-check">✓</span>
              )}
            </li>
          ))
        ) : (
          <li className="dd-select-empty">No options found</li>
        )}
      </ul>
    </div>
  );

  return (
    <div className={`dd-select-container ${className}`} ref={containerRef}>
      {label && <label className="dd-select-label">{label}</label>}
      <button
        type="button"
        className={`dd-select-trigger ${isOpen ? "open" : ""} ${
          disabled ? "disabled" : ""
        }`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {icon && <span className="dd-select-icon">{icon}</span>}
        <span className={`dd-select-value ${!selectedOption ? "placeholder" : ""}`}>
          {selectedOption ? getLabel(selectedOption) : placeholder}
        </span>
        <span className={`dd-select-arrow ${isOpen ? "open" : ""}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      {createPortal(dropdownContent, document.body)}

      <style>{`
        .dd-select-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .dd-select-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--dd-text-muted, #64748B);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dd-select-trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: var(--dd-bg-card-solid, #FFFFFF);
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 14px;
          font-size: 14px;
          font-weight: 500;
          color: var(--dd-text-primary, #0F172A);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
          text-align: left;
          width: 100%;
        }

        .dd-select-trigger:hover:not(.disabled) {
          border-color: var(--dd-primary-400, #60A5FA);
          background: var(--dd-bg-secondary, #F1F5F9);
        }

        .dd-select-trigger.open {
          border-color: var(--dd-primary-500, #3B82F6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .dd-select-trigger.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dd-select-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .dd-select-value {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dd-select-value.placeholder {
          color: var(--dd-text-subtle, #94A3B8);
        }

        .dd-select-arrow {
          flex-shrink: 0;
          color: var(--dd-text-muted, #64748B);
          transition: transform 0.2s ease;
        }

        .dd-select-arrow.open {
          transform: rotate(180deg);
        }

        .dd-select-dropdown {
          background: var(--dd-bg-card-solid, #FFFFFF);
          border: 1px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 16px;
          box-shadow: 0 12px 40px rgba(15, 23, 42, 0.15);
          overflow: hidden;
          animation: dd-select-slide-in 0.2s cubic-bezier(0.23, 1, 0.32, 1);
        }

        @keyframes dd-select-slide-in {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .dd-select-search {
          padding: 8px;
          border-bottom: 1px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
        }

        .dd-select-search input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .dd-select-search input:focus {
          border-color: var(--dd-primary-500, #3B82F6);
        }

        .dd-select-options {
          list-style: none;
          margin: 0;
          padding: 4px;
          max-height: 280px;
          overflow-y: auto;
        }

        .dd-select-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
          font-size: 14px;
        }

        .dd-select-option:hover,
        .dd-select-option.highlighted {
          background: var(--dd-bg-secondary, #F1F5F9);
        }

        .dd-select-option.selected {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          color: var(--dd-primary-600, #2563EB);
          font-weight: 600;
        }

        .dd-select-option-icon {
          font-size: 18px;
        }

        .dd-select-check {
          margin-left: auto;
          color: var(--dd-primary-500, #3B82F6);
          font-weight: 700;
        }

        .dd-select-empty {
          padding: 16px;
          text-align: center;
          color: var(--dd-text-muted, #64748B);
          font-size: 14px;
        }

        [data-theme="dark"] .dd-select-dropdown {
          background: var(--dd-bg-secondary, #1E293B);
          border-color: var(--dd-border-medium, #334155);
        }

        [data-theme="dark"] .dd-select-trigger {
          background: var(--dd-bg-secondary, #1E293B);
          border-color: var(--dd-border-medium, #334155);
        }

        [data-theme="dark"] .dd-select-option:hover,
        [data-theme="dark"] .dd-select-option.highlighted {
          background: var(--dd-bg-tertiary, #334155);
        }
      `}</style>
    </div>
  );
}
