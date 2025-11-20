import { useCallback } from "react";

// Utility helpers
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const addWeeks = (date, weeks) => addDays(date, weeks * 7);

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

// Nth weekday in month
const getNthWeekdayOfMonth = (year, month, weekday, ordinal) => {
  const ordinalIndex = ["First", "Second", "Third", "Fourth", "Last"].indexOf(
    ordinal
  );
  if (ordinalIndex < 0) return null;

  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();

  const targetIndex = weekday;

  // Non-last
  if (ordinal !== "Last") {
    const day = 1 + ((targetIndex - firstWeekday + 7) % 7) + ordinalIndex * 7;
    return new Date(year, month, day);
  }

  // Last
  let d = new Date(year, month + 1, 0);
  while (d.getDay() !== targetIndex) d.setDate(d.getDate() - 1);
  return d;
};

export const useGenerateRecurrences = () => {
  const generate = useCallback((startDate, ruleData) => {
    const {
      frequency,
      interval,
      daysOfWeek,
      dayOfMonth,
      monthlyOrdinal,
      monthlyType,
      endCondition,
      occurrences,
      endDate,
    } = ruleData;

    const start = new Date(startDate);
    const results = [];

    const maxCount =
      endCondition === "after"
        ? occurrences + 5 // buffer so removing start doesn't cut a recurrence
        : 500;

    const endLimit = endCondition === "onDate" ? new Date(endDate) : null;

    let current = new Date(start);

    const weekdayIndex = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    function pushIfValid(date) {
      if (endLimit && date > endLimit) return false;
      results.push(date);
      return true;
    }

    // DAILY
    if (frequency === "daily") {
      for (let i = 0; i < maxCount; i++) {
        if (!pushIfValid(new Date(current))) break;
        current = addDays(current, interval);
      }
    }

    // WEEKLY
    if (frequency === "weekly") {
      const sortedDays = daysOfWeek
        .map((d) => weekdayIndex[d])
        .sort((a, b) => a - b);

      let cycleDate = new Date(current);

      while (results.length < maxCount) {
        for (const d of sortedDays) {
          const tmp = new Date(cycleDate);
          tmp.setDate(tmp.getDate() + ((d - tmp.getDay() + 7) % 7));

          if (tmp < start) continue;
          if (!pushIfValid(tmp)) return results;
        }

        cycleDate = addWeeks(cycleDate, interval);
      }
    }

    // MONTHLY
    if (frequency === "monthly") {
      while (results.length < maxCount) {
        const y = current.getFullYear();
        const m = current.getMonth();
        let date;

        if (monthlyType === "Ordinal Pattern") {
          const w = weekdayIndex[monthlyOrdinal.weekday];
          date = getNthWeekdayOfMonth(y, m, w, monthlyOrdinal.ordinal);
        } else {
          date = new Date(y, m, dayOfMonth);
        }

        if (date >= start) {
          if (!pushIfValid(date)) break;
        }

        current = addMonths(current, interval);
      }
    }

    // *** UNIVERSAL RULE: remove start date ***
    const filtered = results.filter(
      (d) => d.toDateString() !== start.toDateString()
    );

    // If user requested N occurrences, return exactly N
    if (endCondition === "after") {
      return filtered.slice(0, occurrences);
    }

    // If using end date, just return filtered dates <= end date
    return endLimit ? filtered.filter((d) => d <= endLimit) : filtered;
  }, []);

  return { generateRecurrences: generate };
};
