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

const defaultFormData = {
  id: null,
  lead_id: null,
  created_by: null,
  location: "",
  created_at: null,
  date: new Date(), // defaults to today
  start_time: (() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0); // 12:00
    return d;
  })(),
  end_time: (() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0); // 12:00
    return d;
  })(),
};

const MeetingForm = ({ leadId }) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const insertMeeting = useInsertMeeting();

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
          disabled={!isValid || isSubmitting}
          callbackFn={handleSubmit(async (data) => {
            const combineDateAndTime = (date, time) => {
              if (!date || !time) return null;

              const combined = new Date(date); // copy date
              combined.setHours(time.getHours());
              combined.setMinutes(time.getMinutes());
              combined.setSeconds(0);
              combined.setMilliseconds(0);
              return combined;
            };

            const { date, start_time, end_time, ...rest } = data;

            const calculatedStart = combineDateAndTime(date, start_time);
            const calculatedEnd = combineDateAndTime(date, end_time);

            const meetingData = {
              ...rest, // the remaining fields
              start_date: calculatedStart,
              end_date: calculatedEnd,
            };

            console.log("Submitting Meeting Data:", {
              ...meetingData,
              start_date: calculatedStart,
              end_date: calculatedEnd,
            });

            try {
              await insertMeeting.mutateAsync({
                lead_id: leadId,
                start_date: calculatedStart,
                end_date: calculatedEnd,
                ...meetingData,
              });

              reset(defaultFormData);
              showToast({
                type: "success",
                title: "Meeting Scheduled",
                message: "The meeting has been successfully scheduled.",
              });
            } catch (error) {
              showToast({
                type: "error",
                title: "Submission Failed",
                message:
                  error?.message ||
                  "An error occurred while scheduling the meeting.",
              });
            }
          })}
        />
      </div>
    </div>
  );
};

export default MeetingForm;
