import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OwnerFormSchema } from "../../validationSchema";
import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useOwnerById } from "@/hooks/useOwnerById";
import TextInput from "../ui/TextInput";
import { IoText } from "react-icons/io5";
import { HiOutlinePhone } from "react-icons/hi2";
import { TfiEmail } from "react-icons/tfi";
import ToggleButton from "../ui/ToggleButton";
import { BsActivity } from "react-icons/bs";
import ProfileImageSection from "../ProfileImageSection";
import CTAButton from "../CTAButton";
import { IoIosUndo } from "react-icons/io";
import { FaCheck } from "react-icons/fa";
import { useUpsertOwner } from "@/hooks/useUpsertOwner";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../contexts/ToastProvider";
import { useCreateNotification } from "@/hooks/useCreateNotification";

const OwnerForm = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { showToast } = useToast();
  const { createNotification } = useCreateNotification();
  const { data: owner, isLoading } = useOwnerById(
    id !== "New-Owner" ? id : null
  );

  console.log("Location state:", location.state);

  const defaultFormData = {
    id: null,
    first_name: location.state?.lead?.first_name || "",
    surname: location.state?.lead?.surname || "",
    middle_name: location.state?.lead?.middle_name || "",
    primary_email: location.state?.lead?.email || "",
    primary_phone: location.state?.lead?.phone || "",
    secondary_email: "",
    secondary_phone: "",
    is_active: true,
    created_at: null,
    legacy_id: null,
    location: "",
  };

  const upsertOwner = useUpsertOwner();

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
    resolver: zodResolver(OwnerFormSchema),
    mode: "all",
    defaultValues: defaultFormData,
    delayError: 250,
  });

  useEffect(() => {
    const lead = location.state?.lead;

    // Editing existing owner → wait until owner exists
    if (id !== "New-Owner") {
      if (owner) reset(owner);
      return;
    }

    // Creating new owner from lead
    if (lead) {
      reset({
        ...defaultFormData,
        first_name: lead.first_name ?? "",
        surname: lead.surname ?? "",
        middle_name: lead.middle_name ?? "",
        primary_email: lead.email ?? "",
        primary_phone: lead.phone ?? "",
        location: lead.title ?? "", // ← You probably want lead.title here
      });
      return;
    }

    // Creating blank new owner
    reset(defaultFormData);
  }, [id, owner, location.key]); // ← important

  console.log("Owner data:", owner);

  const firstName = watch("first_name") || "";
  const surname = watch("surname") || "";

  // Build initials
  const initials = `${firstName.charAt(0)}${surname.charAt(0)}`.toUpperCase();

  console.log("isDirty:", isDirty, "isValid:", isValid);
  console.log("Form Errors:", errors);
  const invalidFields = Object.keys(errors);
  console.log("Invalid fields:", invalidFields);
  console.log("Form Values:", watch());
  console.log("Owner:", owner);
  console.log("Owner ID:", id);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="flex bg-primary-bg flex-1 flex-row p-3 gap-3">
      <div className="bg-secondary-bg flex-1 rounded-2xl border p-3 border-border-color flex flex-col gap-3 h-full overflow-hidden">
        <div className="mb-5">
          <ProfileImageSection
            item={owner}
            bucket="avatars"
            path="owners"
            table="Owners"
            width="w-48"
            height="h-48"
            noImageText={initials}
            onImageChange={(url) => {
              // Optional: update your parent state, e.g. via TanStack Query invalidate
              queryClient.invalidateQueries(["Owner", owner.id]);
              console.log("New avatar URL:", url);
            }}
          />
        </div>
        <Controller
          name="first_name"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              required={true}
              label="First Name"
              placeholder="e.g. John"
              {...field}
              icon={IoText}
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
              placeholder="e.g. Doe"
              {...field}
              icon={IoText}
              error={fieldState.error}
            />
          )}
        />
        <Controller
          name="middle_name"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label="Middle Name"
              placeholder="e.g. Robert"
              {...field}
              icon={IoText}
              error={fieldState.error}
            />
          )}
        />
      </div>
      <div className="bg-secondary-bg gap-3 flex-1 rounded-2xl border p-3 border-border-color flex flex-col h-full overflow-hidden">
        <Controller
          name="primary_email"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              required={true}
              label="Primary Email"
              placeholder="e.g. john.doe@example.com"
              {...field}
              icon={TfiEmail}
              error={fieldState.error}
            />
          )}
        />
        <Controller
          name="secondary_email"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label="Secondary Email"
              placeholder="e.g. robertdoe@example.co.uk"
              {...field}
              icon={TfiEmail}
              error={fieldState.error}
            />
          )}
        />
        <Controller
          name="primary_phone"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label="Primary Phone"
              placeholder="e.g. 07985 998712"
              {...field}
              icon={HiOutlinePhone}
              error={fieldState.error}
            />
          )}
        />
        <Controller
          name="secondary_phone"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label="Secondary Phone"
              placeholder="e.g. 01670 123456"
              {...field}
              icon={HiOutlinePhone}
              error={fieldState.error}
            />
          )}
        />
        <Controller
          name="location"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label="Location"
              placeholder="e.g. Alnwick, Northumberland"
              {...field}
              icon={TfiEmail}
              error={fieldState.error}
            />
          )}
        />
        <ToggleButton
          label="Active Status"
          checked={watch("is_active")}
          onChange={(val) => setValue("is_active", val, { shouldDirty: true })}
          trueLabel="Active"
          falseLabel="Inactive"
          icon={BsActivity}
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 h-full">
        <div className="bg-secondary-bg flex-1 rounded-2xl border p-3 border-border-color flex flex-col gap-3overflow-hidden"></div>
        <div className="flex flex-row gap-3 bg-secondary-bg border border-border-color rounded-2xl p-3">
          <CTAButton
            disabled={!isDirty}
            width="flex-1"
            type="cancel"
            text="Revert Changes"
            icon={IoIosUndo}
            callbackFn={() =>
              id === "New-Owner" ? reset(defaultFormData) : reset(owner)
            }
          />
          <CTAButton
            isLoading={isSubmitting}
            disabled={!isDirty || !isValid || isSubmitting}
            width="flex-1"
            type="success"
            text={
              isSubmitting
                ? location.state
                  ? "Converting..."
                  : "Saving..."
                : location.state
                ? "Convert Lead"
                : "Save Changes"
            }
            icon={FaCheck}
            callbackFn={handleSubmit(async (data) => {
              try {
                const payload = id !== "New-Owner" ? { id, ...data } : data;

                console.log("Submitting payload:", payload);

                // 1. Get the real owner from the mutation result
                const result = await upsertOwner.mutateAsync(payload);

                // 2. Extract the real ID
                const ownerId = result?.id || id;

                navigate("/Client-Management/Owners");

                showToast({
                  type: "success",
                  title: id !== "New-Owner" ? "Owner Updated" : "Owner Created",
                  message:
                    id !== "New-Owner"
                      ? "The owner has been successfully updated."
                      : "New owner successfully created.",
                });

                // 3. Use the real ID in the notification
                await createNotification({
                  title:
                    id !== "New-Owner"
                      ? `Existing Owner Updated.`
                      : `New Owner Created.`,
                  body:
                    id !== "New-Owner"
                      ? `updated the account of owner:`
                      : `added a new owner:`,
                  metaData: {
                    url: `/Client-Management/Owners/${ownerId}`,
                    buttonText: "View Owner",
                  },
                  docRef: ownerId,
                });
              } catch (error) {
                console.error("Save failed:", error.message);
                showToast({
                  type: "error",
                  title: "Save Failed. Unexpected error.",
                  message:
                    error?.message ||
                    "An error occurred while saving the owner.",
                });
              }
            })}
          />
        </div>
      </div>
    </div>
  );
};

export default OwnerForm;
