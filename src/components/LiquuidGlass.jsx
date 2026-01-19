import React from "react";

export default function LiquidGlass({ title, subtitle, children }) {
  return (
    <div className="liquid-glass">
      <div className="liquid-glass__highlight" />
      <div className="liquid-glass__content">
        {title && <h3>{title}</h3>}
        {subtitle && <p className="subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
