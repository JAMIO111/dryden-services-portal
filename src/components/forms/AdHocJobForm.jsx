import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdHocJobFormSchema } from "../../validationSchema";
import { useToast } from "../../contexts/ToastProvider";
import { useQueryClient } from "@tanstack/react-query";
import CTAButton from "../CTAButton";
import { useUpsertAdHocJob } from "@/hooks/useUpsertAdHocJob";
import { BsTruck, BsHouse } from "react-icons/bs";
import RHFComboBox from "../ui/RHFComboBox";
import { useProperties } from "@/hooks/useProperties";
import SlidingSelector from "../ui/SlidingSelectorGeneric";
import DatePicker from "../ui/DatePicker";
import RHFTextAreaInput from "../ui/RHFTextArea";
import ToggleButton from "../ui/ToggleButton";
import RecurrenceForm from "./RecurrenceForm";
import { useModal } from "@/contexts/ModalContext";
import { FaRegNoteSticky } from "react-icons/fa6";
import { useCreateNotification } from "@/hooks/useCreateNotification";

const defaultFormData = {
  type: "Clean",
  property_id: null,
  single_date: null,
  start_date: null,
  end_date: null,
  transport: null,
  notes: "",
};

const AdHocJobForm = ({ adHocJob, navigate }) => {
  const { createNotification } = useCreateNotification();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const upsertAdHocJob = useUpsertAdHocJob();
  const { data: properties } = useProperties();
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceDates, setRecurrenceDates] = useState([]);
  const { closeModal } = useModal();

  console.log("AdHocJobForm - adHocJob:", adHocJob);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
    setError,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(AdHocJobFormSchema),
    mode: "all",
    defaultValues: defaultFormData,
    delayError: 250,
  });

  // ---------- LOAD EXISTING LEAD INTO FORM ----------
  useEffect(() => {
    if (adHocJob) {
      reset({
        ...defaultFormData,
        ...adHocJob,
        single_date: adHocJob.single_date
          ? new Date(adHocJob.single_date)
          : null,
        start_date: adHocJob.start_date ? new Date(adHocJob.start_date) : null,
        end_date: adHocJob.end_date ? new Date(adHocJob.end_date) : null,
      });
    }
  }, [adHocJob, reset]);

  const watchType = watch("type");

  useEffect(() => {
    // Skip this effect on initial load when editing
    if (adHocJob) return;

    if (watchType === "Laundry") {
      setValue("single_date", null, { shouldValidate: true });
    } else {
      setValue("transport", null, { shouldValidate: true });
      setValue("start_date", null, { shouldValidate: true });
      setValue("end_date", null, { shouldValidate: true });
    }
  }, [watchType, setValue, adHocJob]);

  const onSubmit = async (data) => {
    if (isRecurring && recurrenceDates.length === 0) {
      showToast({
        type: "error",
        title: "No Recurrence Dates",
        message:
          "Please preview and confirm recurrence dates before submitting.",
      });
      return;
    }
    try {
      // Prepare payload: include ID only if editing
      const payload = {
        ...data,
        ...(adHocJob?.id ? { id: adHocJob.id } : {}),
      };

      // 1. Capture the result (important!)
      const result = await upsertAdHocJob.mutateAsync(payload, recurrenceDates);

      // Use the correct ID: new or existing
      const adHocJobId = result?.ad_hoc_job_id || adHocJob?.id;

      reset(defaultFormData);

      showToast({
        type: "success",
        title: "Job Saved",
        message: adHocJob
          ? `The ${
              data.type === "Clean" ? "cleaning" : data.type
            } job has been updated.`
          : `A ${
              data.type === "Clean" ? "cleaning" : data.type
            } job has been successfully created.`,
      });

      closeModal();

      // 2. Use the resolved ID in the notification
      await createNotification({
        title: adHocJob ? "Ad-Hoc Job Updated" : "Ad-Hoc Job Created",
        body: adHocJob
          ? "has made ammendments to a job:"
          : "has entered a new job:",
        docRef: adHocJobId,
        category: "Ad-Hoc Jobs",
        type: !!adHocJobId ? "update" : "new",
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Submission Failed",
        message: error?.message || "An error occurred while saving the job.",
      });
    }
  };

  const filteredProperties = properties?.filter((prop) => {
    return (
      prop.is_active === true &&
      Array.isArray(prop.service_type) &&
      prop.service_type.includes(watchType.toLowerCase().replace(" ", "_"))
    );
  });

  return (
    <div className="flex h-full">
      {/* LEFT FORM */}
      <div className="flex flex-col flex-1">
        <div className="mb-4 pl-2 pr-6">
          <div className={adHocJob ? "opacity-50 pointer-events-none" : ""}>
            <SlidingSelector
              label="Job Type"
              options={["Clean", "Hot Tub", "Laundry"]}
              value={watchType}
              onChange={(value) => {
                if (!adHocJob) {
                  setValue("type", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }
              }}
            />
          </div>
        </div>

        <div className="flex-1 h-full overflow-y-auto flex flex-col ">
          <div className="flex-1 flex flex-col">
            {/* Property */}
            <div className="mb-3 px-2">
              <Controller
                name="property_id"
                control={control}
                render={({ field, fieldState }) => (
                  <RHFComboBox
                    error={fieldState.error}
                    {...field}
                    name="property_id"
                    control={control}
                    label="Property"
                    options={filteredProperties || []}
                    placeholder="Select a property..."
                    required
                    icon={BsHouse}
                  />
                )}
              />
            </div>

            {/* Laundry / Dates */}
            {watchType === "Laundry" ? (
              <div className="flex flex-col gap-3 px-2 mb-3">
                <Controller
                  name="start_date"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      required={true}
                      label="Delivery Start"
                      currentDate={value}
                      onChange={onChange}
                      displayMode="date"
                    />
                  )}
                />
                <Controller
                  name="end_date"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      required={true}
                      label="Delivery End"
                      currentDate={value}
                      onChange={onChange}
                      displayMode="date"
                    />
                  )}
                />
              </div>
            ) : (
              <div className="mb-3 px-2">
                <Controller
                  name="single_date"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      required={true}
                      label="Job Date"
                      currentDate={value}
                      onChange={onChange}
                      displayMode="date"
                    />
                  )}
                />
              </div>
            )}

            {/* Transport */}
            {watchType === "Laundry" && (
              <div className="mb-3 px-2">
                <Controller
                  name="transport"
                  control={control}
                  render={({ field, fieldState }) => (
                    <RHFComboBox
                      error={fieldState.error}
                      {...field}
                      name="transport"
                      control={control}
                      label="Transport"
                      required
                      options={[
                        { id: "Dryden Services", name: "Dryden Services" },
                        { id: "Client", name: "Client Provided" },
                      ]}
                      placeholder="Select a transport type..."
                      icon={BsTruck}
                    />
                  )}
                />
              </div>
            )}

            {/* Notes */}
            <div className="mb-3 px-2">
              <Controller
                name="notes"
                control={control}
                render={({ field, fieldState }) => (
                  <RHFTextAreaInput
                    label="Notes"
                    placeholder="Enter any job details here..."
                    maxLength={300}
                    {...field}
                    icon={FaRegNoteSticky}
                    error={fieldState.error}
                  />
                )}
              />
            </div>
          </div>
        </div>
        {/* Buttons */}
        <div className="flex flex-wrap items-end mt-3 gap-3 justify-end">
          <div className="w-48 mr-auto">
            <ToggleButton
              label="Reccurring Job"
              checked={isRecurring}
              onChange={() => setIsRecurring(!isRecurring)}
              falseLabel="Single Job"
              trueLabel="Recurring Job"
            />
          </div>
          <CTAButton
            type="cancel"
            text="Revert Changes"
            disabled={isSubmitting || !isDirty}
            callbackFn={() => reset()}
          />
          <CTAButton
            type="success"
            text={adHocJob ? "Update Job" : "Save Job"}
            disabled={!isValid || isSubmitting || !isDirty}
            callbackFn={handleSubmit(onSubmit)}
          />
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div
        className="transition-all duration-300"
        style={{ width: isRecurring ? "550px" : "0px" }}>
        {isRecurring && (
          <div className="opacity-100 pl-8 h-full transition-opacity duration-300">
            <div className="flex flex-col gap-3 bg-secondary-bg shadow-s p-4 rounded-xl h-full min-h-[400px]">
              <h2 className="text-primary-text whitespace-nowrap font-semibold">
                Recurring Job Details
              </h2>
              <div className="overflow-y-auto min-h-0">
                <RecurrenceForm
                  startDate={watch("single_date")}
                  onRecurrencesChange={(dates) => setRecurrenceDates(dates)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdHocJobForm;
