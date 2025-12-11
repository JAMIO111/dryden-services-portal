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
    const standardJobs = jobs.flatMap((j) => {
      const types = Array.isArray(j.propertyDetails.service_type)
        ? j.propertyDetails.service_type
        : [];

      // We're only interested in splitting these:
      const sheetTypes = types.filter((t) =>
        ["changeover", "hot_tub"].includes(t)
      );

      const base = {
        ...j,
        itemType: "job",
        date: new Date(j.jobDate),
        jobId: j.bookingId,
      };

      // If job contains changeover/hot_tub → create one item per type
      if (sheetTypes.length > 0) {
        return sheetTypes.map((type) => ({
          ...base,
          sheetType: type,
        }));
      }

      // Otherwise return a single, normal job
      return [base];
    });

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
