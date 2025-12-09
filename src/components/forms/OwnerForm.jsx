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
import { useFieldArray } from "react-hook-form";
import OwnerPropertyForm from "./OwnerPropertyForm";
import { usePropertiesByOwner } from "@/hooks/usePropertiesByOwner";
import { useModal } from "@/contexts/ModalContext";
import { IoLocationOutline } from "react-icons/io5";

const OwnerForm = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { showToast } = useToast();
  const { createNotification } = useCreateNotification();
  const { data: owner, isLoading: isOwnerLoading } = useOwnerById(
    id !== "New-Owner" ? id : null
  );
  const { data: properties, isLoading: isPropertiesLoading } =
    usePropertiesByOwner(id !== "New-Owner" ? id : null);
  const { openModal, closeModal } = useModal();

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
    Properties: [],
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

  const {
    fields: propertyFields,
    append: appendProperty,
    remove: removeProperty,
    update: updateProperty,
    replace: replaceProperties,
  } = useFieldArray({
    control,
    name: "Properties",
    keyName: "formId",
  });
  console.log("Property fields:", propertyFields);
  const openManagePropertiesModal = () => {
    openModal({
      title: "Manage Owner's Properties",
      content: (
        <OwnerPropertyForm
          ownerId={owner?.id}
          defaultProperties={propertyFields.map((field) => field)}
          onSave={(updatedProperties) => {
            replaceProperties(updatedProperties); // replaces entire array in form state
            trigger("Properties");
            closeModal();
          }}
          onCancel={closeModal}
        />
      ),
    });
  };

  useEffect(() => {
    if (properties && properties.length > 0) {
      // Map properties to match the structure your form expects
      replaceProperties(properties);
    }
  }, [properties, replaceProperties]);

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
        Properties: [],
      });
      return;
    }

    // Creating blank new owner
    reset(defaultFormData);
  }, [id, owner, location.key]); // ← important

  console.log("Owner data:", owner);
  console.log("Property data:", properties);

  const firstName = watch("first_name") || "";
  const surname = watch("surname") || "";

  // Build initials
  const initials = `${firstName.charAt(0)}${surname.charAt(0)}`.toUpperCase();

  if (isOwnerLoading || isPropertiesLoading) return <p>Loading...</p>;

  return (
    <div className="flex bg-primary-bg flex-1 h-full flex-row p-3 gap-3">
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
        <div className="bg-secondary-bg flex-1 rounded-2xl border p-3 border-border-color flex flex-col overflow-hidden">
          <h2 className="text-lg pb-2 pl-2 font-semibold text-primary-text">
            Properties
          </h2>
          {isPropertiesLoading ? (
            <div className="flex flex-1 w-full items-start justify-center">
              <p className="flex items-center justify-center text-sm border border-dashed border-border-dark-color w-full text-center h-40 rounded-lg text-primary-text">
                Loading properties...
              </p>
            </div>
          ) : propertyFields.length === 0 ? (
            <div className="flex flex-1 w-full items-start justify-center">
              <p className="flex items-center justify-center text-sm border border-dashed border-border-dark-color w-full text-center h-40 rounded-lg text-primary-text">
                No properties added yet.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col flex-1 min-h-0 overflow-y-auto p-1 gap-2">
              {propertyFields.map((property, index) => {
                const propertyData = property.property || property;
                return (
                  <li
                    key={propertyData.id}
                    className="flex flex-col items-start px-3 justify-between p-2 bg-tertiary-bg rounded-xl shadow-s">
                    {propertyData?.avatar ? (
                      <img
                        src={propertyData?.avatar}
                        alt={`${propertyData?.name}`}
                        className="w-full aspect-video rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center shadow-s w-full aspect-video rounded-lg bg-primary-bg">
                        <p className="text-lg font-semibold text-primary-text">
                          {propertyData?.name.toUpperCase()}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-col py-3 gap-2 flex-1">
                      <span className="font-semibold text-primary-text">
                        {propertyData?.name}
                      </span>
                      <div className="flex items-start gap-1.5">
                        <IoLocationOutline className="text-secondary-text" />

                        <span className="text-sm text-secondary-text">
                          {[
                            propertyData?.line_1,
                            propertyData?.line_2,
                            propertyData?.town,
                            propertyData?.postcode,
                          ]
                            .filter(Boolean)
                            .join(", ") || "No address provided"}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-3">
            <CTAButton
              width="w-full"
              type="main"
              text="Manage Properties"
              icon={IoLocationOutline}
              callbackFn={openManagePropertiesModal}
            />
          </div>
        </div>
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
                const result = await upsertOwner.mutateAsync({
                  ownerData: payload, // your owner object
                  propertiesForm: [], // or the actual properties form data
                });

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
                  docRef: result.first_name + " " + result.surname,
                  category: "Owners",
                  type: !!ownerId ? "update" : "new",
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
