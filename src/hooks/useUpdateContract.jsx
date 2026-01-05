import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase-client";

export const useUpdateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId, currentPeriodId, updates = {} }) => {
      const now = new Date().toISOString();

      // 1️⃣ terminate current contract
      const { error: terminateError } = await supabase
        .from("EmployeePeriod")
        .update({ terminated_at: now })
        .eq("id", currentPeriodId)
        .is("terminated_at", null);

      if (terminateError) throw terminateError;

      // 2️⃣ fetch old contract details
      const { data: previous, error: fetchError } = await supabase
        .from("EmployeePeriod")
        .select("job_title, contract_type, hourly_rate")
        .eq("id", currentPeriodId)
        .single();

      if (fetchError) throw fetchError;

      // 3️⃣ create new contract
      const { error: insertError } = await supabase
        .from("EmployeePeriod")
        .insert({
          employee_id: employeeId,
          job_title: updates.job_title ?? previous.job_title,
          contract_type: updates.contract_type ?? previous.contract_type,
          hourly_rate: updates.hourly_rate ?? previous.hourly_rate,
        });

      if (insertError) throw insertError;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["Employees", "active"]);
      queryClient.invalidateQueries(["EmployeePeriod"]);
    },
  });
};
