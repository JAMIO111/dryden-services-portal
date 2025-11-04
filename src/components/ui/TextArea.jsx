import { forwardRef } from "react";
import { HiMiniXMark } from "react-icons/hi2";

const TextAreaInput = forwardRef(
  (
    {
      value = "",
      onChange,
      placeholder = "Enter text...",
      label,
      icon: Icon,
      rows = 5,
      maxLength = 500,
    },
    ref
  ) => {
    const remainingChars = maxLength - (value?.length || 0);

    return (
      <div className="w-full h-full flex flex-col gap-1">
        {label && <label className="block text-primary-text">{label}</label>}

        <div
          className="relative flex border border-border-color rounded-lg px-2 py-2 bg-text-input-color
          hover:border-border-dark-color focus-within:border-brand-primary focus-within:hover:border-brand-primary">
          {Icon && (
            <Icon className="w-5 h-5 text-primary-text mr-2 flex-shrink-0 pointer-events-none" />
          )}

          <textarea
            maxLength={maxLength}
            ref={ref}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="flex-grow w-full bg-transparent outline-none text-primary-text placeholder:text-sm placeholder:text-muted resize-none pr-6"
          />

          {value && (
            <button
              type="button"
              onClick={() => onChange({ target: { value: "" } })}
              className="absolute top-2 right-2 text-primary-text hover:bg-border-color rounded-sm p-0.5"
              aria-label="Clear">
              <HiMiniXMark className="w-5 h-5" />
            </button>
          )}
        </div>

        {maxLength && (
          <div
            className={`text-xs text-right mt-0.5 ${
              remainingChars <= 0
                ? "text-error-color"
                : remainingChars <= maxLength * 0.1
                ? "text-warning-color"
                : "text-muted"
            }`}>
            {remainingChars} characters remaining
          </div>
        )}
      </div>
    );
  }
);

export default TextAreaInput;
