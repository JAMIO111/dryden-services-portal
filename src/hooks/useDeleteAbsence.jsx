// hooks/useDeleteAbsence.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "@/supabase-client";

export const useDeleteAbsence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("Absences").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Absences"] });
    },
  });
};
