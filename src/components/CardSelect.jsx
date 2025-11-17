import React from "react";

const CardSelect = ({
  options,
  label = "Select an option",
  value = [],
  onChange,
  titleKey = "title",
  descriptionKey = "description",
  valueKey = "value",
  multiSelect = false,
  package: isPackage = false,
}) => {
  const getPackageColor = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes("gold")) return "bg-yellow-400";
    if (lower.includes("silver")) return "bg-gray-300";
    if (lower.includes("bronze")) return "bg-amber-600";
    if (lower.includes("new")) return "bg-blue-400/30";
    return "border border-primary-text bg-transparent";
  };

  const handleSelect = (val) => {
    if (!multiSelect) {
      onChange(val);
      return;
    }

    const current = Array.isArray(value) ? [...value] : [];

    if (current.includes(val)) {
      onChange(current.filter((v) => v !== val));
      return;
    }

    if (val === "hot_tub") {
      onChange([...current, val]);
      return;
    }

    const others = ["changeover", "clean", "laundry"];
    if (others.includes(val)) {
      const filtered = current.filter((v) => v === "hot_tub");
      onChange([...filtered, val]);
      return;
    }

    onChange([...current, val]);
  };

  return (
    <div className="flex flex-col">
      <p className="text-primary-text mb-1">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = multiSelect
            ? (value || []).includes(option[valueKey])
            : value === option[valueKey];

          const title = option[titleKey];
          const circleColor = getPackageColor(title);

          return (
            <button
              key={option[valueKey]}
              type="button"
              onClick={() => handleSelect(option[valueKey])}
              className={`cursor-pointer flex-1 shadow-s min-w-[calc(50%-0.5rem)] p-2 rounded-2xl text-left
                ${
                  selected
                    ? "border-cta-color border bg-cta-color/10 shadow-md"
                    : "border border-transparent hover:border-cta-color/50 bg-tertiary-bg hover:bg-cta-color/5"
                }`}>
              {isPackage ? (
                <div
                  className={`h-6 w-6 mb-2 border border-border-color/50 shadow-s rounded-full ${circleColor}`}></div>
              ) : (
                option.icon && (
                  <option.icon
                    className={`h-6 w-6 mb-2 ${
                      selected ? "text-cta-color" : "text-secondary-text"
                    }`}
                  />
                )
              )}

              <h3
                className={`font-medium pl-1 truncate ${
                  selected ? "text-cta-color" : "text-primary-text"
                }`}>
                {title}
              </h3>

              {!isPackage && option[descriptionKey] && (
                <p className="text-sm pl-1 text-secondary-text mt-1">
                  {option[descriptionKey]}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CardSelect;
