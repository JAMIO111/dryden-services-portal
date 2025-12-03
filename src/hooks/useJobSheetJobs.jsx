import { useMemo } from "react";
import { useJobs } from "./useJobs";
import { useAdHocJobsCalendar } from "./useAdHocJobsCalendar";

export const useJobSheetJobs = (startDate, endDate, split = true) => {
  const { data: jobs = [], isLoading: jobsLoading } = useJobs(
    startDate,
    endDate
  );

  const { data: adHocJobs = [], isLoading: adHocJobsLoading } =
    useAdHocJobsCalendar(startDate, endDate);

  const items = useMemo(() => {
    // Standard Jobs
    const standardJobs = jobs.map((j) => ({
      ...j,
      itemType: "job",
      date: new Date(j.jobDate),
      jobId: j.bookingId,
    }));

    // Ad-hoc Jobs
    const expandedAdHoc = adHocJobs.flatMap((job) => {
      const base = {
        ...job,
        itemType: "adHocJob",
        jobId: job.ad_hoc_job_id,
      };

      // Handling Laundry jobs depending on `split` flag
      if (job.type === "Laundry") {
        if (!split) {
          // Entire job returned as one item
          return [
            {
              ...base,
              date: new Date(job.sort_date_start),
              splitType: "Full",
            },
          ];
        }

        // Split mode (current behaviour)
        const start = job.start_date
          ? { ...base, splitType: "Start", date: new Date(job.start_date) }
          : null;
        const end = job.end_date
          ? { ...base, splitType: "End", date: new Date(job.end_date) }
          : null;

        return [start, end].filter(Boolean);
      }

      // One-off ad-hoc jobs
      return job.single_date
        ? [{ ...base, date: new Date(job.single_date) }]
        : [];
    });

    // Combine & sort
    const combined = [...standardJobs, ...expandedAdHoc];
    combined.sort((a, b) => a.date - b.date);

    return combined;
  }, [jobs, adHocJobs, split]);

  return {
    data: items,
    isLoading: jobsLoading || adHocJobsLoading,
  };
};
