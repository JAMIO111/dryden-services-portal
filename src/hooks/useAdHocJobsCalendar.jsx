import { useQuery } from "@tanstack/react-query";
import supabase from "../supabase-client";

const fetchAdHocJobsCalendar = async (startDate, endDate) => {
  // 1. Fetch the jobs
  const { data: jobs, error } = await supabase
    .from("v_ad_hoc_jobs")
    .select("*")
    .lte("sort_date_start", endDate.toISOString())
    .gte("sort_date_end", startDate.toISOString())
    .order("sort_date_start", { ascending: true });

  if (error) throw new Error(error.message);

  if (!jobs || jobs.length === 0) return [];

  // 2. Collect all property_ids
  const propertyIds = [
    ...new Set(jobs.map((j) => j.property_id).filter(Boolean)),
  ];

  if (propertyIds.length === 0) {
    // No properties → return jobs with empty keyCodes arrays
    return jobs.map((j) => ({ ...j, keyCodes: [] }));
  }

  // 3. Fetch all keycodes for those properties
  const { data: keyCodes, error: keyError } = await supabase
    .from("KeyCodes")
    .select("*")
    .in("property_id", propertyIds);

  if (keyError) throw new Error(keyError.message);

  // 4. Group keycodes by property_id
  const grouped = keyCodes.reduce((acc, kc) => {
    if (!acc[kc.property_id]) acc[kc.property_id] = [];
    acc[kc.property_id].push(kc);
    return acc;
  }, {});

  // 5. Attach keyCodes to each job
  return jobs.map((job) => ({
    ...job,
    keyCodes: grouped[job.property_id] || [],
  }));
};

export const useAdHocJobsCalendar = (startDate, endDate) => {
  return useQuery({
    queryKey: ["AdHocJobs", startDate, endDate],
    queryFn: () => fetchAdHocJobsCalendar(startDate, endDate),
    staleTime: 1000 * 60 * 5,
    enabled: true,
  });
};
