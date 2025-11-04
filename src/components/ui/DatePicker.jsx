import { useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import { TbCalendarTime, TbCalendar, TbClock } from "react-icons/tb";

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
  setHours,
  setMinutes,
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

const DatePicker = ({ label, currentDate, onChange, displayMode = "date" }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date());
  const [mode, setMode] = useState(""); // "date" | "time"

  const handleSelectDate = (date) => {
    const updated = new Date(date);
    if (currentDate) {
      updated.setHours(currentDate.getHours());
      updated.setMinutes(currentDate.getMinutes());
    }
    onChange(updated);
    setCurrentMonth(date);
    setCurrentYear(date);
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

  return (
    <div className="flex flex-col gap-1 h-fit min-w-0 relative">
      <label className="font-medium text-primary-text">{label}</label>
      <div className="flex flex-col transition-all duration-300 bg-text-input-color border border-border-color rounded-lg shadow-s w-full text-sm text-primary-text">
        {/* Header with optional toggle */}
        <div
          className="flex p-2 cursor-pointer justify-start items-center"
          onClick={() => {
            mode !== ""
              ? setMode("")
              : setMode(displayMode === "datetime" ? "date" : displayMode);
          }}>
          {displayMode === "datetime" ? (
            <TbCalendarTime className="w-5 h-5 text-primary-text mr-3 flex-shrink-0" />
          ) : displayMode === "date" ? (
            <TbCalendar className="w-5 h-5 text-primary-text mr-3 flex-shrink-0" />
          ) : (
            <TbClock className="w-5 h-5 text-primary-text mr-3 flex-shrink-0" />
          )}
          <span className="text-primary-text ">
            {format(
              currentDate || today,
              displayMode === "date"
                ? "PPP"
                : displayMode === "time"
                ? "p"
                : "PPP p"
            )}
          </span>
          {displayMode === "datetime" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMode(mode === "date" ? "time" : "date");
              }}
              className="text-brand-primary hover:underline text-sm">
              {mode !== "" && (mode === "date" ? "Select Time" : "Select Date")}
            </button>
          )}
        </div>

        {mode === "date" ? (
          <div className="flex p-3 gap-4">
            {/* Left: Month View */}
            <div className="w-1/2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">
                  {format(currentMonth, "MMMM yyyy")}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleMonthChange(-1)}
                    className="hover:bg-secondary-color px-2 py-1 rounded active:scale-95">
                    <IoChevronDown className="w-5 h-5 rotate-180" />
                  </button>
                  <button
                    onClick={() => handleMonthChange(1)}
                    className="hover:bg-tertiary-color px-2 py-1 rounded active:scale-95">
                    <IoChevronDown className="w-5 h-5" />
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
                  const isSelected = currentDate && isSameDay(day, currentDate);
                  const isCurrentDay = isToday(day);
                  const classes = [
                    "h-7 w-7 rounded-lg cursor-pointer hover:bg-brand-primary/30 flex items-center justify-center",
                    isSelected ? "bg-brand-primary text-white" : "",
                    isCurrentDay && !isSelected
                      ? "border border-brand-primary hover:bg-border-color/50"
                      : "",
                    !isSelected && !isCurrentDay
                      ? "hover:bg-border-color/50"
                      : "",
                  ].join(" ");

                  return (
                    <button
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
                  <span className="font-semibold">
                    {format(currentYear, "yyyy")}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleYearChange(-1)}
                      className="hover:bg-border-color px-2 py-1 rounded active:scale-95">
                      <IoChevronDown className="w-5 h-5 rotate-180" />
                    </button>
                    <button
                      onClick={() => handleYearChange(1)}
                      className="hover:bg-border-color px-2 py-1 rounded active:scale-95">
                      <IoChevronDown className="w-5 h-5" />
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
                      currentDate &&
                      isSameMonth(monthDate, currentDate) &&
                      isSameYear(monthDate, currentDate);
                    const isTodayMonth =
                      isSameMonth(monthDate, today) &&
                      isSameYear(monthDate, today);
                    const classes = [
                      "h-8 flex-1 rounded-lg hover:bg-brand-primary/30 cursor-pointer flex items-center justify-center",
                      isSelectedMonth ? "bg-brand-primary text-white" : "",
                      isTodayMonth && !isSelectedMonth
                        ? "border border-brand-primary hover:bg-border-color/50"
                        : "",
                      !isSelectedMonth && !isTodayMonth
                        ? "hover:bg-border-color/50"
                        : "",
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
                onClick={handleGoToToday}
                className="mt-4 ml-auto text-brand-primary hover:underline text-sm self-center cursor-pointer">
                Go to today
              </button>
            </div>
          </div>
        ) : mode === "time" ? (
          // Time Picker Mode
          <div className="flex flex-col items-center justify-center p-4 gap-3">
            <label className="text-primary-text">Select Time</label>
            <div className="flex gap-3">
              <select
                value={(currentDate || today).getHours()}
                onChange={(e) =>
                  handleTimeChange("hours", parseInt(e.target.value))
                }
                className="border border-border-color text-lg font-semibold bg-tertiary-bg rounded-lg px-2 py-1 outline-none focus:border-brand-primary">
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
              <p className="text-lg font-semibold">:</p>
              <select
                value={(currentDate || today).getMinutes()}
                onChange={(e) =>
                  handleTimeChange("minutes", parseInt(e.target.value))
                }
                className="border border-border-color bg-tertiary-bg text-lg font-semibold rounded-lg px-2 py-1 outline-none focus:border-brand-primary">
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {m.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
            {displayMode !== "time" && (
              <button
                onClick={() => setMode("date")}
                className="text-brand-primary hover:underline text-sm mt-2">
                Back to Date
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DatePicker;
