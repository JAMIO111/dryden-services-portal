import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SingleJobFormSchema } from "../../validationSchema";
import { IoText } from "react-icons/io5";
import { useToast } from "../../contexts/ToastProvider";
import { useQueryClient } from "@tanstack/react-query";
import CTAButton from "../CTAButton";
import { useUpsertSingleJob } from "@/hooks/useUpsertSingleJob";
import { BsTruck, BsHouse } from "react-icons/bs";
import RHFComboBox from "../ui/RHFComboBox";
import { useProperties } from "@/hooks/useProperties";
import SlidingSelector from "../ui/SlidingSelectorGeneric";
import DatePicker from "../ui/DatePicker";
import RHFTextAreaInput from "../ui/RHFTextArea";
import ToggleButton from "../ui/ToggleButton";
import RecurrenceForm from "./RecurrenceForm";

const defaultFormData = {
  type: "Clean",
  property_id: null,
  single_date: null,
  start_date: null,
  end_date: null,
  transport: null,
  notes: "",
};

const SingleJobForm = ({ singleJob, navigate }) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const upsertSingleJob = useUpsertSingleJob();
  const { data: properties } = useProperties();
  const [jobType, setJobType] = useState("Clean");
  const [isRecurring, setIsRecurring] = useState(false);

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
    resolver: zodResolver(SingleJobFormSchema),
    mode: "all",
    defaultValues: defaultFormData,
    delayError: 250,
  });

  // ---------- LOAD EXISTING LEAD INTO FORM ----------
  useEffect(() => {
    if (singleJob) {
      reset({
        ...defaultFormData,
        ...singleJob,
      });
    }
  }, [singleJob, reset]);

  useEffect(() => {
    setValue("type", jobType, { shouldValidate: true });
  }, [jobType, setValue]);

  const watchType = watch("type");

  useEffect(() => {
    if (watchType === "Laundry") {
      setValue("single_date", null, { shouldValidate: true });
    } else {
      setValue("transport", null, { shouldValidate: true });
      setValue("start_date", null, { shouldValidate: true });
      setValue("end_date", null, { shouldValidate: true });
    }
  }, [watchType, setValue]);

  const onSubmit = async (data) => {
    try {
      const payload = { ...data };
      if (singleJob?.id) payload.id = singleJob.id;

      await upsertSingleJob.mutateAsync(payload);

      reset(defaultFormData);

      showToast({
        type: "success",
        title: "Job Saved",
        message: singleJob
          ? `The ${
              data.type === "Clean" ? "cleaning" : data.type
            } job has been updated.`
          : `A ${
              data.type === "Clean" ? "cleaning" : data.type
            } job has been successfully created.`,
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Submission Failed",
        message: error?.message || "An error occurred while saving the job.",
      });
    }
  };

  return (
    <div className="flex h-full">
      {/* LEFT FORM */}
      <div className="flex flex-col flex-1">
        <div className="mb-4">
          <SlidingSelector
            label="Job Type"
            options={["Clean", "Hot Tub", "Laundry"]}
            value={jobType}
            onChange={(value) => setJobType(value)}
          />
        </div>
        <div className="flex-1 h-full overflow-y-auto flex pr-5 flex-col ">
          <div className="flex-1 flex flex-col">
            {/* Property */}
            <div className="mb-3">
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
                    options={properties || []}
                    placeholder="Select a property..."
                    required
                    icon={BsHouse}
                  />
                )}
              />
            </div>

            {/* Laundry / Dates */}
            {jobType === "Laundry" ? (
              <div className="flex flex-col gap-3 mb-3">
                <Controller
                  name="start_date"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
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
                      label="Delivery End"
                      currentDate={value}
                      onChange={onChange}
                      displayMode="date"
                    />
                  )}
                />
              </div>
            ) : (
              <div className="mb-3">
                <Controller
                  name="single_date"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
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
            {jobType === "Laundry" && (
              <div className="mb-3">
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
                        { id: "Client Provided", name: "Client Provided" },
                      ]}
                      placeholder="Select a transport type..."
                      icon={BsTruck}
                    />
                  )}
                />
              </div>
            )}

            {/* Notes */}
            <div className="mb-3">
              <Controller
                name="notes"
                control={control}
                render={({ field, fieldState }) => (
                  <RHFTextAreaInput
                    label="Notes"
                    placeholder="Enter any job details here..."
                    maxLength={300}
                    {...field}
                    icon={IoText}
                    error={fieldState.error}
                  />
                )}
              />
            </div>
          </div>
        </div>
        {/* Buttons */}
        <div className="flex items-end mt-3 gap-3 justify-end">
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
            text={singleJob ? "Update Job" : "Save Job"}
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
                <RecurrenceForm />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleJobForm;
