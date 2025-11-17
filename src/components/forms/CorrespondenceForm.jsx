import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CorrespondenceFormSchema } from "../../validationSchema";
import TextInput from "../ui/TextInput";
import { VscTag } from "react-icons/vsc";
import { IoText } from "react-icons/io5";
import { TbListDetails } from "react-icons/tb";
import { useToast } from "../../contexts/ToastProvider";
import { useQueryClient } from "@tanstack/react-query";
import TextAreaInput from "../ui/RHFTextArea";
import CTAButton from "../CTAButton";
import { useInsertCorrespondence } from "@/hooks/useInsertCorrespondence";

const defaultFormData = {
  title: "",
  content: "",
  tag: "",
};

const CorrespondenceForm = ({ leadId }) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const insertCorrespondence = useInsertCorrespondence();

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
    resolver: zodResolver(CorrespondenceFormSchema),
    mode: "all",
    defaultValues: defaultFormData,
    delayError: 250,
  });
  console.log("Form Values:", watch());

  return (
    <div className="flex flex-col flex-1">
      <Controller
        name="title"
        control={control}
        render={({ field, fieldState }) => (
          <TextInput
            required={true}
            label="Title"
            placeholder="e.g. Phone call with client"
            {...field}
            icon={IoText}
            maxLength={50}
            error={fieldState.error}
          />
        )}
      />
      <Controller
        name="tag"
        control={control}
        render={({ field, fieldState }) => (
          <TextInput
            required={true}
            label="Category Tag"
            placeholder="e.g. Pricing, Scheduling"
            {...field}
            icon={VscTag}
            maxLength={15}
            error={fieldState.error}
          />
        )}
      />
      <Controller
        name="content"
        control={control}
        render={({ field, fieldState }) => (
          <TextAreaInput
            required={true}
            label="Content"
            placeholder="e.g. Client agreed to the proposed pricing of £500 for the service. Follow-up meeting scheduled for next week to finalize details."
            rows={4}
            maxLength={500}
            {...field}
            icon={TbListDetails}
            error={fieldState.error}
          />
        )}
      />
      <div className="flex items-end mt-5 justify-end">
        <CTAButton
          type="success"
          text="Submit Item"
          disabled={!isValid || isSubmitting}
          callbackFn={handleSubmit(async (data) => {
            try {
              await insertCorrespondence.mutateAsync({
                lead_id: leadId,
                ...data,
              });

              reset(defaultFormData);
              showToast({
                type: "success",
                title: "Correspondence Added",
                message: "The correspondence has been successfully added.",
              });
            } catch (error) {
              showToast({
                type: "error",
                title: "Submission Failed",
                message:
                  error?.message ||
                  "An error occurred while adding the correspondence.",
              });
            }
          })}
        />
      </div>
    </div>
  );
};

export default CorrespondenceForm;
