import { forwardRef } from "react";
import { HiMiniXMark } from "react-icons/hi2";
import { MdErrorOutline } from "react-icons/md";

const RHFTextAreaInput = forwardRef(
  (
    {
      value,
      onChange,
      onBlur,
      name,
      placeholder = "Enter text...",
      label,
      icon: Icon,
      rows = 5,
      max = 1000,
      error,
      required = false,
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center gap-1">
            <label htmlFor={name} className="block mb-1 text-primary-text">
              {label}
            </label>
            {required && (
              <span className="text-error-color text-sm ml-1" title="Required">
                *
              </span>
            )}
          </div>
        )}

        <div
          className={`flex border flex-row relative transition-all duration-300 items-start shadow-s hover:shadow-m rounded-lg pl-2 pr-10 py-2 bg-text-input-color
             focus-within:border-brand-primary focus-within:hover:border-brand-primary min-w-0
            ${
              error
                ? "border border-error-color hover:border-error-color/70 hover:focus-within:border-error-color focus-within:border-error-color focus-within:ring-3 focus-within:ring-error-color/20"
                : "border-transparent"
            }`}>
          {error ? (
            <MdErrorOutline
              title={error.message}
              className="w-5 h-5 text-error-color mr-2 flex-shrink-0"
            />
          ) : (
            Icon && (
              <Icon className="w-5 h-5 text-primary-text mr-2 flex-shrink-0 pointer-events-none" />
            )
          )}

          <textarea
            id={name}
            name={name}
            ref={ref}
            value={value ?? ""}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            rows={rows}
            maxLength={max}
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
      </div>
    );
  }
);

export default RHFTextAreaInput;
