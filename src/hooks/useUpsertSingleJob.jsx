import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase-client";
import { useUser } from "@/contexts/UserProvider";

export const useUpsertSingleJob = () => {
  const queryClient = useQueryClient();
  const { profile } = useUser();

  return useMutation({
    mutationFn: async (singleJobData) => {
      const { property_id, arrival_date, departure_date, id } = singleJobData;

      if (!property_id) {
        throw new Error("Property is required.");
      }

      // === Generate sequential single_job_id on INSERT only ===
      let single_job_id = singleJobData.single_job_id;
      if (!id) {
        const currentYear = new Date().getFullYear();
        const yearSuffix = String(currentYear).slice(-2);

        const { data: lastSingleJob, error: refError } = await supabase
          .from("SingleJobs")
          .select("single_job_id")
          .like("single_job_id", `JOB-${yearSuffix}-%`)
          .order("single_job_id", { ascending: false })
          .limit(1)
          .single();

        if (refError && refError.code !== "PGRST116") throw refError;

        let nextNumber = 1;
        if (lastSingleJob?.single_job_id) {
          const match = lastSingleJob.single_job_id.match(/JOB-\d{2}-(\d{3})/);
          if (match) nextNumber = parseInt(match[1], 10) + 1;
        }

        const nextNumberStr = String(nextNumber).padStart(3, "0");
        single_job_id = `JOB-${yearSuffix}-${nextNumberStr}`;
      }

      // === Upsert ===
      const { data, error } = id
        ? await supabase
            .from("SingleJobs")
            .update({ ...singleJobData, single_job_id })
            .eq("id", id)
            .select()
            .single()
        : await supabase
            .from("SingleJobs")
            .insert({ ...singleJobData, single_job_id, created_by: profile.id })
            .select()
            .single();

      if (error) throw error;
      return data;
    },

    onSuccess: (data) => {
      const singleJobId = data?.id;
      queryClient.invalidateQueries(["SingleJobs"]);
      if (singleJobId)
        queryClient.invalidateQueries(["SingleJob", singleJobId]);
    },
  });
};
