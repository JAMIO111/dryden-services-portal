import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MeetingFormSchema } from "../../validationSchema";
import TextInput from "../ui/TextInput";
import { IoText } from "react-icons/io5";
import { useToast } from "../../contexts/ToastProvider";
import { useQueryClient } from "@tanstack/react-query";
import CTAButton from "../CTAButton";
import { useInsertMeeting } from "@/hooks/useInsertMeeting";
import DatePicker from "../ui/DatePicker";
import { IoLocationOutline } from "react-icons/io5";
import { useCreateNotification } from "@/hooks/useCreateNotification";
import { useUser } from "@/contexts/UserProvider";

const defaultFormData = {
  title: "",
  location: "",
  date: new Date(),
  start_time: "08:00:00",
  end_time: "09:00:00",
};

const MeetingForm = ({ leadId, leadTitle, closeForm }) => {
  const { createNotification } = useCreateNotification();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const insertMeeting = useInsertMeeting();
  const { profile } = useUser();

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
    resolver: zodResolver(MeetingFormSchema),
    mode: "all",
    defaultValues: defaultFormData,
    delayError: 250,
  });
  console.log("Form Values:", watch());
  console.log("Is Dirty:", isDirty);
  console.log("Is Valid:", isValid);

  return (
    <div className="flex flex-1 h-full flex-col">
      <Controller
        name="title"
        control={control}
        render={({ field, fieldState }) => (
          <TextInput
            required={true}
            label="Title"
            placeholder="e.g Discuss expectations"
            {...field}
            icon={IoText}
            maxLength={50}
            error={fieldState.error}
          />
        )}
      />
      <div className="flex flex-col gap-3">
        <Controller
          name="date"
          control={control}
          render={({ field: { value, onChange } }) => (
            <DatePicker
              label="Date"
              currentDate={value}
              onChange={onChange}
              displayMode="date"
            />
          )}
        />
        <Controller
          name="start_time"
          control={control}
          render={({ field: { value, onChange } }) => (
            <DatePicker
              label="Start Time"
              currentDate={value}
              onChange={onChange}
              displayMode="time"
            />
          )}
        />
        <Controller
          name="end_time"
          control={control}
          render={({ field: { value, onChange } }) => (
            <DatePicker
              label="End Time"
              currentDate={value}
              onChange={onChange}
              displayMode="time"
            />
          )}
        />
        <Controller
          name="location"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              required={true}
              label="Location"
              placeholder="e.g Office, Starbucks"
              {...field}
              icon={IoLocationOutline}
              maxLength={25}
              error={fieldState.error}
            />
          )}
        />
      </div>

      <div className="flex items-end mt-5 pb-5 justify-end">
        <CTAButton
          type="success"
          text="Schedule Meeting"
          disabled={!isDirty || !isValid || isSubmitting}
          isLoading={isSubmitting}
          callbackFn={handleSubmit(async (data) => {
            const combineDateAndTime = (date, timeString) => {
              if (!date || !timeString) return null;

              if (!(date instanceof Date) || isNaN(date)) return null;

              const [hours, minutes, seconds] = timeString
                .split(":")
                .map(Number);

              if (
                Number.isNaN(hours) ||
                Number.isNaN(minutes) ||
                Number.isNaN(seconds)
              ) {
                return null;
              }

              const combined = new Date(date);
              combined.setHours(hours, minutes, seconds || 0, 0);

              return combined;
            };

            const startDateTime = combineDateAndTime(
              data.date,
              data.start_time,
            );
            const endDateTime = combineDateAndTime(data.date, data.end_time);

            if (!startDateTime || !endDateTime) {
              console.log("Invalid date or time:", {
                date: data.date,
                start_time: data.start_time,
                end_time: data.end_time,
              });
              console.log("Combined DateTimes:", {
                startDateTime,
                endDateTime,
              });
              showToast({
                type: "error",
                title: "Invalid Time",
                message: "Please select a valid date and time.",
              });
              return;
            }

            if (endDateTime <= startDateTime) {
              showToast({
                type: "error",
                title: "Invalid Time Range",
                message: "End time must be after start time.",
              });
              return;
            }

            try {
              await insertMeeting.mutateAsync({
                lead_id: leadId,
                title: data.title,
                location: data.location,
                start_date: startDateTime.toISOString(),
                end_date: endDateTime.toISOString(),
                created_by: profile.id,
              });

              reset(defaultFormData);

              if (closeForm) closeForm();

              showToast({
                type: "success",
                title: "Meeting Scheduled",
                message: "The meeting has been successfully scheduled.",
              });

              await createNotification({
                title: "Meeting Scheduled",
                body: "has scheduled a new meeting for lead:",
                metaData: {
                  url: `/Client-Management/Leads/${leadTitle}`,
                  buttonText: "View Lead",
                },
                docRef: leadTitle,
                category: "Meetings",
                type: "new",
              });
            } catch (error) {
              if (
                error instanceof Error &&
                error.message.includes("overlaps")
              ) {
                showToast({
                  type: "error",
                  title: "Meeting Conflict",
                  message:
                    "This meeting overlaps with another meeting in the same location.",
                });
              } else {
                showToast({
                  type: "error",
                  title: "Submission Failed",
                  message: error?.message || "Unexpected error occurred.",
                });
              }
            }
          })}
        />
      </div>
    </div>
  );
};

export default MeetingForm;
