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
      query = query
        .order(sortColumn, { ascending: sortOrder === "asc" })
        .range(from, to)
        .gte("sort_date", startDate.toISOString())
        .lte("sort_date", endDate.toISOString());

      if (search) {
        query = query.or(`property_name.ilike.%${search}%`);
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
