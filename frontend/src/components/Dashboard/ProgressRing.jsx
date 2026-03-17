import React, { useMemo, useEffect, useState } from "react";

export default function ProgressRing({
  value = 0, // 0..1
  size = 120,
  stroke = 12,
  trackColor,
  color = "#3B82F6",
  label,
  caption,
  showParticles = true,
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [showBurst, setShowBurst] = useState(false);
  const [prevComplete, setPrevComplete] = useState(false);

  // Animate value changes
  useEffect(() => {
    const startValue = animatedValue;
    const endValue = Math.max(0, Math.min(1, value));
    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out-back for bouncy feel)
      const easeOutBack = (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      };

      const easedProgress = easeOutBack(progress);
      const currentValue = startValue + (endValue - startValue) * easedProgress;

      setAnimatedValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  // Show particle burst on completion
  useEffect(() => {
    const isComplete = value >= 1;
    if (isComplete && !prevComplete && showParticles) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 1000);
    }
    setPrevComplete(isComplete);
  }, [value, prevComplete, showParticles]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = animatedValue * c;
  const rest = c - dash;
  const center = size / 2;
  const pct = Math.round((value || 0) * 100);

  const gradientId = useMemo(
    () => `prg_${Math.random().toString(36).slice(2)}`,
    []
  );

  const shimmerGradientId = useMemo(
    () => `shimmer_${Math.random().toString(36).slice(2)}`,
    []
  );

  const glowFilterId = useMemo(
    () => `glow_${Math.random().toString(36).slice(2)}`,
    []
  );

  // Dynamic track color based on theme
  const dynamicTrackColor = trackColor || "var(--dd-bg-tertiary, #e2e8f0)";

  // Calculate glow intensity based on progress
  const glowIntensity = animatedValue * 0.8;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
      <div style={{ position: "relative" }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          <defs>
            {/* Metallic gradient with shimmer */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E3A8A">
                <animate
                  attributeName="stop-color"
                  values="#1E3A8A;#3B82F6;#8B5CF6;#3B82F6;#1E3A8A"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor="#8B5CF6">
                <animate
                  attributeName="stop-color"
                  values="#8B5CF6;#C084FC;#F59E0B;#C084FC;#8B5CF6"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#3B82F6">
                <animate
                  attributeName="stop-color"
                  values="#3B82F6;#8B5CF6;#1E3A8A;#8B5CF6;#3B82F6"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>

            {/* Shimmer overlay */}
            <linearGradient id={shimmerGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0">
                <animate
                  attributeName="offset"
                  values="-0.5;1.5"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor="white" stopOpacity="0.4">
                <animate
                  attributeName="offset"
                  values="0;2"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="white" stopOpacity="0">
                <animate
                  attributeName="offset"
                  values="0.5;2.5"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>

            {/* Glow filter */}
            <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={dynamicTrackColor}
            strokeWidth={stroke}
            opacity={0.3}
          />

          {/* Progress arc with gradient */}
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${rest}`}
            filter={glowIntensity > 0.3 ? `url(#${glowFilterId})` : undefined}
            style={{
              transition: "stroke-dasharray 0.1s linear",
              filter: `drop-shadow(0 0 ${4 + glowIntensity * 8}px rgba(139, 92, 246, ${glowIntensity}))`,
            }}
          />

          {/* Shimmer overlay on progress */}
          {animatedValue > 0.05 && (
            <circle
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={`url(#${shimmerGradientId})`}
              strokeWidth={stroke - 2}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${rest}`}
              opacity={0.6}
            />
          )}
        </svg>

        {/* Center text */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: size * 0.22,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, var(--dd-primary-600, #2563EB), var(--dd-lavender-500, #8B5CF6))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1,
            }}
          >
            {pct}%
          </div>
        </div>

        {/* Particle burst on completion */}
        {showBurst && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: i % 2 === 0
                    ? "linear-gradient(135deg, #F59E0B, #EF4444)"
                    : "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                  animation: `particle-burst-${i} 0.8s ease-out forwards`,
                }}
              />
            ))}
            <style>{`
              @keyframes particle-burst-0 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(40px, -20px) scale(0); opacity: 0; } }
              @keyframes particle-burst-1 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(30px, 30px) scale(0); opacity: 0; } }
              @keyframes particle-burst-2 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(-20px, 40px) scale(0); opacity: 0; } }
              @keyframes particle-burst-3 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(-40px, 10px) scale(0); opacity: 0; } }
              @keyframes particle-burst-4 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(-30px, -30px) scale(0); opacity: 0; } }
              @keyframes particle-burst-5 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(0px, -45px) scale(0); opacity: 0; } }
              @keyframes particle-burst-6 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(45px, 5px) scale(0); opacity: 0; } }
              @keyframes particle-burst-7 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(15px, 40px) scale(0); opacity: 0; } }
            `}</style>
          </div>
        )}
      </div>

      {/* Label and caption */}
      {(label || caption) && (
        <div style={{ minWidth: 0 }}>
          {label && (
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                lineHeight: 1.3,
                color: "var(--dd-text-primary, #0F172A)",
              }}
            >
              {label}
            </div>
          )}
          {caption && (
            <div
              style={{
                color: "var(--dd-text-muted, #64748B)",
                fontSize: 13,
                marginTop: 2,
              }}
            >
              {caption}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
