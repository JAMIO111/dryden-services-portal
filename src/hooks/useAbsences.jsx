import { useQuery } from "@tanstack/react-query";
import supabase from "../supabase-client";

const fetchAbsences = async (startDate, endDate) => {
  const { data, error } = await supabase
    .from("Absences")
    .select("*, employee:Employees(id, avatar, first_name, surname, job_title)")
    .lte("start_date", endDate.toISOString()) // starts before query end
    .gte("end_date", startDate.toISOString()); // ends after query start

  if (error) throw new Error(error.message);
  return data;
};

export const useAbsences = (startDate, endDate) => {
  return useQuery({
    queryKey: ["Absences", startDate, endDate],
    queryFn: () => fetchAbsences(startDate, endDate),
    staleTime: 1000 * 60 * 5, // optional: 5 min cache
    enabled: !!startDate && !!endDate,
  });
};
