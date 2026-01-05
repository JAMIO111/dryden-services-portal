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
import { useActiveEmployees } from "@/hooks/useEmployees";
import RHFComboBox from "../ui/RHFComboBox";
import DatePicker from "../ui/DatePicker";
import { AbsenceFormSchema } from "@/validationSchema";
import { useModal } from "@/contexts/ModalContext";
import { IoTrashOutline } from "react-icons/io5";
import { useDeleteAbsence } from "@/hooks/useDeleteAbsence";
import { useConfirm } from "@/contexts/ConfirmationModalProvider";

const defaultFormData = {
  employee_id: "",
  category: null,
  start_date: null,
  end_date: null,
  reason: "",
};

const AbsenceForm = ({ absence }) => {
  const { closeModal } = useModal();
  const confirm = useConfirm();
  const { data: employees } = useActiveEmployees();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const upsertAbsence = useUpsertAbsence();
  const deleteAbsence = useDeleteAbsence();
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
        category: absence.category || null,
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

      console.log("Absence payload:", payload);

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
        category: "Absences",
        type: absence ? "update" : "new",
        docRef: `${
          employees.find((emp) => emp.id === payload.employee_id)?.first_name
        } ${
          employees.find((emp) => emp.id === payload.employee_id)?.surname
        } - ${payload.category} - ${new Date(
          payload.start_date
        ).toLocaleDateString("en-GB", {
          weekday: "short",
          year: "2-digit",
          month: "short",
          day: "numeric",
        })} to ${new Date(payload.end_date).toLocaleDateString("en-GB", {
          weekday: "short",
          year: "2-digit",
          month: "short",
          day: "numeric",
        })}`,
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

  const handleDelete = async () => {
    if (!absence?.id) return;

    const ok = await confirm({
      title: "Are you sure you want to delete this absence?",
      message: "This action can't be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "warning",
    });
    if (ok) {
      try {
        await deleteAbsence.mutateAsync(absence.id);

        showToast({
          type: "success",
          title: "Absence Deleted",
          message: "The absence record has been removed.",
        });

        closeModal?.();
        await createNotification({
          title: "Absence Deleted",
          body: "has deleted an employee absence",
          category: "Absences",
          type: "delete",
          docRef: `${
            employees.find((emp) => emp.id === absence.employee_id)?.first_name
          } ${
            employees.find((emp) => emp.id === absence.employee_id)?.surname
          } - ${absence.category} - ${new Date(
            absence.start_date
          ).toLocaleDateString("en-GB", {
            weekday: "short",
            year: "2-digit",
            month: "short",
            day: "numeric",
          })} to ${new Date(absence.end_date).toLocaleDateString("en-GB", {
            weekday: "short",
            year: "2-digit",
            month: "short",
            day: "numeric",
          })}`,
        });
      } catch (error) {
        showToast({
          type: "error",
          title: "Delete Failed",
          message:
            error?.message || "An error occurred while deleting the absence.",
        });
      }
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
        <div className="flex flex-1">
          <CTAButton
            type="cancel"
            text="Delete Absence"
            disabled={!absence || isSubmitting}
            callbackFn={handleDelete}
            icon={IoTrashOutline}
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
          text={absence ? "Update Absence" : "Save Absence"}
          disabled={!isValid || isSubmitting || !isDirty}
          callbackFn={handleSubmit(onSubmit)}
        />
      </div>
    </div>
  );
};

export default AbsenceForm;
