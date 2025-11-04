import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase-client";

export const useInsertCorrespondence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (correspondenceData) => {
      const { data, error } = await supabase
        .from("Correspondence")
        .insert(correspondenceData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    onSuccess: (result) => {
      // result contains the inserted correspondence
      queryClient.invalidateQueries(["Lead", result.lead_id]);
    },
  });
};
