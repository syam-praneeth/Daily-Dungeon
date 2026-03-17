import React, { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * ThemeSwitcher with ripple transition effect
 * Toggles between light and dark mode with a full-page ripple animation
 */
export default function ThemeSwitcher({
  isDark,
  onToggle,
  size = 40,
}) {
  const [ripple, setRipple] = useState(null);
  const buttonRef = useRef(null);

  const handleToggle = useCallback(
    (e) => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Calculate the maximum distance to any corner of the viewport
        const maxX = Math.max(x, window.innerWidth - x);
        const maxY = Math.max(y, window.innerHeight - y);
        const maxRadius = Math.sqrt(maxX * maxX + maxY * maxY) * 2;

        setRipple({
          x,
          y,
          maxRadius,
          toLight: isDark,
        });

        // Trigger the actual theme change after a short delay
        // to sync with the ripple animation
        setTimeout(() => {
          onToggle();
        }, 200);

        // Clear ripple after animation
        setTimeout(() => {
          setRipple(null);
        }, 800);
      }
    },
    [isDark, onToggle]
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: "2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5))",
          background: "var(--dd-bg-card, rgba(255, 255, 255, 0.7))",
          backdropFilter: "blur(8px)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.5,
          transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Sun/Moon icon with rotation animation */}
        <span
          style={{
            display: "inline-flex",
            transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform: isDark ? "rotate(360deg)" : "rotate(0deg)",
          }}
        >
          {isDark ? "🌙" : "☀️"}
        </span>

        {/* Button glow effect */}
        <span
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: "50%",
            background: isDark
              ? "radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent 70%)"
              : "radial-gradient(circle, rgba(245, 158, 11, 0.3), transparent 70%)",
            opacity: 0,
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
          }}
          className="theme-switcher-glow"
        />

        <style>{`
          button:hover .theme-switcher-glow {
            opacity: 1;
          }
        `}</style>
      </button>

      {/* Ripple overlay portal */}
      {ripple &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              pointerEvents: "none",
              zIndex: 99999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: ripple.x,
                top: ripple.y,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: ripple.toLight ? "#F8FAFC" : "#0F172A",
                transform: "translate(-50%, -50%) scale(0)",
                animation: "theme-ripple 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards",
                "--max-scale": ripple.maxRadius / 5,
              }}
            />
            <style>{`
              @keyframes theme-ripple {
                0% {
                  transform: translate(-50%, -50%) scale(0);
                  opacity: 1;
                }
                80% {
                  opacity: 1;
                }
                100% {
                  transform: translate(-50%, -50%) scale(var(--max-scale, 200));
                  opacity: 0;
                }
              }
            `}</style>
          </div>,
          document.body
        )}
    </>
  );
}
