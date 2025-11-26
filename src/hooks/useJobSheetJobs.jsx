import { useMemo } from "react";
import { useJobs } from "./useJobs";
import { useAdHocJobsCalendar } from "./useAdHocJobsCalendar";

export const useJobSheetJobs = (startDate, endDate) => {
  const { data: jobs = [], isLoading: jobsLoading } = useJobs(
    startDate,
    endDate
  );

  const { data: adHocJobs = [], isLoading: adHocJobsLoading } =
    useAdHocJobsCalendar(startDate, endDate);

  const items = useMemo(() => {
    // Normalize standard jobs
    const standardJobs = jobs.map((j) => ({
      ...j,
      itemType: "job",
      date: new Date(j.jobDate),
      jobId: j.bookingId,
      propertyName: j.propertyDetails?.name || "Unnamed Property",
    }));

    // Normalize ad-hoc jobs
    const expandedAdHoc = adHocJobs.flatMap((job) => {
      const base = {
        ...job,
        itemType: "adHocJob",
        jobId: job.ad_hoc_job_id,
        propertyName: job.property_name || "Unnamed Property",
      };

      if (job.type === "Laundry") {
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

    const combined = [...standardJobs, ...expandedAdHoc];

    combined.sort((a, b) => a.date - b.date);

    return combined;
  }, [jobs, adHocJobs]);

  return {
    data: items,
    isLoading: jobsLoading || adHocJobsLoading,
  };
};
