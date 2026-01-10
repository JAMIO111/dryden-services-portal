import { useState, useRef, useEffect } from "react";
import { IoTimeOutline } from "react-icons/io5";

const generateTimes = (interval = 15) => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += interval) {
      const hour = h.toString().padStart(2, "0");
      const minute = m.toString().padStart(2, "0");
      times.push(`${hour}:${minute}`);
    }
  }
  return times;
};

const TimePicker = ({
  value,
  onChange,
  label,
  interval = 15,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const times = generateTimes(interval);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      {label && (
        <label className="block mb-1 font-medium text-primary-text">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full cursor-pointer rounded-lg bg-text-input-color px-3 py-2.5 text-sm text-primary-text hover:border-white/20 focus:outline-none shadow-s hover:shadow-m disabled:opacity-50">
        <span>{value || "Select time"}</span>
        <IoTimeOutline className="h-4 w-4 text-secondary-text" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg bg-text-input-color shadow-l">
          {times.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => {
                onChange(time);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-tertiary-bg ${
                value === time
                  ? "bg-tertiary-bg font-medium text-primary-text"
                  : "text-secondary-text"
              }`}>
              {time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimePicker;
