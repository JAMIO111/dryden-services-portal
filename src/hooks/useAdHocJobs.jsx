import { useQuery } from "@tanstack/react-query";
import supabase from "../supabase-client";
import { useAdHocJobsFilters } from "./useAdHocJobsFilters";

export const useAdHocJobs = ({
  sortColumn = "start_date",
  sortOrder = "desc",
  page = 1,
  pageSize = 50,
  startDate,
  endDate,
}) => {
  const { search } = useAdHocJobsFilters();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  console.log("Query params:", {
    sortColumn,
    sortOrder,
    from,
    to,
  });

  return useQuery({
    queryKey: [
      {
        search,
        sortColumn,
        sortOrder,
        page,
        pageSize,
        startDate,
        endDate,
      },
    ],
    queryFn: async () => {
      let query = supabase
        .from("v_ad_hoc_jobs")
        .select("*", { count: "exact" });

      query = query.is("deleted_at", null);

      query = query
        .order(sortColumn, { ascending: sortOrder === "asc" })
        .range(from, to)
        .lte("sort_date_start", endDate.toISOString()) // job starts before user range ends
        .gte("sort_date_end", startDate.toISOString()) // job ends after user range starts
        .order("sort_date_start", { ascending: true });

      if (search) {
        query = query.or(
          `property_name.ilike.%${search}%,notes.ilike.%${search}%,ad_hoc_job_id.ilike.%${search}%,type.ilike.%${search}%`
        );
      }

      const { data, count, error } = await query;

      if (error) {
        throw new Error(error.message);
      }
      console.log(`Fetched data:`, data);
      return { data, count };
    },
    staleTime: 1000 * 60 * 5,
  });
};
