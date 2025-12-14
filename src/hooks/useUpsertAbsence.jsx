import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase-client";

export const useUpsertAbsence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      let response;

      if (payload.id) {
        // UPDATE existing absence
        response = await supabase
          .from("Absences")
          .update({
            employee_id: payload.employee_id,
            category: payload.category,
            start_date: payload.start_date,
            end_date: payload.end_date,
            reason: payload.reason,
          })
          .eq("id", payload.id)
          .select()
          .single();
      } else {
        // CREATE new absence
        response = await supabase
          .from("Absences")
          .insert([
            {
              employee_id: payload.employee_id,
              category: payload.category,
              start_date: payload.start_date,
              end_date: payload.end_date,
              reason: payload.reason,
              status: "Approved",
            },
          ])
          .select()
          .single();
      }

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Absences"] });
    },
  });
};
