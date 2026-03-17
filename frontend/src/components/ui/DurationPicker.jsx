import React, { useState, useRef, useEffect } from "react";

/**
 * DurationPicker - Professional duration selector with presets and custom input
 */
export default function DurationPicker({
  value,
  onChange,
  label,
  presets = [5, 10, 15, 20, 25, 30, 45, 60, 90, 120],
  min = 1,
  max = 180,
  showHoursMinutes = false,
}) {
  const [isCustom, setIsCustom] = useState(false);
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(0);
  const inputRef = useRef(null);

  // Sync custom values when value changes
  useEffect(() => {
    if (value > 0) {
      setCustomHours(Math.floor(value / 60));
      setCustomMinutes(value % 60);
    }
  }, [value]);

  const handlePresetClick = (minutes) => {
    setIsCustom(false);
    onChange(minutes);
  };

  const handleCustomChange = () => {
    const total = customHours * 60 + customMinutes;
    if (total >= min && total <= max) {
      onChange(total);
    }
  };

  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="dd-duration-picker">
      {label && <label className="dd-duration-label">{label}</label>}

      {/* Preset Buttons */}
      <div className="dd-duration-presets">
        {presets.map((minutes) => (
          <button
            key={minutes}
            type="button"
            className={`dd-duration-preset ${value === minutes ? "active" : ""}`}
            onClick={() => handlePresetClick(minutes)}
          >
            {formatDuration(minutes)}
          </button>
        ))}
        <button
          type="button"
          className={`dd-duration-preset custom ${isCustom ? "active" : ""}`}
          onClick={() => {
            setIsCustom(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
        >
          Custom
        </button>
      </div>

      {/* Custom Input */}
      {isCustom && (
        <div className="dd-duration-custom">
          {showHoursMinutes ? (
            <div className="dd-duration-hm-inputs">
              <div className="dd-duration-input-group">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={customHours}
                  onChange={(e) => setCustomHours(Math.max(0, parseInt(e.target.value) || 0))}
                  onBlur={handleCustomChange}
                  ref={inputRef}
                />
                <span className="dd-duration-unit">hours</span>
              </div>
              <span className="dd-duration-separator">:</span>
              <div className="dd-duration-input-group">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  onBlur={handleCustomChange}
                />
                <span className="dd-duration-unit">mins</span>
              </div>
            </div>
          ) : (
            <div className="dd-duration-single-input">
              <input
                type="number"
                min={min}
                max={max}
                value={value || ""}
                onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))}
                placeholder="Enter minutes"
                ref={inputRef}
              />
              <span className="dd-duration-unit">minutes</span>
            </div>
          )}
        </div>
      )}

      {/* Current Selection Display */}
      {value > 0 && (
        <div className="dd-duration-selected">
          <span className="dd-duration-selected-icon">⏱️</span>
          <span className="dd-duration-selected-value">{formatDuration(value)}</span>
        </div>
      )}

      <style>{`
        .dd-duration-picker {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dd-duration-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--dd-text-muted, #64748B);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dd-duration-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .dd-duration-preset {
          padding: 10px 16px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 12px;
          background: var(--dd-bg-card-solid, #FFFFFF);
          color: var(--dd-text-secondary, #334155);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .dd-duration-preset:hover {
          border-color: var(--dd-primary-400, #60A5FA);
          background: var(--dd-primary-100, #DBEAFE);
          transform: translateY(-2px);
        }

        .dd-duration-preset.active {
          background: linear-gradient(135deg, var(--dd-primary-500, #3B82F6), var(--dd-lavender-500, #8B5CF6));
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }

        .dd-duration-preset.custom {
          border-style: dashed;
        }

        .dd-duration-preset.custom:hover,
        .dd-duration-preset.custom.active {
          border-style: solid;
        }

        .dd-duration-custom {
          padding: 16px;
          background: var(--dd-bg-secondary, #F1F5F9);
          border-radius: 14px;
          animation: dd-duration-slide-in 0.2s ease;
        }

        @keyframes dd-duration-slide-in {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dd-duration-hm-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dd-duration-input-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dd-duration-input-group input,
        .dd-duration-single-input input {
          width: 80px;
          padding: 12px 14px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.5));
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          text-align: center;
          background: var(--dd-bg-card-solid, #FFFFFF);
          color: var(--dd-text-primary, #0F172A);
          transition: all 0.2s ease;
        }

        .dd-duration-input-group input:focus,
        .dd-duration-single-input input:focus {
          outline: none;
          border-color: var(--dd-primary-500, #3B82F6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .dd-duration-single-input {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dd-duration-single-input input {
          width: 120px;
        }

        .dd-duration-unit {
          font-size: 13px;
          color: var(--dd-text-muted, #64748B);
          font-weight: 500;
        }

        .dd-duration-separator {
          font-size: 24px;
          font-weight: 700;
          color: var(--dd-text-muted, #64748B);
        }

        .dd-duration-selected {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08));
          border-radius: 12px;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .dd-duration-selected-icon {
          font-size: 20px;
        }

        .dd-duration-selected-value {
          font-size: 16px;
          font-weight: 700;
          color: var(--dd-primary-600, #2563EB);
        }

        [data-theme="dark"] .dd-duration-preset {
          background: var(--dd-bg-secondary, #1E293B);
          border-color: var(--dd-border-medium, #334155);
        }

        [data-theme="dark"] .dd-duration-preset:hover {
          background: var(--dd-bg-tertiary, #334155);
        }

        [data-theme="dark"] .dd-duration-custom {
          background: var(--dd-bg-tertiary, #334155);
        }

        [data-theme="dark"] .dd-duration-input-group input,
        [data-theme="dark"] .dd-duration-single-input input {
          background: var(--dd-bg-secondary, #1E293B);
          border-color: var(--dd-border-medium, #334155);
        }
      `}</style>
    </div>
  );
}
