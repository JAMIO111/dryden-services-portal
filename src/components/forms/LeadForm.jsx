import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LeadFormSchema } from "../../validationSchema";
import TextInput from "../ui/TextInput";
import { IoText } from "react-icons/io5";
import { useToast } from "../../contexts/ToastProvider";
import { useQueryClient } from "@tanstack/react-query";
import CTAButton from "../CTAButton";
import { useUpsertLead } from "@/hooks/useUpsertLead";
import CardSelect from "../CardSelect";

const defaultFormData = {
  title: "",
  first_name: "",
  surname: "",
  phone: "",
  email: "",
  status: "",
};

const LeadForm = ({ lead, navigate }) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const upsertLead = useUpsertLead();

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
    if (lead) {
      reset({
        title: lead.title || "",
        first_name: lead.first_name || "",
        surname: lead.surname || "",
        phone: lead.phone || "",
        email: lead.email || "",
        status: lead.status || "",
      });
    }
  }, [lead, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
      };

      // include ID if editing
      if (lead?.id) payload.id = lead.id;

      const saved = await upsertLead.mutateAsync(payload);

      // title BEFORE save
      const oldTitle = lead?.title;
      // title AFTER save (from DB)
      const newTitle = saved.title;

      // if the title changed → redirect to the new URL
      if (oldTitle && newTitle && oldTitle !== newTitle) {
        navigate(`/Client-Management/Leads/${encodeURIComponent(newTitle)}`);
      }

      reset(defaultFormData);

      showToast({
        type: "success",
        title: "Lead Saved",
        message: lead
          ? "The lead has been successfully updated."
          : "A new lead has been successfully created.",
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Submission Failed",
        message: error?.message || "An error occurred while saving the lead.",
      });
    }
  };

  return (
    <div className="flex flex-1 h-full flex-col">
      <Controller
        name="title"
        control={control}
        render={({ field, fieldState }) => (
          <TextInput
            required={true}
            label="Title"
            placeholder="e.g Bens Hot Tub"
            {...field}
            icon={IoText}
            maxLength={50}
            error={fieldState.error}
          />
        )}
      />
      <Controller
        name="first_name"
        control={control}
        render={({ field, fieldState }) => (
          <TextInput
            required={true}
            label="First Name"
            placeholder="e.g Benjamin"
            {...field}
            icon={IoText}
            maxLength={50}
            error={fieldState.error}
          />
        )}
      />
      <Controller
        name="surname"
        control={control}
        render={({ field, fieldState }) => (
          <TextInput
            required={true}
            label="Surname"
            placeholder="e.g Button"
            {...field}
            icon={IoText}
            maxLength={50}
            error={fieldState.error}
          />
        )}
      />
      <Controller
        name="phone"
        control={control}
        render={({ field, fieldState }) => (
          <TextInput
            required={true}
            label="Phone No."
            placeholder="e.g 07965 412387"
            {...field}
            icon={IoText}
            maxLength={20}
            error={fieldState.error}
          />
        )}
      />
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <TextInput
            required={true}
            label="Email Address"
            placeholder="e.g ben.button@example.com"
            {...field}
            icon={IoText}
            error={fieldState.error}
          />
        )}
      />
      <div className="mt-4">
        <Controller
          name="status"
          control={control}
          render={({ field, fieldState }) => (
            <CardSelect
              label="Status"
              required={true}
              {...field}
              error={fieldState.error}
              options={[
                {
                  title: "New",
                  description: "A newly added lead",
                  value: "New",
                },
                {
                  title: "Hot Lead",
                  description: "A lead with high potential",
                  value: "Hot Lead",
                },
                {
                  title: "Follow-up",
                  description: "A lead that requires follow-up",
                  value: "Follow-up",
                },
                {
                  title: "Cold Lead",
                  description: "A lead with low potential",
                  value: "Cold Lead",
                },
              ]}
            />
          )}
        />
      </div>
      <div className="flex items-end mt-5 gap-3 pb-5 justify-end">
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
          text={lead ? "Update Lead" : "Save Lead"}
          disabled={!isValid || isSubmitting || !isDirty}
          callbackFn={handleSubmit(onSubmit)}
        />
      </div>
    </div>
  );
};

export default LeadForm;
