import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase-client";

export const useUpsertEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeData) => {
      let employeeId = employeeData.id;
      let result;

      if (employeeId) {
        // Update existing owner
        const { data, error } = await supabase
          .from("Employees")
          .update(employeeData)
          .eq("id", employeeId)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new owner
        const { data, error } = await supabase
          .from("Employees")
          .insert(employeeData)
          .select()
          .single();

        if (error) throw error;
        employeeId = data.id;
        result = data;
      }

      return result; // return so onSuccess can access it
    },

    onSuccess: (result) => {
      // result contains the inserted or updated employee
      queryClient.invalidateQueries(["Employees"]);
      queryClient.invalidateQueries(["Employee", result.id]);
    },
  });
};
