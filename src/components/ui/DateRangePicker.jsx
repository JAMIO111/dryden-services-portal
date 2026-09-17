// ./ui/DateRangePicker.jsx
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { RxCalendar } from "react-icons/rx";
import { IoChevronDown } from "react-icons/io5";
import CTAButton from "../CTAButton";
import { datePresets } from "@/lib/HelperFunctions";
import { MdErrorOutline } from "react-icons/md";

const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

const toISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

function generateCalendar(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const calendar = [];
  let dayCounter = 1 - firstDay;

  while (dayCounter <= daysInMonth) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(
        dayCounter < 1 || dayCounter > daysInMonth
          ? null
          : new Date(year, month, dayCounter),
      );
      dayCounter++;
    }
    calendar.push(week);
  }
  return calendar;
}

function formatDate(date) {
  return date
    ? date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "2-digit",
      })
    : "";
}

function formatDateShort(date) {
  return date
    ? date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
    : "";
}

export default function DateRangePicker({
  alignment = "left",
  label,
  required = false,
  value = { startDate: null, endDate: null },
  onChange,
  switchMode = true,
  width = "w-fit",
  rangeCounter = true,
  rangeCounterText = "nights",
  error,
  presets = [],
  // When true, the trigger shrinks its display (full date -> dd/mm/yy ->
  // icon-only) as the viewport narrows, instead of always showing the
  // full "ddd, dd mmm yy" text. Intended for header placements that need
  // to avoid wrapping; leave off for dedicated form fields with their
  // own room (e.g. BookingForm), which should keep showing full text.
  compact = false,
}) {
  const triggerRef = useRef(null);
  const containerRef = useRef(null);
  const popupRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [popupOffset, setPopupOffset] = useState(0);
  const [hoverDate, setHoverDate] = useState(null);
  const [mode, setMode] = useState(switchMode ? "quick" : "static");
  const [calendarDate, setCalendarDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });

  const parseISO = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const startDate =
    value.startDate && typeof value.startDate === "string"
      ? parseISO(value.startDate)
      : value.startDate instanceof Date
        ? value.startDate
        : null;

  const endDate =
    value.endDate && typeof value.endDate === "string"
      ? parseISO(value.endDate)
      : value.endDate instanceof Date
        ? value.endDate
        : null;

  const visiblePresets = presets.length
    ? presets
        .map((label) => datePresets.find((preset) => preset.label === label))
        .filter(Boolean) // removes any labels that don’t exist in datePresets
    : datePresets;

  // ---- Handle clicks outside ----
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        switchMode && setMode("quick");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // ---- Calendar navigation ----
  const goToPreviousMonth = () =>
    setCalendarDate(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 },
    );
  const goToNextMonth = () =>
    setCalendarDate(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 },
    );

  const { year, month } = calendarDate;
  const calendar = generateCalendar(year, month);

  // ---- Day selection ----
  const handleDayClick = (day) => {
    if (!startDate || (startDate && endDate)) {
      // first click or restarting selection
      onChange({ startDate: toISODate(day), endDate: null });
      return;
    }

    // second click
    if (day < startDate) {
      onChange({
        startDate: toISODate(day),
        endDate: toISODate(startDate),
      });
    } else {
      onChange({
        startDate: toISODate(startDate),
        endDate: toISODate(day),
      });
    }
  };

  const isInRange = (day) => {
    if (!day) return false;

    const start = startDate;
    const end = endDate || hoverDate;

    if (!start || !end) return false;

    const toNumber = (d) => {
      if (!d) return 0;
      if (typeof d === "string") return Number(d.replace(/-/g, ""));
      return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    };

    const nDay = toNumber(day);
    const nStart = toNumber(start);
    const nEnd = toNumber(end);

    const min = Math.min(nStart, nEnd);
    const max = Math.max(nStart, nEnd);

    return nDay >= min && nDay <= max;
  };

  const isSameDay = (d1, d2) =>
    d1?.getFullYear() === d2?.getFullYear() &&
    d1?.getMonth() === d2?.getMonth() &&
    d1?.getDate() === d2?.getDate();

  const isEdge = (day) => isSameDay(day, startDate) || isSameDay(day, endDate);

  const isSameRange = (s1, e1, s2, e2) =>
    isSameDay(s1, s2) && isSameDay(e1, e2);

  const selectPresetRange = (start, end) => {
    onChange({ startDate: start, endDate: end });
    setCalendarDate({ year: start.getFullYear(), month: start.getMonth() });
    setIsOpen(false);
    setMode("quick");
  };

  useEffect(() => {
    if (!isOpen) return;

    const baseDate = startDate instanceof Date ? startDate : new Date();

    setCalendarDate({
      year: baseDate.getFullYear(),
      month: baseDate.getMonth(),
    });
  }, [isOpen]);

  // ---- Keep the popup on-screen regardless of where the trigger sits ----
  // The popup is anchored to the trigger via CSS (left/right), but that
  // anchor alone isn't enough: the same trigger can end up near the left
  // edge on one page and the right edge on another (depending on what else
  // shares the header), so a static anchor can still push the popup off
  // either side of the viewport. Nudge it back in bounds after it renders.
  useLayoutEffect(() => {
    if (!isOpen) {
      setPopupOffset(0);
      return;
    }
    const el = popupRef.current;
    if (!el) return;

    const margin = 16;
    const rect = el.getBoundingClientRect();
    let offset = 0;

    if (rect.right > window.innerWidth - margin) {
      offset -= rect.right - (window.innerWidth - margin);
    }
    if (rect.left + offset < margin) {
      offset += margin - (rect.left + offset);
    }

    setPopupOffset(offset);
  }, [isOpen]);

  return (
    <div className={`relative ${width}`} ref={containerRef}>
      {label && (
        <div className="flex items-center gap-1 mb-1">
          <label className="font-medium text-primary-text">{label}</label>
          {required && (
            <label className="text-error-color text-sm" title="Required">
              *
            </label>
          )}
        </div>
      )}

      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        title={error && error.message}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Select date range"
        className={`relative flex items-center cursor-pointer ${
          compact ? "w-fit sm:w-full" : "w-full"
        }`}
        ref={triggerRef}>
        {compact && (
          <div
            className={`sm:hidden flex items-center justify-center w-10 h-10 shrink-0 border ${
              isOpen ? "border-cta-color" : "border-transparent"
            } ${
              error ? "border-error-color" : ""
            } shadow-s hover:shadow-m rounded-lg bg-text-input-color`}>
            {error ? (
              <MdErrorOutline className="text-error-color w-5 h-5" />
            ) : (
              <RxCalendar className="text-primary-text w-5 h-5" />
            )}
          </div>
        )}

        <div
          className={`${compact ? "hidden sm:flex" : "flex"} relative items-center w-full border ${
            isOpen ? "border-cta-color" : ""
          } ${
            error ? "border-error-color" : "border-transparent"
          } shadow-s hover:shadow-m text-primary-text pr-4 pl-11 py-2 rounded-lg bg-text-input-color`}>
          {error ? (
            <MdErrorOutline className="absolute left-2.5 top-1/2 -translate-y-1/2 text-error-color w-5 h-5" />
          ) : (
            <RxCalendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary-text w-5 h-5" />
          )}
          {startDate ? (
            compact ? (
              <>
                <span className="md:hidden truncate">
                  {startDate && endDate
                    ? `${formatDateShort(startDate)} - ${formatDateShort(endDate)}`
                    : `${formatDateShort(startDate)} -`}
                </span>
                <span className="hidden md:inline truncate">
                  {startDate && endDate
                    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                    : `${formatDate(startDate)} -`}
                </span>
              </>
            ) : (
              <span className="truncate">
                {startDate && endDate
                  ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                  : `${formatDate(startDate)} -`}
              </span>
            )
          ) : (
            <span className="text-sm text-muted truncate">
              {compact ? (
                <>
                  <span className="md:hidden">Select dates</span>
                  <span className="hidden md:inline">Select date range</span>
                </>
              ) : (
                "Select date range"
              )}
            </span>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          ref={popupRef}
          style={
            popupOffset ? { transform: `translateX(${popupOffset}px)` } : undefined
          }
          className={`absolute ${label ? "top-18" : "top-12"} ${
            alignment === "right" ? "right-0 left-auto" : "left-0"
          } z-50 flex flex-col lg:flex-row items-stretch bg-secondary-bg rounded-xl shadow-s w-fit max-w-[calc(100vw-2rem)] lg:max-w-none`}>
          {/* Calendar */}
          <div className="flex flex-col flex-1 w-70 p-4">
            <div className="flex justify-between items-center mb-2">
              <button
                className="hover:shadow-s cursor-pointer active:scale-95 rounded p-1 text-primary-text"
                onClick={goToPreviousMonth}>
                <IoChevronDown className="rotate-90" />
              </button>
              <span className="font-medium text-primary-text">
                {new Date(year, month).toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                className="hover:shadow-s cursor-pointer active:scale-95 rounded p-1 text-primary-text"
                onClick={goToNextMonth}>
                <IoChevronDown className="rotate-270" />
              </button>
            </div>

            <div className="grid grid-cols-7 text-center text-xs font-semibold text-secondary-text">
              {daysOfWeek.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendar.flatMap((week, i) =>
                week.map((day, j) =>
                  day ? (
                    <button
                      key={`${i}-${j}`}
                      onClick={() => handleDayClick(day)}
                      onMouseEnter={() => setHoverDate(day)}
                      onMouseLeave={() => setHoverDate(null)}
                      className={`h-8 w-9 text-sm transition-colors text-primary-text
                        ${
                          isEdge(day)
                            ? startDate &&
                              endDate &&
                              startDate.getTime() === endDate.getTime()
                              ? "bg-cta-color text-white rounded-xl"
                              : day.getTime() === startDate?.getTime()
                                ? "bg-cta-color text-white rounded-l-xl"
                                : "bg-cta-color text-white rounded-r-xl"
                            : isInRange(day)
                              ? "bg-cta-color/20 text-blue-800"
                              : "hover:bg-cta-color/5 rounded-xl"
                        }
                      `}>
                      {day.getDate()}
                    </button>
                  ) : (
                    <div key={`${i}-${j}`} />
                  ),
                ),
              )}
            </div>

            <div className="flex flex-1 items-end justify-between mt-2">
              <CTAButton
                type="cancel"
                text="Reset"
                title="Reset Date Range"
                icon={null}
                callbackFn={() => onChange({ startDate: null, endDate: null })}
              />
              {rangeCounter && startDate && (
                <div className="font-semibold bg-cta-btn-bg border rounded-lg border-cta-btn-border flex items-center justify-center text-primary-text px-2 py-1">
                  {Math.abs(
                    Math.round(
                      ((endDate || hoverDate || startDate) - startDate) /
                        (1000 * 60 * 60 * 24),
                    ),
                  ) + (rangeCounterText === "Days" ? 1 : 0)}{" "}
                  {rangeCounterText}
                </div>
              )}
              <CTAButton
                disabled={!startDate || !endDate}
                type="success"
                text="Apply"
                title="Apply Date Range"
                icon={null}
                callbackFn={() => {
                  if (startDate && endDate)
                    onChange({
                      startDate: toISODate(startDate),
                      endDate: toISODate(endDate),
                    });
                  setIsOpen(false);
                }}
              />
            </div>
          </div>

          {/* Sidebar */}
          {mode !== "static" && (
            <>
              <div className="h-0.25 w-full lg:h-auto lg:w-0.25 bg-border-color"></div>
              <div className="w-full lg:w-40 p-3">
                {visiblePresets.map(({ label, range }) => {
                  const [presetStart, presetEnd] = range();
                  const isSelected =
                    startDate &&
                    endDate &&
                    isSameRange(presetStart, presetEnd, startDate, endDate);

                  return (
                    <button
                      key={label}
                      className={`block w-full text-left text-sm text-primary-text py-1 px-2 rounded ${
                        isSelected
                          ? "bg-cta-color text-white"
                          : "hover:bg-cta-color/10"
                      }`}
                      onClick={() => {
                        const [start, end] = range();
                        selectPresetRange(start, end);
                      }}>
                      {label}
                    </button>
                  );
                })}
                {switchMode && (
                  <button
                    className="mt-2 block w-full text-left text-sm py-1 px-2 bg-primary-text text-primary-bg rounded"
                    onClick={() => setMode("custom")}>
                    Custom Range
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
