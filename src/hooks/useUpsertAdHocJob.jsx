import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase-client";
import { useUser } from "@/contexts/UserProvider";

export const useUpsertAdHocJob = () => {
  const queryClient = useQueryClient();
  const { profile } = useUser();

  return useMutation({
    mutationFn: async (adHocJobData, recurrenceDates = []) => {
      const { property_id, id, type, start_date, end_date } = adHocJobData;

      if (!property_id) throw new Error("Property is required.");

      const currentYear = new Date().getFullYear();
      const yearSuffix = String(currentYear).slice(-2);

      // Get last job to generate next sequence
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

      // === Recurring jobs batch insert ===
      if (recurrenceDates.length > 0) {
        const jobsToInsert = recurrenceDates.map((date, idx) => {
          const ad_hoc_job_id = `JOB-${yearSuffix}-${String(
            nextNumber + idx
          ).padStart(3, "0")}`;

          // For laundry jobs, use start_date/end_date from original job
          // For other types, use single_date
          const jobDates =
            type === "Laundry"
              ? {
                  start_date: start_date ? new Date(start_date) : date,
                  end_date: end_date ? new Date(end_date) : date,
                  single_date: null,
                }
              : {
                  single_date: date,
                  start_date: null,
                  end_date: null,
                };

          return {
            ...adHocJobData,
            ...jobDates,
            ad_hoc_job_id,
            created_by: profile.id,
          };
        });

        const { data, error } = await supabase
          .from("AdHocJobs")
          .insert(jobsToInsert)
          .select();

        if (error) throw error;
        return data; // array of inserted jobs
      }

      // === Single job upsert ===
      let ad_hoc_job_id = adHocJobData.ad_hoc_job_id;
      if (!id) {
        ad_hoc_job_id = `JOB-${yearSuffix}-${String(nextNumber).padStart(
          3,
          "0"
        )}`;
      }

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
      const ids = Array.isArray(data) ? data.map((job) => job.id) : [data?.id];
      queryClient.invalidateQueries(["AdHocJobs"]);
      ids.forEach((id) => queryClient.invalidateQueries(["AdHocJob", id]));
    },
  });
};
