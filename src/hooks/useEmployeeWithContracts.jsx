import { useQuery } from "@tanstack/react-query";
import supabase from "../supabase-client";

export const useEmployeeWithContracts = (employeeId) => {
  return useQuery({
    queryKey: ["Employee", employeeId, "contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Employees")
        .select(
          `
          *,
          EmployeePeriod (
            id,
            created_at,
            terminated_at,
            job_title,
            contract_type,
            hourly_rate
          )
        `
        )
        .eq("id", employeeId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });
};
