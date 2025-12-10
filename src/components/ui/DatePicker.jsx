import { useState, useRef, useEffect } from "react";
import { IoChevronDown } from "react-icons/io5";
import { TbCalendarTime, TbCalendar, TbClock } from "react-icons/tb";
import { MdErrorOutline } from "react-icons/md";
import { motion } from "framer-motion";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  addMonths,
  addYears,
  isSameDay,
  isToday,
  isSameMonth,
  isSameYear,
  setMonth,
  setYear,
} from "date-fns";

const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const monthsOfYear = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DatePicker = ({
  label,
  currentDate,
  onChange,
  displayMode = "date",
  placeholder,
  defaultPageDate,
  required = false,
  error,
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date());
  const [mode, setMode] = useState(""); // "date" | "time"
  const [open, setOpen] = useState(false);

  const ref = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectDate = (date) => {
    const updated = new Date(date);
    if (currentDate) {
      updated.setHours(new Date(currentDate).getHours());
      updated.setMinutes(new Date(currentDate).getMinutes());
    }
    onChange(updated);
    setCurrentMonth(date);
    setCurrentYear(date);
    if (displayMode !== "datetime") setOpen(false);
  };

  const handleTimeChange = (type, value) => {
    const newDate = new Date(currentDate || new Date());
    if (type === "hours") newDate.setHours(value);
    if (type === "minutes") newDate.setMinutes(value);
    onChange(newDate);
  };

  const getCalendarDays = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });
    const padding = Array(getDay(start)).fill(null);
    return [...padding, ...days];
  };

  const handleMonthClick = (monthIndex) => {
    const updated = setMonth(
      setYear(new Date(), currentYear.getFullYear()),
      monthIndex
    );
    setCurrentMonth(updated);
    setCurrentYear(updated);
  };

  const handleYearChange = (amount) => {
    const updated = addYears(currentYear, amount);
    setCurrentYear(updated);
    setCurrentMonth((prev) => setYear(prev, updated.getFullYear()));
  };

  const handleMonthChange = (amount) => {
    const updated = addMonths(currentMonth, amount);
    setCurrentMonth(updated);
    setCurrentYear(updated);
  };

  const handleGoToToday = () => {
    setCurrentMonth(today);
    setCurrentYear(today);
    onChange(today);
  };

  const calendarDays = getCalendarDays(currentMonth);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  useEffect(() => {
    if (open && currentDate) {
      const d = new Date(currentDate);
      setCurrentMonth(d);
      setCurrentYear(d);
    } else if (open && defaultPageDate) {
      const d = new Date(defaultPageDate);
      setCurrentMonth(d);
      setCurrentYear(d);
    }
  }, [open, currentDate, defaultPageDate]);

  return (
    <div
      className="flex flex-col w-full gap-1 h-fit min-w-0 relative"
      ref={ref}>
      {label && (
        <div className="flex items-center gap-1">
          <label className="font-medium text-primary-text">{label}</label>
          {required && <span className="text-error-color">*</span>}
        </div>
      )}

      {/* Input Box */}
      <div
        className={`
    border
    flex items-center select-none justify-between
    transition-all duration-300 bg-text-input-color rounded-lg
    shadow-s hover:shadow-m p-2.5 text-sm text-primary-text cursor-pointer

    ${
      error
        ? "border-error-color hover:border-error-color/70"
        : open
        ? "border-brand-primary hover:border-brand-primary"
        : "border-transparent"
    }

    ${open && error ? "ring-3 ring-error-color/30" : ""}
  `}
        onClick={() => {
          setOpen(!open);
          setMode(displayMode === "datetime" ? "date" : displayMode);
        }}>
        <div className="flex items-center gap-2">
          {error ? (
            <MdErrorOutline
              title={error.message}
              className="w-5 h-5 text-error-color mr-2 flex-shrink-0"
            />
          ) : displayMode === "datetime" ? (
            <TbCalendarTime className="w-5 h-5 text-primary-text" />
          ) : displayMode === "date" ? (
            <TbCalendar className="w-5 h-5 text-primary-text" />
          ) : (
            <TbClock className="w-5 h-5 text-primary-text" />
          )}
          <span
            className={`ml-2 ${!currentDate ? "text-primary-text/50" : ""}`}>
            {currentDate
              ? format(
                  currentDate,
                  displayMode === "date"
                    ? "EEE, PPP"
                    : displayMode === "time"
                    ? "p"
                    : "PPP p"
                )
              : placeholder || "Select a date"}
          </span>
        </div>
        <IoChevronDown
          className={`w-5 h-5 text-primary-text transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Popup Panel */}
      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 bg-secondary-bg rounded-xl shadow-s hover:shadow-m w-fit min-w-[20rem]">
          {mode === "date" ? (
            <div className="flex p-3 gap-4">
              {/* Left: Calendar */}
              <div className="w-1/2">
                <div className="flex justify-between items-center mb-2">
                  <motion.span
                    key={currentYear} // crucial: triggers animation on change
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-primary-text font-semibold">
                    {format(currentYear, "MMM yyy")}
                  </motion.span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleMonthChange(-1)}
                      className="active:scale-95 hover:bg-border-color/50 shadow-s cursor-pointer flex justify-center items-center text-primary-text p-0.75 rounded">
                      <IoChevronDown className="w-4.5 h-4.5 rotate-90" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMonthChange(1)}
                      className="active:scale-95 hover:bg-border-color/50 shadow-s flex justify-center items-center cursor-pointer text-primary-text p-0.75 rounded">
                      <IoChevronDown className="w-4.5 h-4.5 -rotate-90" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 text-center text-primary-text mb-1 font-medium">
                  {daysOfWeek.map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 text-center gap-1 text-primary-text">
                  {calendarDays.map((day, i) => {
                    if (!day) return <div key={i} />;
                    const isSelected =
                      currentDate && isSameDay(day, currentDate);
                    const isCurrentDay = isToday(day);
                    const classes = [
                      "h-7 w-7 rounded-lg cursor-pointer text-primary-text hover:bg-brand-primary/30 flex items-center justify-center",
                      isSelected ? "bg-brand-primary text-white" : "",
                      isCurrentDay && !isSelected ? "shadow-s" : "",
                    ].join(" ");

                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => handleSelectDate(day)}
                        className={classes}>
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Year View */}
              <div className="w-1/2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <motion.span
                      key={currentYear} // crucial: triggers animation on change
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="text-primary-text font-semibold">
                      {format(currentYear, "yyyy")}
                    </motion.span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleYearChange(-1)}
                        className="active:scale-95 hover:bg-border-color/50 shadow-s cursor-pointer flex justify-center items-center text-primary-text p-0.75 rounded">
                        <IoChevronDown className="w-4.5 h-4.5 rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleYearChange(1)}
                        className="active:scale-95 hover:bg-border-color/50 shadow-s cursor-pointer flex justify-center items-center text-primary-text p-0.75 rounded">
                        <IoChevronDown className="w-4.5 h-4.5 -rotate-90" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-y-8 gap-x-2 text-center">
                    {monthsOfYear.map((month, i) => {
                      const monthDate = setMonth(
                        setYear(new Date(), currentYear.getFullYear()),
                        i
                      );
                      const isSelectedMonth =
                        currentDate && isSameMonth(monthDate, currentDate);
                      const isTodayMonth =
                        isSameMonth(monthDate, today) &&
                        isSameYear(monthDate, today);
                      const classes = [
                        "h-8 flex-1 rounded-lg cursor-pointer flex text-primary-text items-center justify-center hover:bg-brand-primary/30",
                        isSelectedMonth ? "bg-brand-primary text-white" : "",
                        isTodayMonth && !isSelectedMonth ? "shadow-s" : "",
                      ].join(" ");

                      return (
                        <button
                          key={month}
                          onClick={() => handleMonthClick(i)}
                          className={classes}>
                          {month}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoToToday}
                  className="mt-4 cursor-pointer text-brand-primary hover:underline text-sm self-center">
                  Go to today
                </button>
              </div>
            </div>
          ) : mode === "time" ? (
            <div className="flex flex-col items-center justify-center p-4 gap-3">
              <label className="text-primary-text">Select Time</label>
              <div className="flex gap-3">
                <select
                  value={(new Date(currentDate) || today).getHours()}
                  onChange={(e) =>
                    handleTimeChange("hours", parseInt(e.target.value))
                  }
                  className="border border-border-color text-primary-text text-lg font-semibold bg-tertiary-bg rounded-lg px-2 py-1">
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {h.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <p className="text-lg text-primary-text font-semibold">:</p>
                <select
                  value={(new Date(currentDate) || today).getMinutes()}
                  onChange={(e) =>
                    handleTimeChange("minutes", parseInt(e.target.value))
                  }
                  className="border border-border-color text-primary-text text-lg font-semibold bg-tertiary-bg rounded-lg px-2 py-1">
                  {minutes.map((m) => (
                    <option key={m} value={m}>
                      {m.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
              {displayMode !== "time" && (
                <button
                  type="button"
                  onClick={() => setMode("date")}
                  className="text-brand-primary hover:underline text-sm mt-2">
                  Back to Date
                </button>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
