import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase-client";

export const useTerminateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeePeriodId, terminatedAt = new Date() }) => {
      const { error } = await supabase
        .from("EmployeePeriod")
        .update({ terminated_at: terminatedAt })
        .eq("id", employeePeriodId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["Employees", "active"]);
      queryClient.invalidateQueries(["EmployeePeriod"]);
    },
  });
};
