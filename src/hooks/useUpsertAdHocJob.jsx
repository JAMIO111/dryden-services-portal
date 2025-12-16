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

      /* --------------------------------
         Generate next JOB reference
      -------------------------------- */
      const { data: lastJob, error: refError } = await supabase
        .from("AdHocJobs")
        .select("ad_hoc_job_id")
        .like("ad_hoc_job_id", `JOB-${yearSuffix}-%`)
        .order("ad_hoc_job_id", { ascending: false })
        .limit(1)
        .single();

      if (refError && refError.code !== "PGRST116") throw refError;

      let nextNumber = 1;
      if (lastJob?.ad_hoc_job_id) {
        const match = lastJob.ad_hoc_job_id.match(/JOB-\d{2}-(\d{3})/);
        if (match) nextNumber = parseInt(match[1], 10) + 1;
      }

      /* --------------------------------
         RECURRING JOBS
      -------------------------------- */
      if (recurrenceDates.length > 0) {
        const jobsToInsert = [];

        for (let i = 0; i < recurrenceDates.length; i++) {
          const date = recurrenceDates[i];
          const ad_hoc_job_id = `JOB-${yearSuffix}-${String(
            nextNumber + i
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

          /* ---- Laundry conflict rule ----
             Block ONLY if start OR end matches
          */
          if (type === "Laundry") {
            const { data: clash } = await supabase
              .from("AdHocJobs")
              .select("id")
              .eq("property_id", property_id)
              .eq("type", "Laundry")
              .or(
                `start_date.eq.${jobDates.start_date.toISOString()},end_date.eq.${jobDates.end_date.toISOString()}`
              )
              .limit(1)
              .single();

            if (clash) {
              showToast({
                type: "error",
                title: "Job Conflict",
                message: `A Laundry job already starts or ends on ${date.toLocaleDateString()} for this property. Skipping.`,
              });
              continue;
            }
          }

          /* ---- Non-laundry conflict ---- */
          if (type !== "Laundry") {
            const { data: clash } = await supabase
              .from("AdHocJobs")
              .select("id")
              .eq("property_id", property_id)
              .eq("type", type)
              .eq("single_date", jobDates.single_date)
              .limit(1)
              .single();

            if (clash) {
              showToast({
                type: "error",
                title: "Job Conflict",
                message: `A ${type} job already exists on ${date.toLocaleDateString()}. Skipping.`,
              });
              continue;
            }
          }

          jobsToInsert.push({
            ...adHocJobData,
            ...jobDates,
            ad_hoc_job_id,
            created_by: profile.id,
          });
        }

        if (!jobsToInsert.length) {
          throw new Error("No jobs could be inserted due to conflicts.");
        }

        const { data, error } = await supabase
          .from("AdHocJobs")
          .insert(jobsToInsert)
          .select();

        if (error) throw error;
        return data;
      }

      /* --------------------------------
         SINGLE JOB
      -------------------------------- */
      const ad_hoc_job_id = id
        ? adHocJobData.ad_hoc_job_id
        : `JOB-${yearSuffix}-${String(nextNumber).padStart(3, "0")}`;

      const jobDates =
        type === "Laundry"
          ? {
              start_date: start_date ? new Date(start_date) : single_date,
              end_date: end_date ? new Date(end_date) : single_date,
              single_date: null,
            }
          : {
              single_date,
              start_date: null,
              end_date: null,
            };

      /* ---- Laundry conflict ---- */
      if (type === "Laundry" && !id) {
        const { data: clash } = await supabase
          .from("AdHocJobs")
          .select("id")
          .eq("property_id", property_id)
          .eq("type", "Laundry")
          .or(
            `start_date.eq.${jobDates.start_date.toISOString()},end_date.eq.${jobDates.end_date.toISOString()}`
          )
          .limit(1)
          .single();

        if (clash) {
          showToast({
            type: "error",
            title: "Job Conflict",
            message: `A Laundry job already starts or ends on ${jobDates.start_date.toLocaleDateString()} for this property.`,
          });
          throw new Error("Laundry job boundary conflict.");
        }
      }

      /* ---- Non-laundry conflict ---- */
      if (type !== "Laundry" && !id) {
        const { data: clash } = await supabase
          .from("AdHocJobs")
          .select("id")
          .eq("property_id", property_id)
          .eq("type", type)
          .eq("single_date", jobDates.single_date)
          .limit(1)
          .single();

        if (clash) {
          showToast({
            type: "error",
            title: "Job Conflict",
            message: `A ${type} job already exists on ${jobDates.single_date.toLocaleDateString()}.`,
          });
          throw new Error("Job conflict detected.");
        }
      }

      /* ---- Insert / Update ---- */
      const { data, error } = id
        ? await supabase
            .from("AdHocJobs")
            .update({ ...adHocJobData, ad_hoc_job_id })
            .eq("id", id)
            .select()
            .single()
        : await supabase
            .from("AdHocJobs")
            .insert({
              ...adHocJobData,
              ad_hoc_job_id,
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
