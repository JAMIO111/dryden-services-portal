import { HiMiniXMark } from "react-icons/hi2";
import { forwardRef } from "react";
import { MdErrorOutline } from "react-icons/md";

const TextInput = forwardRef(
  (
    {
      dataType = "text",
      required = false,
      value = "",
      onChange,
      placeholder = "Enter text...",
      label,
      icon: Icon,
      error,
      prefix,
      maxLength,
      suffix,
      textTransform = "none",
      ...rest
    },
    ref
  ) => {
    const handleKeyDownNumeric = (e) => {
      if (
        [
          "Backspace",
          "Tab",
          "ArrowLeft",
          "ArrowRight",
          "Delete",
          "Home",
          "End",
        ].includes(e.key) ||
        (e.key >= "0" && e.key <= "9") ||
        e.key === "."
      ) {
        return;
      } else {
        e.preventDefault();
      }
    };

    const remainingChars =
      typeof maxLength === "number" ? maxLength - (value?.length || 0) : null;

    const handleNumericChange = (e) => {
      let val = e.target.value;

      // Allow empty
      if (val === "") return onChange({ target: { value: "" } });

      // Remove invalid characters
      val = val.replace(/[^0-9.]/g, "");

      // Only one decimal point
      const parts = val.split(".");
      if (parts.length > 2) {
        val = parts[0] + "." + parts[1]; // chop extra dots
      }

      // Remove leading zeros (but keep "0." cases)
      if (val.startsWith("0") && !val.startsWith("0.") && val.length > 1) {
        val = String(parseFloat(val));
      }

      onChange({ target: { value: val } });
    };

    return (
      <div className="flex flex-col gap-1 h-fit min-w-0 relative">
        {label && (
          <div className="flex items-center gap-1">
            <label className="block font-medium text-primary-text">
              {label}
            </label>
            {required && (
              <label className="text-error-color text-sm" title="Required">
                *
              </label>
            )}
          </div>
        )}

        <div
          className={`flex border flex-row relative items-center shadow-s transition-all duration-300 hover:shadow-m rounded-lg pl-2 pr-10 py-2 bg-text-input-color
             focus-within:border-brand-primary focus-within:hover:border-brand-primary min-w-0
            ${
              error
                ? "border-error-color hover:border-error-color/70 hover:focus-within:border-error-color focus-within:border-error-color focus-within:ring-3 focus-within:ring-error-color/20"
                : "border-transparent"
            }`}>
          {error ? (
            <MdErrorOutline
              title={error.message}
              className="w-5 h-5 text-error-color mr-3 flex-shrink-0"
            />
          ) : (
            Icon && (
              <Icon className="w-5 h-5 text-primary-text mr-3 flex-shrink-0 pointer-events-none" />
            )
          )}

          {prefix && (
            <span className="absolute left-10 text-primary-text pointer-events-none">
              {prefix}
            </span>
          )}

          <input
            onKeyDown={dataType === "number" ? handleKeyDownNumeric : undefined}
            ref={ref}
            type={dataType === "number" ? "text" : dataType}
            value={value}
            onChange={dataType === "number" ? handleNumericChange : onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`placeholder:normal-case input-no-arrows flex-grow w-full min-w-0 bg-transparent outline-none text-primary-text placeholder:text-sm placeholder:text-muted
              ${prefix ? "pl-5" : ""}
              ${suffix ? "pr-4 text-right" : ""}
              ${textTransform !== "none" ? `capitalize-${textTransform}` : ""}
            `}
            style={{
              textTransform: textTransform,
            }}
            {...rest}
          />

          {suffix && (
            <span className="absolute right-10 text-primary-text pointer-events-none">
              {suffix}
            </span>
          )}

          {value !== "" && (
            <button
              type="button"
              onClick={() => onChange({ target: { value: "" } })}
              className="absolute right-2 text-primary-text hover:bg-secondary-bg rounded-sm p-0.5"
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

export default TextInput;
