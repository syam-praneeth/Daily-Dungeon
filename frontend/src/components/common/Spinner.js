import React from "react";

const sizes = {
  sm: 16,
  md: 24,
  lg: 40,
};

const Spinner = ({ size = "md", onDark = false, style }) => {
  const px = sizes[size] || sizes.md;
  const cls = `spinner${onDark ? " spinner--on-dark" : ""}`;
  return (
    <span
      className={cls}
      style={{ width: px, height: px, ...style }}
      aria-busy="true"
      aria-label="Loading"
    />
  );
};

export default Spinner;
