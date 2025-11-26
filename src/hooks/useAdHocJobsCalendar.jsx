import { useQuery } from "@tanstack/react-query";
import supabase from "../supabase-client";

const fetchAdHocJobsCalendar = async (startDate, endDate) => {
  const { data, error } = await supabase
    .from("v_ad_hoc_jobs")
    .select(
      `
      *
    `
    )
    .lte("sort_date_start", endDate.toISOString()) // job starts before user range ends
    .gte("sort_date_end", startDate.toISOString()) // job ends after user range starts
    .order("sort_date_start", { ascending: true });

  if (error) throw new Error(error.message);

  console.log(
    "Fetched AdHocJobsCalendar with dates:",
    startDate,
    endDate,
    data
  );
  return data;
};

export const useAdHocJobsCalendar = (startDate, endDate) => {
  return useQuery({
    queryKey: ["AdHocJobs", startDate, endDate],
    queryFn: () => fetchAdHocJobsCalendar(startDate, endDate),
    staleTime: 1000 * 60 * 5, // optional: 5 min cache
    enabled: true,
  });
};
