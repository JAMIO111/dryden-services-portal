import { eachDayOfInterval, parseISO } from "date-fns";
import { useMemo } from "react";
import { useJobs } from "./useJobs";
import { useMeetings } from "./useMeetings";
import { useAbsences } from "./useAbsences";

export const useCalendarItems = (startDate, endDate) => {
  const { data: jobs = [], isLoading: jobsLoading } = useJobs(
    startDate,
    endDate
  );
  const { data: meetings = [], isLoading: meetingsLoading } = useMeetings(
    startDate,
    endDate
  );
  const { data: absences = [], isLoading: absencesLoading } = useAbsences(
    startDate,
    endDate
  );

  const formatDateLocal = (d) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
      .getDate()
      .toString()
      .padStart(2, "0")}`;

  const groupedItems = useMemo(() => {
    const combined = [
      ...jobs.map((j) => ({ ...j, type: "job", date: new Date(j.jobDate) })),
      ...meetings.map((m) => ({
        ...m,
        type: "meeting",
        date: new Date(m.start_date),
      })),
      ...absences.flatMap((a) => {
        const days = eachDayOfInterval({
          start: parseISO(a.start_date),
          end: parseISO(a.end_date),
        });
        return days.map((day) => ({ ...a, type: "absence", date: day }));
      }),
    ];

    return combined.reduce((acc, item) => {
      const dateKey = formatDateLocal(item.date);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(item);
      return acc;
    }, {});
  }, [jobs, meetings, absences]);

  return {
    data: groupedItems,
    isLoading: jobsLoading || meetingsLoading || absencesLoading,
  };
};
