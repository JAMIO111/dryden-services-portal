import { useState, useMemo, useEffect } from "react";
import CTAButton from "./CTAButton";
import { useModal } from "@/contexts/ModalContext";
import DailyCalendarItems from "@components/DailyCalendarItems";
import SlidingSelectorGeneric from "./ui/SlidingSelectorGeneric";
import { useCalendarItems } from "@/hooks/useCalendarItems";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GoPlus } from "react-icons/go";

// --- UTC helpers to avoid DST issues ---
function getSundayUTC(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - day);
  return d;
}

function getFirstOfMonthUTC(date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
}

function formatDateKey(date) {
  return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
}

export default function FullScreenCalendar() {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  const [params, setParams] = useSearchParams();

  // --- Initial view & date from URL
  const initialView = params.get("view") || "Weekly";
  const initialDate = params.get("date")
    ? new Date(params.get("date"))
    : new Date();

  const [view, setView] = useState(initialView);
  const [focusedDate, setFocusedDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(null);

  // --- Normalize date based on view
  const normalizedDate = useMemo(() => {
    if (view === "Monthly") return getFirstOfMonthUTC(focusedDate);
    return getSundayUTC(focusedDate);
  }, [view, focusedDate]);

  // --- Sync URL
  useEffect(() => {
    setParams({
      view,
      date: normalizedDate.toISOString().slice(0, 10),
    });
  }, [view, normalizedDate]);

  // --- Calendar items
  const calendarStartDate = normalizedDate;
  const calendarEndDate = useMemo(() => {
    if (view === "Monthly") {
      const year = normalizedDate.getUTCFullYear();
      const month = normalizedDate.getUTCMonth();
      const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
      return new Date(Date.UTC(year, month, totalCells - firstDayOfMonth));
    } else {
      const d = new Date(normalizedDate);
      d.setUTCDate(d.getUTCDate() + 6);
      return d;
    }
  }, [normalizedDate, view]);

  const { data: calendarItems, isLoading } = useCalendarItems(
    calendarStartDate,
    calendarEndDate
  );

  console.log("Calendar Items:", calendarItems);

  const formattedDate = selectedDate
    ? `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${selectedDate
        .getDate()
        .toString()
        .padStart(2, "0")}`
    : null;

  function getWeekNumber(date) {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7; // Make Sunday = 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Thursday in current week
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return weekNo;
  }

  const handleNewItem = () => {
    openModal({
      title: "Insert New Calendar Item",
      content: <NewCalendarItemForm date={selectedDate} />,
    });
  };

  // --- Navigation
  const goNext = () => {
    const d = new Date(normalizedDate);
    if (view === "Monthly") {
      d.setUTCMonth(d.getUTCMonth() + 1);
      d.setUTCDate(1);
    } else {
      d.setUTCDate(d.getUTCDate() + 7);
    }
    setFocusedDate(d);
  };

  const goPrev = () => {
    const d = new Date(normalizedDate);
    if (view === "Monthly") {
      d.setUTCMonth(d.getUTCMonth() - 1);
      d.setUTCDate(1);
    } else {
      d.setUTCDate(d.getUTCDate() - 7);
    }
    setFocusedDate(d);
  };

  const switchView = (newView) => {
    let d = new Date(focusedDate);
    if (newView === "Monthly") d = getFirstOfMonthUTC(d);
    else d = getSundayUTC(d);
    setView(newView);
    setFocusedDate(d);
  };

  // --- Build calendar grids ---
  const calendarDays = useMemo(() => {
    if (view !== "Monthly") return [];
    const year = normalizedDate.getUTCFullYear();
    const month = normalizedDate.getUTCMonth();
    const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++)
      days.push(new Date(Date.UTC(year, month, d)));
    const totalCells = Math.ceil(days.length / 7) * 7;
    while (days.length < totalCells) days.push(null);
    return days;
  }, [normalizedDate, view]);

  const weeklyDays = useMemo(() => {
    if (view !== "Weekly") return [];
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(normalizedDate);
      d.setUTCDate(d.getUTCDate() + i);
      days.push(d);
    }
    return days;
  }, [normalizedDate, view]);

  // --- Render day cell with indicators ---
  const renderDayCell = (date, idx) => {
    if (!date) {
      return (
        <div
          key={idx}
          className="border border-border-color bg-secondary-bg cursor-default"></div>
      );
    }

    const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    const itemsForDay = calendarItems?.[dateKey] || [];
    const jobsForDay = itemsForDay.filter((item) => item.itemType === "job");
    const meetingsForDay = itemsForDay.filter(
      (item) => item.itemType === "meeting"
    );
    const absencesForDay = itemsForDay.filter(
      (item) => item.itemType === "absence"
    );
    const laundryForDay = itemsForDay.filter(
      (item) => item.itemType === "adHocJob" && item.type === "Laundry"
    );
    const hotTubForDay = itemsForDay.filter(
      (item) => item.itemType === "adHocJob" && item.type === "Hot Tub"
    );
    const cleanForDay = itemsForDay.filter(
      (item) => item.itemType === "adHocJob" && item.type === "Clean"
    );

    const openDailyItemsModal = (date) => {
      openModal({
        title: `Calendar Items for ${date.toLocaleDateString("en-GB", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`,
        content: (
          <DailyCalendarItems
            date={date}
            items={itemsForDay}
            navigate={navigate}
            closeModal={closeModal}
          />
        ),
      });
    };

    return (
      <div
        key={idx}
        onClick={() => {
          setSelectedDate(date);
          openDailyItemsModal(date);
        }}
        className={`relative border border-border-color flex flex-col cursor-pointer
        hover:bg-cta-color/5 
        ${
          formattedDate === dateKey
            ? "bg-blue-100 border-blue-400 shadow-md"
            : ""
        }
        ${
          new Date(date).toDateString() === new Date().toDateString()
            ? "bg-cta-color/15"
            : "bg-tertiary-bg"
        }`}>
        {/* Date Label */}
        <span className="font-semibold text-secondary-text absolute top-1 left-2 z-10 text-right">
          {date.getDate()}
          {view === "Weekly"
            ? ` ${date.toLocaleString("default", { month: "short" })}`
            : ""}
        </span>

        {/* Item counter */}

        <span className="absolute top-2 right-2 text-xs text-error-color">
          {isLoading ? (
            <div className="h-3 w-3 border-2 border-secondary-text border-t-transparent rounded-full animate-spin"></div>
          ) : (
            itemsForDay.length > 0 &&
            `${itemsForDay.length} item${itemsForDay.length !== 1 ? "s" : ""}`
          )}
        </span>

        {/* Indicators */}
        <div className="absolute top-7 bottom-1 left-1 right-1 overflow-y-auto flex flex-col justify-start gap-1">
          {hotTubForDay.length > 0 && view === "Monthly" ? (
            <span className="bg-blue-400/30 text-primary-text text-xs px-1 rounded">
              {hotTubForDay.length} Hot Tub Job
              {hotTubForDay.length > 1 ? "s" : ""}
            </span>
          ) : (
            view === "Weekly" &&
            hotTubForDay.map((job, index) => (
              <span
                key={index}
                className="bg-blue-400/30 text-primary-text p-1 flex flex-row gap-2 rounded">
                <div className="bg-blue-500 rounded-full w-0.75 h-full"></div>
                <div className="flex flex-col py-1 gap-1">
                  <p className="font-semibold text-sm">Hot Tub Job</p>
                  <p className="text-xs">{job.property_name}</p>
                </div>
              </span>
            ))
          )}

          {laundryForDay.length > 0 && view === "Monthly" ? (
            <span className="bg-purple-400/30 text-primary-text text-xs px-1 rounded">
              {laundryForDay.length} Laundry Job
              {laundryForDay.length > 1 ? "s" : ""}
            </span>
          ) : (
            view === "Weekly" &&
            laundryForDay.map((job, index) => (
              <span
                key={index}
                className="bg-purple-400/30 text-primary-text p-1 flex flex-row gap-2 rounded">
                <div className="bg-purple-500 rounded-full w-0.75 h-full"></div>
                <div className="flex flex-col py-1 gap-1">
                  <p className="font-semibold text-sm">Laundry Job</p>
                  <p className="text-xs">{job.property_name}</p>
                  <p className="text-xs text-secondary-text">
                    {`${job.transport} ${
                      job.splitType === "Start" && job.transport === "Client"
                        ? "Dropoff"
                        : job.splitType === "End" &&
                          job.transport === "Dryden Services"
                        ? "Dropoff"
                        : "Pickup"
                    }`}
                  </p>
                </div>
              </span>
            ))
          )}

          {jobsForDay.length > 0 &&
            (view === "Weekly"
              ? jobsForDay.map((job, index) => (
                  <span
                    key={index}
                    className="bg-pink-400/30 text-primary-text p-1 flex flex-row gap-2 rounded">
                    <div className="bg-pink-500 rounded-full w-0.75 h-full"></div>
                    <div className="flex flex-col py-1 gap-1">
                      <p className="font-semibold text-sm">Changeover</p>
                      <p className="text-xs">{job.propertyDetails.name}</p>
                      <p className="text-xs text-secondary-text">
                        {`Next Arrival: ${
                          job.nextArrival
                            ? new Date(job.nextArrival).toLocaleDateString(
                                "en-GB"
                              )
                            : "N/A"
                        }`}
                      </p>
                    </div>
                  </span>
                ))
              : view === "Monthly" && (
                  <span className="bg-pink-400/30 text-primary-text text-xs px-1 rounded">
                    {jobsForDay.length} Changeover
                    {jobsForDay.length > 1 ? "s" : ""}
                  </span>
                ))}

          {cleanForDay.length > 0 && view === "Monthly" ? (
            <span className="bg-green-400/30 text-primary-text text-xs px-1 rounded">
              {cleanForDay.length} Cleaning Job
              {cleanForDay.length > 1 ? "s" : ""}
            </span>
          ) : (
            view === "Weekly" &&
            cleanForDay.map((job, index) => (
              <span
                key={index}
                className="bg-green-400/30 text-primary-text p-1 flex flex-row gap-2 rounded">
                <div className="bg-green-500 rounded-full w-0.75 h-full"></div>
                <div className="flex flex-col py-1 gap-1">
                  <p className="font-semibold text-sm">Cleaning Job</p>
                  <p className="text-xs">{job.property_name}</p>
                </div>
              </span>
            ))
          )}

          {meetingsForDay.length > 0 &&
            (view === "Weekly"
              ? meetingsForDay.map((meeting, index) => (
                  <span
                    key={index}
                    className="bg-orange-400/30 p-1 rounded flex flex-row gap-2">
                    <div className="bg-orange-500 rounded-full w-0.75 h-full"></div>
                    <div className="flex flex-col py-1 gap-1">
                      <p className="text-sm font-semibold text-primary-text">
                        Meeting
                      </p>
                      <p className="text-xs text-primary-text">
                        {meeting.title}
                      </p>
                      <p className="text-xs text-secondary-text">
                        {`${new Date(meeting.start_date).toLocaleTimeString(
                          "en-GB",
                          { hour: "2-digit", minute: "2-digit" }
                        )} - ${new Date(meeting.end_date).toLocaleTimeString(
                          "en-GB",
                          { hour: "2-digit", minute: "2-digit" }
                        )}`}
                      </p>
                    </div>
                  </span>
                ))
              : view === "Monthly" && (
                  <span className="bg-orange-400/30 text-primary-text text-xs px-1 rounded">
                    {meetingsForDay.length} Meeting
                    {meetingsForDay.length > 1 ? "s" : ""}
                  </span>
                ))}

          {absencesForDay.length > 0 &&
            (view === "Weekly"
              ? absencesForDay.map((absence, index) => (
                  <span
                    key={index}
                    className="bg-red-400/30 p-1 rounded flex flex-row gap-2">
                    <div className="bg-red-500 rounded-full w-0.75 h-full"></div>
                    <div className="flex flex-col py-1 gap-1">
                      <p className="text-sm font-semibold text-primary-text">
                        Absence
                      </p>
                      <div className="flex flex-row gap-2 items-center">
                        {absence.employee.avatar ? (
                          <img
                            className="w-6 h-6 rounded-full object-cover"
                            src={absence.employee.avatar}
                            alt={`${absence.employee.first_name} ${absence.employee.surname}`}
                          />
                        ) : (
                          <div className="w-5 h-5 p-3 bg-secondary-text/20 text-xs rounded-full flex items-center justify-center">
                            {absence.employee.first_name
                              .charAt(0)
                              .toUpperCase()}
                            {absence.employee.surname.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <p className="text-sm text-primary-text">
                          {`${absence.employee.first_name} ${absence.employee.surname}`}
                        </p>
                      </div>
                    </div>
                  </span>
                ))
              : view === "Monthly" && (
                  <span className="bg-red-400/30 text-primary-text text-xs px-1 rounded">
                    {absencesForDay.length} Absence
                    {absencesForDay.length > 1 ? "s" : ""}
                  </span>
                ))}
        </div>
      </div>
    );
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="h-full bg-primary-bg flex items-center justify-center">
      <div className="shadow-m h-full w-full flex flex-col overflow-hidden">
        {/* Header */}
        <header className="p-3 gap-3 border-border-color flex justify-between items-center bg-tertiary-bg text-primary-text">
          <h1 className="text-2xl flex-1 font-bold">
            {view === "Monthly"
              ? normalizedDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })
              : `Week ${getWeekNumber(
                  normalizedDate
                )}, ${normalizedDate.getUTCFullYear()}`}
          </h1>
          {false && (
            <div className="flex gap-2 items-center shadow-s bg-secondary-bg p-1 rounded-xl">
              <CTAButton
                icon={GoPlus}
                width="w-28"
                type="main"
                text="Insert Item"
                callbackFn={handleNewItem}
              />
            </div>
          )}
          <div className="flex w-60 items-center gap-4">
            <SlidingSelectorGeneric
              options={["Weekly", "Monthly"]}
              value={view}
              onChange={switchView}
            />
          </div>
          <div className="flex gap-2 items-center shadow-s bg-secondary-bg p-1 rounded-xl">
            <CTAButton
              width="w-28"
              type="main"
              text="Previous"
              callbackFn={goPrev}
            />
            <CTAButton
              width="w-28"
              type="main"
              text="Next"
              callbackFn={goNext}
            />
          </div>
        </header>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-secondary-bg border-t border-border-color">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-secondary-text uppercase py-2 border-r border-border-color last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <main
          className={`flex-1 border-border-color border-t bg-secondary-bg grid ${
            view === "Monthly" ? "grid-cols-7" : "grid-cols-7 grid-rows-1"
          } overflow-hidden`}>
          {view === "Monthly"
            ? calendarDays.map((date, idx) => renderDayCell(date, idx))
            : weeklyDays.map((date, idx) => renderDayCell(date, idx))}
        </main>
      </div>
    </div>
  );
}
