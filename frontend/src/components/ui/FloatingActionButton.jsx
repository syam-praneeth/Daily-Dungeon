import React, { useState, useCallback } from "react";

/**
 * FloatingActionButton with heartbeat pulse animation
 * A premium FAB that pulses rhythmically like a heartbeat
 */
export default function FloatingActionButton({
  onClick,
  icon = "+",
  label = "Add new",
  position = "bottom-right",
  color = "accent", // "primary" | "accent" | "lavender"
}) {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);

  const handleClick = useCallback(
    (e) => {
      // Add ripple effect
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { x, y, id: Date.now() };
      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);

      if (onClick) onClick(e);
    },
    [onClick]
  );

  const positionStyles = {
    "bottom-right": { bottom: 24, right: 24 },
    "bottom-left": { bottom: 24, left: 24 },
    "bottom-center": { bottom: 24, left: "50%", transform: "translateX(-50%)" },
  };

  const colorStyles = {
    primary: {
      background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
      shadow: "rgba(30, 58, 138, 0.4)",
      hoverShadow: "rgba(30, 58, 138, 0.5)",
    },
    accent: {
      background: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
      shadow: "rgba(245, 158, 11, 0.4)",
      hoverShadow: "rgba(245, 158, 11, 0.5)",
    },
    lavender: {
      background: "linear-gradient(135deg, #8B5CF6 0%, #C084FC 100%)",
      shadow: "rgba(139, 92, 246, 0.4)",
      hoverShadow: "rgba(139, 92, 246, 0.5)",
    },
  };

  const currentColor = colorStyles[color] || colorStyles.accent;

  return (
    <button
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      aria-label={label}
      title={label}
      style={{
        position: "fixed",
        ...positionStyles[position],
        width: 60,
        height: 60,
        borderRadius: "50%",
        border: "none",
        background: currentColor.background,
        color: "white",
        fontSize: 28,
        fontWeight: 300,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 6px 24px ${currentColor.shadow}`,
        zIndex: 1000,
        overflow: "hidden",
        transform: isPressed ? "scale(0.95)" : "scale(1)",
        transition: "transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)",
        animation: "fab-heartbeat 1.5s ease-in-out infinite",
      }}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          style={{
            position: "absolute",
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            background: "rgba(255, 255, 255, 0.5)",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            animation: "fab-ripple 0.6s ease-out forwards",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Shimmer overlay */}
      <span
        style={{
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
          animation: "fab-shimmer 3s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* Icon */}
      <span style={{ position: "relative", zIndex: 1 }}>{icon}</span>

      {/* Keyframes */}
      <style>{`
        @keyframes fab-heartbeat {
          0% {
            box-shadow: 0 6px 24px ${currentColor.shadow};
          }
          14% {
            transform: scale(1.08);
            box-shadow: 0 8px 32px ${currentColor.hoverShadow};
          }
          28% {
            transform: scale(1);
            box-shadow: 0 6px 24px ${currentColor.shadow};
          }
          42% {
            transform: scale(1.05);
            box-shadow: 0 7px 28px ${currentColor.shadow};
          }
          70% {
            transform: scale(1);
            box-shadow: 0 6px 24px ${currentColor.shadow};
          }
        }

        @keyframes fab-ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(12);
            opacity: 0;
          }
        }

        @keyframes fab-shimmer {
          0% {
            left: -100%;
          }
          50%, 100% {
            left: 100%;
          }
        }
      `}</style>
    </button>
  );
}
