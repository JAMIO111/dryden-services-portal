import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextInput from "../ui/TextInput";
import { IoText, IoCalendarOutline } from "react-icons/io5";
import { useToast } from "../../contexts/ToastProvider";
import { useQueryClient } from "@tanstack/react-query";
import CTAButton from "../CTAButton";
import { useCreateNotification } from "@/hooks/useCreateNotification";
import { useUpsertAbsence } from "@/hooks/useUpsertAbsence";
import { useEmployees } from "@/hooks/useEmployees";
import RHFComboBox from "../ui/RHFComboBox";
import DatePicker from "../ui/DatePicker";
import { AbsenceFormSchema } from "@/validationSchema";
import { useModal } from "@/contexts/ModalContext";

const defaultFormData = {
  employee_id: "",
  type: "",
  start_date: null,
  end_date: null,
  reason: "",
};

const AbsenceForm = ({ absence }) => {
  const { closeModal } = useModal();
  const { data: employees } = useEmployees();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const upsertAbsence = useUpsertAbsence();
  const { createNotification } = useCreateNotification();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(AbsenceFormSchema),
    mode: "all",
    defaultValues: defaultFormData,
  });

  // Load existing absence
  useEffect(() => {
    if (absence) {
      reset({
        employee_id: absence.employee_id || null,
        type: absence.type || null,
        start_date: absence.start_date
          ? new Date(absence.start_date)
          : new Date(),
        end_date: absence.end_date ? new Date(absence.end_date) : new Date(),
        reason: absence.reason || "",
      });
    }
  }, [absence, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = { ...data };
      if (absence?.id) payload.id = absence.id;

      const saved = await upsertAbsence.mutateAsync(payload);

      showToast({
        type: "success",
        title: "Absence Saved",
        message: absence
          ? "The absence has been updated."
          : "A new absence has been created.",
      });

      await createNotification({
        title: absence ? "Absence Updated" : "New Absence",
        body: absence
          ? "has updated an employee absence"
          : "has added a new employee absence",
        metaData: {
          url: `/Human-Resources/Absences/${saved.id}`,
          buttonText: "View Absence",
        },
        category: "Absences",
        type: absence ? "update" : "new",
      });

      reset(defaultFormData);
      closeModal?.();
    } catch (error) {
      showToast({
        type: "error",
        title: "Submission Failed",
        message:
          error?.message || "An error occurred while saving the absence.",
      });
    }
  };

  return (
    <div className="flex flex-1 gap-3 h-full flex-col">
      {/* Employee Select */}
      <Controller
        name="employee_id"
        control={control}
        render={({ field, fieldState }) => (
          <RHFComboBox
            label="Employee"
            placeholder="Select an employee"
            required
            {...field}
            error={fieldState.error}
            options={employees?.map((emp) => ({
              title: `${emp.first_name} ${emp.surname}`,
              id: emp.id,
              name: `${emp.first_name} ${emp.surname}`,
            }))}
          />
        )}
      />

      {/* Absence Type */}
      <Controller
        name="category"
        control={control}
        render={({ field, fieldState }) => (
          <RHFComboBox
            label="Absence Type"
            placeholder="Select absence type..."
            required
            {...field}
            error={fieldState.error}
            options={[
              {
                id: "Annual Leave",
                name: "Annual Leave",
              },
              { id: "Sickness", name: "Sickness" },
              {
                id: "Maternity",
                name: "Maternity",
              },
              {
                id: "Paternity",
                name: "Paternity",
              },
              {
                id: "Unpaid Leave",
                name: "Unpaid Leave",
              },
              {
                id: "Bereavement",
                name: "Bereavement",
              },
              {
                id: "Jury Duty",
                name: "Jury Duty",
              },
              {
                id: "Medical Leave",
                name: "Medical Leave",
              },
              { id: "Other", name: "Other" },
            ]}
          />
        )}
      />

      {/* Start Date */}
      <Controller
        name="start_date"
        control={control}
        render={({ field, fieldState }) => (
          <DatePicker
            required
            label="Start Date"
            type="date"
            placeholder="Select start date..."
            currentDate={field.value}
            {...field}
            icon={IoCalendarOutline}
            error={fieldState.error}
          />
        )}
      />

      {/* End Date */}
      <Controller
        name="end_date"
        control={control}
        render={({ field, fieldState }) => (
          <DatePicker
            required
            label="End Date"
            placeholder="Select end date..."
            type="date"
            currentDate={field.value}
            {...field}
            icon={IoCalendarOutline}
            error={fieldState.error}
          />
        )}
      />

      {/* Reason */}
      <Controller
        name="reason"
        control={control}
        render={({ field, fieldState }) => (
          <TextInput
            label="Reason / Notes"
            placeholder="Optional explanation"
            {...field}
            icon={IoText}
            error={fieldState.error}
          />
        )}
      />

      {/* Buttons */}
      <div className="flex items-end mt-5 gap-3 pb-5 justify-end">
        <CTAButton
          type="cancel"
          text="Revert Changes"
          disabled={isSubmitting || !isDirty}
          callbackFn={() => reset()}
        />
        <CTAButton
          type="success"
          text={absence ? "Update Absence" : "Save Absence"}
          disabled={!isValid || isSubmitting || !isDirty}
          callbackFn={handleSubmit(onSubmit)}
        />
      </div>
    </div>
  );
};

export default AbsenceForm;
