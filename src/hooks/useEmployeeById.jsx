import { useQuery } from "@tanstack/react-query";
import supabase from "../supabase-client";

const fetchEmployeesById = async (employeeId) => {
  const { data, error } = await supabase
    .from("Employees")
    .select("*")
    .eq("id", employeeId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const useEmployeeById = (employeeId) => {
  return useQuery({
    queryKey: ["Employee", employeeId],
    queryFn: () => fetchEmployeesById(employeeId),
    staleTime: 1000 * 60 * 5, // optional: 5 min cache
    enabled: !!employeeId,
  });
};
