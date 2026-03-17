import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

/**
 * Confetti celebration component for milestones
 * Shows colorful particles that fall from the top of the screen
 */

const COLORS = [
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#8B5CF6", // Violet
  "#10B981", // Emerald
  "#C084FC", // Lavender
  "#FBBF24", // Yellow
  "#F43F5E", // Rose
];

const SHAPES = ["circle", "square", "triangle"];

const generateParticle = (id) => {
  const left = Math.random() * 100;
  const size = 6 + Math.random() * 8;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const delay = Math.random() * 0.5;
  const duration = 2.5 + Math.random() * 1.5;
  const rotation = Math.random() * 720 - 360;
  const swayAmount = Math.random() * 60 - 30;

  return {
    id,
    left,
    size,
    color,
    shape,
    delay,
    duration,
    rotation,
    swayAmount,
  };
};

function ConfettiParticle({ particle }) {
  const getShapeStyle = () => {
    switch (particle.shape) {
      case "circle":
        return { borderRadius: "50%" };
      case "triangle":
        return {
          width: 0,
          height: 0,
          background: "transparent",
          borderLeft: `${particle.size / 2}px solid transparent`,
          borderRight: `${particle.size / 2}px solid transparent`,
          borderBottom: `${particle.size}px solid ${particle.color}`,
        };
      case "square":
      default:
        return { borderRadius: "2px" };
    }
  };

  const baseStyle = {
    position: "absolute",
    left: `${particle.left}%`,
    top: -20,
    width: particle.shape === "triangle" ? 0 : particle.size,
    height: particle.shape === "triangle" ? 0 : particle.size,
    background: particle.shape === "triangle" ? "transparent" : particle.color,
    animation: `confetti-fall ${particle.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${particle.delay}s forwards`,
    opacity: 1,
    pointerEvents: "none",
    zIndex: 10001,
    ...getShapeStyle(),
    "--rotation": `${particle.rotation}deg`,
    "--sway": `${particle.swayAmount}px`,
  };

  return <div style={baseStyle} />;
}

export default function Confetti({
  isActive = false,
  duration = 3000,
  particleCount = 50,
  onComplete,
}) {
  const [particles, setParticles] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  const startConfetti = useCallback(() => {
    const newParticles = Array.from({ length: particleCount }, (_, i) =>
      generateParticle(i)
    );
    setParticles(newParticles);
    setIsVisible(true);

    // Clean up after animation completes
    setTimeout(() => {
      setIsVisible(false);
      setParticles([]);
      if (onComplete) onComplete();
    }, duration + 2000); // Extra time for particles to finish falling
  }, [particleCount, duration, onComplete]);

  useEffect(() => {
    if (isActive) {
      startConfetti();
    }
  }, [isActive, startConfetti]);

  if (!isVisible || particles.length === 0) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10000,
        overflow: "hidden",
      }}
    >
      {particles.map((particle) => (
        <ConfettiParticle key={particle.id} particle={particle} />
      ))}

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          25% {
            transform: translateY(25vh) translateX(var(--sway)) rotate(calc(var(--rotation) * 0.25)) scale(0.95);
          }
          50% {
            transform: translateY(50vh) translateX(calc(var(--sway) * -0.5)) rotate(calc(var(--rotation) * 0.5)) scale(0.9);
          }
          75% {
            transform: translateY(75vh) translateX(var(--sway)) rotate(calc(var(--rotation) * 0.75)) scale(0.85);
            opacity: 0.8;
          }
          100% {
            transform: translateY(100vh) translateX(calc(var(--sway) * -0.25)) rotate(var(--rotation)) scale(0.7);
            opacity: 0;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}

/**
 * Hook to trigger confetti
 * Usage: const { triggerConfetti, ConfettiComponent } = useConfetti();
 */
export function useConfetti(options = {}) {
  const [isActive, setIsActive] = useState(false);

  const triggerConfetti = useCallback(() => {
    setIsActive(true);
  }, []);

  const handleComplete = useCallback(() => {
    setIsActive(false);
    if (options.onComplete) options.onComplete();
  }, [options]);

  const ConfettiComponent = (
    <Confetti
      isActive={isActive}
      duration={options.duration || 3000}
      particleCount={options.particleCount || 50}
      onComplete={handleComplete}
    />
  );

  return { triggerConfetti, ConfettiComponent, isActive };
}
