import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase-client";

export const useInsertMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meetingData) => {
      const { data, error } = await supabase
        .from("Meetings")
        .insert(meetingData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    onSuccess: (result) => {
      // result contains the inserted meeting
      queryClient.invalidateQueries(["Lead", result.lead_id]);
    },
  });
};
