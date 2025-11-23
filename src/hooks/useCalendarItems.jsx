import { eachDayOfInterval, parseISO } from "date-fns";
import { useMemo } from "react";
import { useJobs } from "./useJobs";
import { useMeetings } from "./useMeetings";
import { useAbsences } from "./useAbsences";
import { useAdHocJobsCalendar } from "./useAdHocJobsCalendar";

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
  const { data: adHocJobs = [], isLoading: adHocJobsLoading } =
    useAdHocJobsCalendar(startDate, endDate);

  const formatDateLocal = (d) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
      .getDate()
      .toString()
      .padStart(2, "0")}`;

  const groupedItems = useMemo(() => {
    const combined = [
      ...jobs.map((j) => ({
        ...j,
        itemType: "job",
        date: new Date(j.jobDate),
      })),
      ...meetings.map((m) => ({
        ...m,
        itemType: "meeting",
        date: new Date(m.start_date),
      })),
      ...absences.flatMap((a) => {
        const days = eachDayOfInterval({
          start: parseISO(a.start_date),
          end: parseISO(a.end_date),
        });
        return days.map((day) => ({ ...a, itemType: "absence", date: day }));
      }),
      ...adHocJobs.flatMap((job) => {
        if (job.type === "Laundry") {
          // Create two items: one for start_date, one for end_date
          const start = {
            ...job,
            itemType: "adHocJob",
            splitType: "Start",
            date: job.start_date ? new Date(job.start_date) : null,
          };
          const end = {
            ...job,
            itemType: "adHocJob",
            splitType: "End",
            date: job.end_date ? new Date(job.end_date) : null,
          };
          return [start, end].filter(Boolean); // Remove nulls
        } else {
          // For other types, just use single_date
          return [
            {
              ...job,
              itemType: "adHocJob",
              date: job.single_date ? new Date(job.single_date) : null,
            },
          ].filter(Boolean);
        }
      }),
    ];

    return combined.reduce((acc, item) => {
      if (!item.date) return acc; // skip items without a valid date
      const dateKey = formatDateLocal(item.date);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(item);
      return acc;
    }, {});
  }, [jobs, meetings, absences, adHocJobs]);

  return {
    data: groupedItems,
    isLoading:
      jobsLoading || meetingsLoading || absencesLoading || adHocJobsLoading,
  };
};
