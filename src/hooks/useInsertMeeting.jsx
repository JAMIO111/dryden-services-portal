import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase-client";
import { useUser } from "@/contexts/UserProvider";

export const useInsertMeeting = () => {
  const queryClient = useQueryClient();
  const { profile } = useUser();

  return useMutation({
    mutationFn: async (meetingData) => {
      const { start_date, end_date, location } = meetingData;

      // Convert to ISO strings
      const startISO = new Date(start_date).toISOString();
      const endISO = new Date(end_date).toISOString();

      // Check for overlapping meetings
      const { data: overlapping, error: overlapError } = await supabase
        .from("Meetings")
        .select("*")
        .eq("location", location)
        .or(`and(start_date.lte.${endISO},end_date.gte.${startISO})`)
        .limit(1);

      if (overlapError) throw overlapError;
      if (overlapping && overlapping.length > 0) {
        throw new Error(
          "This meeting overlaps with another meeting in the same location."
        );
      }

      // Insert new meeting
      const { data, error } = await supabase
        .from("Meetings")
        .insert({
          ...meetingData,
          start_date: startISO,
          end_date: endISO,
          created_by: profile.id,
        })
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
