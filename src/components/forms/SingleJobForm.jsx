import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LeadFormSchema } from "../../validationSchema";
import TextInput from "../ui/TextInput";
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
import TextAreaInput from "../ui/TextArea";
import ToggleButton from "../ui/ToggleButton";

const defaultFormData = {
  type: "Clean",
  property_id: null,
  single_date: null,
  start_date: null,
  end_date: null,
  transport: "",
  notes: "",
};

const SingleJobForm = ({ singleJob, navigate }) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const upsertSingleJob = useUpsertSingleJob();
  const { data: properties } = useProperties();
  const [isRecurring, setIsRecurring] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(LeadFormSchema),
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

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
      };

      // include ID if editing
      if (singleJob?.id) payload.id = singleJob.id;

      const saved = await upsertSingleJob.mutateAsync(payload);

      reset(defaultFormData);

      showToast({
        type: "success",
        title: "Job Saved",
        message: singleJob
          ? `The ${type === "clean" ? "cleaning" : type} job has been updated.`
          : `A ${
              type === "clean" ? "cleaning" : type
            } job has been successfully created.`,
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Submission Failed",
        message: error?.message || "An error occurred while saving the lead.",
      });
    }
  };

  const selectedType = watch("type");

  return (
    <div className="flex flex-1 h-full flex-col">
      <div className="mb-4">
        <Controller
          name="type"
          control={control}
          render={({ field, fieldState }) => (
            <SlidingSelector
              label="Job Type"
              options={["Clean", "Hot Tub", "Laundry"]}
              value={field.value}
              onChange={(value) => field.onChange(value)}
            />
          )}
        />
      </div>
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
              required={true}
              icon={BsHouse}
            />
          )}
        />
      </div>
      {selectedType === "Laundry" && (
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
                options={[
                  { value: "Dryden Services", name: "Dryden Services" },
                  { value: "Client Provided", name: "Client Provided" },
                ]}
                placeholder="Select a transport type..."
                required={true}
                icon={BsTruck}
              />
            )}
          />
        </div>
      )}
      <div className="mb-3">
        {selectedType !== "Laundry" ? (
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
        ) : (
          <div className="flex flex-col gap-3">
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
        )}
      </div>
      <Controller
        name="notes"
        control={control}
        render={({ field, fieldState }) => (
          <TextAreaInput
            required={true}
            label="Notes"
            placeholder="Enter any job details here..."
            {...field}
            icon={IoText}
            error={fieldState.error}
          />
        )}
      />
      <div className="flex items-end mt-5 gap-3 pb-5 justify-end">
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
          callbackFn={() => {
            reset();
          }}
        />
        <CTAButton
          type="success"
          text={singleJob ? "Update Job" : "Save Job"}
          disabled={!isValid || isSubmitting || !isDirty}
          callbackFn={handleSubmit(onSubmit)}
        />
      </div>
    </div>
  );
};

export default SingleJobForm;
