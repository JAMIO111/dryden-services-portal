import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase-client";
import { useUser } from "@/contexts/UserProvider";
import { useToast } from "@/contexts/ToastProvider";

export const useUpsertAdHocJob = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useUser();

  return useMutation({
    mutationFn: async ({ adHocJobData, recurrenceDates = [] }) => {
      const { property_id, id, type, start_date, end_date, single_date } =
        adHocJobData;
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

      // --- Recurring jobs batch insert ---
      if (recurrenceDates.length > 0) {
        const jobsToInsert = [];

        for (let idx = 0; idx < recurrenceDates.length; idx++) {
          const date = recurrenceDates[idx];
          const ad_hoc_job_id = `JOB-${yearSuffix}-${String(
            nextNumber + idx
          ).padStart(3, "0")}`;

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

          // Check for clashes (type + property match)
          const { data: existingJob } = await supabase
            .from("AdHocJobs")
            .select("id")
            .eq("property_id", property_id)
            .eq("type", type)
            .or(
              type === "Laundry"
                ? `and(start_date.lte.${jobDates.end_date.toISOString()},end_date.gte.${jobDates.start_date.toISOString()})`
                : `single_date.eq.${jobDates.single_date.toISOString()}`
            )
            .limit(1)
            .single();

          if (existingJob) {
            showToast({
              type: "error",
              title: "Job Conflict",
              message: `A ${type} job already exists for this property on ${date.toLocaleDateString()}. Skipping this recurrence.`,
            });
            continue;
          }

          jobsToInsert.push({
            ...adHocJobData,
            ...jobDates,
            ad_hoc_job_id,
            created_by: profile.id,
          });
        }

        if (jobsToInsert.length === 0)
          throw new Error("No jobs could be inserted due to conflicts.");

        const { data, error } = await supabase
          .from("AdHocJobs")
          .insert(jobsToInsert)
          .select();

        if (error) throw error;
        return data;
      }

      // --- Single job upsert ---
      const adHocJobId = id
        ? adHocJobData.ad_hoc_job_id
        : `JOB-${yearSuffix}-${String(nextNumber).padStart(3, "0")}`;

      // Check for clashes for the single job
      const jobDates =
        type === "Laundry"
          ? {
              start_date: start_date ? new Date(start_date) : single_date,
              end_date: end_date ? new Date(end_date) : single_date,
              single_date: null,
            }
          : {
              single_date: single_date,
              start_date: null,
              end_date: null,
            };

      const { data: existingSingle } = await supabase
        .from("AdHocJobs")
        .select("id")
        .eq("property_id", property_id)
        .eq("type", type)
        .or(
          type === "Laundry"
            ? `and(start_date.lte.${jobDates.end_date.toISOString()},end_date.gte.${jobDates.start_date.toISOString()})`
            : `single_date.eq.${jobDates.single_date.toISOString()}`
        )
        .limit(1)
        .single();

      if (existingSingle && !id) {
        showToast({
          type: "error",
          title: "Job Conflict",
          message: `A ${type} job already exists for this property on ${
            type === "Laundry"
              ? `${jobDates.start_date.toLocaleDateString()} - ${jobDates.end_date.toLocaleDateString()}`
              : jobDates.single_date.toLocaleDateString()
          }.`,
        });
        throw new Error("Job conflict detected.");
      }

      // Insert or update single job
      const { data, error } = id
        ? await supabase
            .from("AdHocJobs")
            .update({ ...adHocJobData, ad_hoc_job_id: adHocJobId })
            .eq("id", id)
            .select()
            .single()
        : await supabase
            .from("AdHocJobs")
            .insert({
              ...adHocJobData,
              ad_hoc_job_id: adHocJobId,
              created_by: profile.id,
            })
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
