import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase-client";

export const useUpsertLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadData) => {
      const { id, ...payload } = leadData;

      if (id) {
        // Update
        const { data, error } = await supabase
          .from("Leads")
          .update(payload)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Insert
      const { data, error } = await supabase
        .from("Leads")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    onSuccess: (lead) => {
      // Keep cache consistent
      queryClient.invalidateQueries(["Leads"]);
      queryClient.invalidateQueries(["Lead", lead.id]);
    },
  });
};
