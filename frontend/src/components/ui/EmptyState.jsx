import React from "react";

// SVG Icons with consistent color palette
const EmptyIcons = {
  default: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  timer: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  tasks: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  journal: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  calendar: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  bookmark: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  ),
  search: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  inbox: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  ),
};

/**
 * EmptyState - Professional empty state component with SVG icons
 */
export default function EmptyState({
  icon = "default",
  title = "No data yet",
  description,
  action,
  actionLabel = "Get Started",
  variant = "default", // "default" | "compact" | "inline"
}) {
  // Get the appropriate icon
  const IconComponent = typeof icon === "string" && EmptyIcons[icon]
    ? EmptyIcons[icon]
    : EmptyIcons.default;

  const renderIcon = () => {
    if (typeof icon === "string" && EmptyIcons[icon]) {
      return <IconComponent />;
    }
    if (React.isValidElement(icon)) {
      return icon;
    }
    return <EmptyIcons.default />;
  };

  return (
    <div className={`dd-empty-state dd-empty-state--${variant}`}>
      <div className="dd-empty-icon">{renderIcon()}</div>
      <div className="dd-empty-content">
        <h4 className="dd-empty-title">{title}</h4>
        {description && <p className="dd-empty-description">{description}</p>}
      </div>
      {action && (
        <button className="dd-empty-action" onClick={action}>
          {actionLabel}
        </button>
      )}

      <style>{`
        .dd-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 24px;
          gap: 16px;
        }

        .dd-empty-state--compact {
          padding: 24px 16px;
          gap: 12px;
        }

        .dd-empty-state--inline {
          flex-direction: row;
          text-align: left;
          padding: 16px;
          gap: 16px;
        }

        .dd-empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          border-radius: 20px;
          color: var(--dd-primary-500, #3B82F6);
          animation: dd-empty-float 3s ease-in-out infinite;
        }

        .dd-empty-state--compact .dd-empty-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
        }

        .dd-empty-state--compact .dd-empty-icon svg {
          width: 32px;
          height: 32px;
        }

        .dd-empty-state--inline .dd-empty-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
        }

        .dd-empty-state--inline .dd-empty-icon svg {
          width: 24px;
          height: 24px;
        }

        @keyframes dd-empty-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        .dd-empty-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .dd-empty-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--dd-text-primary, #0F172A);
        }

        .dd-empty-state--compact .dd-empty-title {
          font-size: 14px;
        }

        .dd-empty-description {
          margin: 0;
          font-size: 14px;
          color: var(--dd-text-muted, #64748B);
          max-width: 280px;
        }

        .dd-empty-state--compact .dd-empty-description {
          font-size: 13px;
        }

        .dd-empty-action {
          margin-top: 8px;
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--dd-primary-500, #3B82F6), var(--dd-lavender-500, #8B5CF6));
          font-size: 14px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dd-empty-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .dd-empty-state--inline .dd-empty-action {
          margin-top: 0;
          margin-left: auto;
        }

        [data-theme="dark"] .dd-empty-icon {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15));
        }
      `}</style>
    </div>
  );
}
