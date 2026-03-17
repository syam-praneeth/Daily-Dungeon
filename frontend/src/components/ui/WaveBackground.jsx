import React, { useEffect, useRef, useState } from "react";

/**
 * WaveBackground - Dynamic wave background that responds to scroll velocity
 * Creates ambient, flowing gradients for hero sections
 */
export default function WaveBackground({ children, className = "" }) {
  const containerRef = useRef(null);
  const [scrollVelocity, setScrollVelocity] = useState("normal");

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    let ticking = false;

    const updateScrollVelocity = () => {
      const currentScrollY = window.scrollY;
      const currentTime = performance.now();
      const deltaY = Math.abs(currentScrollY - lastScrollY);
      const deltaTime = currentTime - lastTime;

      if (deltaTime > 0) {
        const velocity = deltaY / deltaTime;

        if (velocity > 1.5) {
          setScrollVelocity("fast");
        } else if (velocity > 0.3) {
          setScrollVelocity("normal");
        } else {
          setScrollVelocity("slow");
        }
      }

      lastScrollY = currentScrollY;
      lastTime = currentTime;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollVelocity);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const getAnimationDuration = () => {
    switch (scrollVelocity) {
      case "fast":
        return "10s";
      case "slow":
        return "30s";
      default:
        return "20s";
    }
  };

  return (
    <div
      ref={containerRef}
      className={`wave-bg-container ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100%",
      }}
    >
      {/* Wave layers */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          zIndex: 0,
          pointerEvents: "none",
        }}
        data-scroll-velocity={scrollVelocity}
      >
        {/* Wave 1 - Primary indigo */}
        <div
          style={{
            position: "absolute",
            width: "200%",
            height: "200%",
            top: "-50%",
            left: "-50%",
            background: `radial-gradient(ellipse at center,
              rgba(139, 92, 246, 0.08) 0%,
              rgba(59, 130, 246, 0.04) 40%,
              transparent 70%)`,
            animation: `wave-float-1 ${getAnimationDuration()} ease-in-out infinite`,
            willChange: "transform",
          }}
        />

        {/* Wave 2 - Accent orange */}
        <div
          style={{
            position: "absolute",
            width: "200%",
            height: "200%",
            top: "-50%",
            left: "-50%",
            background: `radial-gradient(ellipse at center,
              rgba(245, 158, 11, 0.06) 0%,
              rgba(239, 68, 68, 0.03) 40%,
              transparent 70%)`,
            animation: `wave-float-2 ${getAnimationDuration()} ease-in-out infinite`,
            animationDelay: "-5s",
            willChange: "transform",
          }}
        />

        {/* Wave 3 - Lavender */}
        <div
          style={{
            position: "absolute",
            width: "200%",
            height: "200%",
            top: "-50%",
            left: "-50%",
            background: `radial-gradient(ellipse at center,
              rgba(59, 130, 246, 0.05) 0%,
              rgba(139, 92, 246, 0.02) 40%,
              transparent 70%)`,
            animation: `wave-float-3 ${getAnimationDuration()} ease-in-out infinite`,
            animationDelay: "-10s",
            willChange: "transform",
          }}
        />

        {/* Floating orbs */}
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            top: "10%",
            right: "10%",
            background: `radial-gradient(circle,
              rgba(139, 92, 246, 0.12) 0%,
              transparent 70%)`,
            borderRadius: "50%",
            filter: "blur(40px)",
            animation: "orb-float-1 15s ease-in-out infinite",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 150,
            height: 150,
            bottom: "20%",
            left: "15%",
            background: `radial-gradient(circle,
              rgba(245, 158, 11, 0.1) 0%,
              transparent 70%)`,
            borderRadius: "50%",
            filter: "blur(30px)",
            animation: "orb-float-2 18s ease-in-out infinite",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            top: "40%",
            left: "60%",
            background: `radial-gradient(circle,
              rgba(59, 130, 246, 0.08) 0%,
              transparent 70%)`,
            borderRadius: "50%",
            filter: "blur(25px)",
            animation: "orb-float-3 12s ease-in-out infinite",
          }}
        />
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>

      {/* Keyframes */}
      <style>{`
        @keyframes wave-float-1 {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(2%, 2%) rotate(5deg) scale(1.02);
          }
          50% {
            transform: translate(-1%, 1%) rotate(-3deg) scale(0.98);
          }
          75% {
            transform: translate(1%, -2%) rotate(2deg) scale(1.01);
          }
        }

        @keyframes wave-float-2 {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(-2%, 1%) rotate(-4deg) scale(1.01);
          }
          50% {
            transform: translate(1%, -1%) rotate(3deg) scale(1.03);
          }
          75% {
            transform: translate(-1%, 2%) rotate(-2deg) scale(0.99);
          }
        }

        @keyframes wave-float-3 {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          33% {
            transform: translate(1.5%, -1.5%) rotate(3deg) scale(1.02);
          }
          66% {
            transform: translate(-1.5%, 1%) rotate(-2deg) scale(0.98);
          }
        }

        @keyframes orb-float-1 {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-20px, 30px);
          }
          50% {
            transform: translate(10px, -20px);
          }
          75% {
            transform: translate(-15px, -10px);
          }
        }

        @keyframes orb-float-2 {
          0%, 100% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(25px, -15px);
          }
          66% {
            transform: translate(-10px, 20px);
          }
        }

        @keyframes orb-float-3 {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-20px, 15px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes wave-float-1, @keyframes wave-float-2, @keyframes wave-float-3,
          @keyframes orb-float-1, @keyframes orb-float-2, @keyframes orb-float-3 {
            0%, 100% { transform: none; }
          }
        }
      `}</style>
    </div>
  );
}
