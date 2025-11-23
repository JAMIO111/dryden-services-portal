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
    .gte("sort_date", startDate.toISOString())
    .lte("sort_date", endDate.toISOString())
    .order("sort_date", { ascending: true });

  if (error) throw new Error(error.message);
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
