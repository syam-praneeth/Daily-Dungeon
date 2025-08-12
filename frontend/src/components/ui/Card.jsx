import React from "react";

export function Card({ children, className = "", style, onClick, variant }) {
  const variantClass = variant ? `dd-card--${variant}` : "";
  return (
    <div
      className={`dd-card ${variantClass} ${className}`}
      style={style}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, actions }) {
  return (
    <div className="dd-card__header">
      <div>
        {title ? <div className="dd-card__title">{title}</div> : null}
        {subtitle ? <div className="dd-card__subtitle">{subtitle}</div> : null}
      </div>
      <div className="dd-card__actions">{actions}</div>
    </div>
  );
}

export function CardBody({ children, className = "" }) {
  return <div className={`dd-card__body ${className}`}>{children}</div>;
}

export function CardFooter({ children }) {
  return <div className="dd-card__footer">{children}</div>;
}

export function CardMenu({ onOpen }) {
  return (
    <button className="dd-card__menu" aria-label="Card menu" onClick={onOpen}>
      &#8942;
    </button>
  );
}

export default Card;
