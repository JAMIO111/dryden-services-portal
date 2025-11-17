import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase-client";
import { useUser } from "@/contexts/UserProvider";

export const useInsertMeeting = () => {
  const queryClient = useQueryClient();
  const { profile } = useUser();

  return useMutation({
    mutationFn: async (meetingData) => {
      const { data, error } = await supabase
        .from("Meetings")
        .insert({ ...meetingData, created_by: profile.id })
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
