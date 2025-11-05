import React from "react";

const PackagePill = ({ maintPackage, className = "" }) => {
  if (!maintPackage) return null;

  // Tailwind-based style mapping (same look as property list badges)
  const styles = {
    gold: "bg-yellow-500/40 text-yellow-500 border border-yellow-500/30",
    silver: "bg-gray-400/40 text-gray-400 border border-gray-400/30",
    bronze: "bg-amber-700/40 text-amber-700 border border-amber-700/30",
    unmanaged: "bg-cta-color/40 text-cta-color border border-cta-color/30",
  };

  // Map tier IDs to the corresponding style
  const idToStyle = {
    1: styles.gold,
    2: styles.silver,
    3: styles.bronze,
    0: styles.unmanaged,
  };

  const selectedStyle = idToStyle[maintPackage.tier] || styles.unmanaged;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl px-3 py-1 ${selectedStyle} ${className}`}>
      <p className="text-lg font-semibold tracking-wide">
        {maintPackage?.name}
      </p>
    </div>
  );
};

export default PackagePill;
