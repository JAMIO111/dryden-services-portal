import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase-client";
import { useUser } from "@/contexts/UserProvider";

export const useUpsertAdHocJob = () => {
  const queryClient = useQueryClient();
  const { profile } = useUser();

  return useMutation({
    mutationFn: async (adHocJobData) => {
      const { property_id, arrival_date, departure_date, id } = adHocJobData;

      if (!property_id) {
        throw new Error("Property is required.");
      }

      // === Generate sequential ad_hoc_job_id on INSERT only ===
      let ad_hoc_job_id = adHocJobData.ad_hoc_job_id;
      if (!id) {
        const currentYear = new Date().getFullYear();
        const yearSuffix = String(currentYear).slice(-2);

        const { data: lastAdHocJob, error: refError } = await supabase
          .from("AdHocJobs")
          .select("ad_hoc_job_id")
          .like("ad_hoc_job_id", `JOB-${yearSuffix}-%`)
          .order("ad_hoc_job_id", { ascending: false })
          .limit(1)
          .single();

        if (refError && refError.code !== "PGRST116") throw refError;

        let nextNumber = 1;
        if (lastAdHocJob?.ad_hoc_job_id) {
          const match = lastAdHocJob.ad_hoc_job_id.match(/JOB-\d{2}-(\d{3})/);
          if (match) nextNumber = parseInt(match[1], 10) + 1;
        }

        const nextNumberStr = String(nextNumber).padStart(3, "0");
        ad_hoc_job_id = `JOB-${yearSuffix}-${nextNumberStr}`;
      }

      // === Upsert ===
      const { data, error } = id
        ? await supabase
            .from("AdHocJobs")
            .update({ ...adHocJobData, ad_hoc_job_id })
            .eq("id", id)
            .select()
            .single()
        : await supabase
            .from("AdHocJobs")
            .insert({ ...adHocJobData, ad_hoc_job_id, created_by: profile.id })
            .select()
            .single();

      if (error) throw error;
      return data;
    },

    onSuccess: (data) => {
      const adHocJobId = data?.id;
      queryClient.invalidateQueries(["AdHocJobs"]);
      if (adHocJobId) queryClient.invalidateQueries(["AdHocJob", adHocJobId]);
    },
  });
};
