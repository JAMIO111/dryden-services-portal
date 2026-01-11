import { useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

/* Icons */
import { IoIosUndo } from "react-icons/io";
import { IoTrashOutline, IoLocation } from "react-icons/io5";
import { BsActivity, BsPencil, BsBuildingGear } from "react-icons/bs";
import { TbClock, TbIroning3 } from "react-icons/tb";
import { FaCheck } from "react-icons/fa6";
import { HiOutlineMail } from "react-icons/hi";
import { HiOutlinePhone, HiOutlineWrenchScrewdriver } from "react-icons/hi2";
import { MdHotTub, MdPublishedWithChanges } from "react-icons/md";
import { BiBuildingHouse } from "react-icons/bi";
import { LuUser } from "react-icons/lu";
import { PiNumberThreeFill } from "react-icons/pi";
import { GiMagicBroom } from "react-icons/gi";
import { SlLock } from "react-icons/sl";

/* App / hooks */
import { PropertyFormSchema } from "../../validationSchema";
import { usePropertyByName } from "@/hooks/usePropertyByName";
import { useUpsertProperty } from "@/hooks/useUpsertProperty";
import { usePackages } from "@/hooks/useManagementPackages";
import { useCreateNotification } from "@/hooks/useCreateNotification";
import { useModal } from "@/contexts/ModalContext";
import { useToast } from "@/contexts/ToastProvider";

/* Components */
import CTAButton from "../CTAButton";
import Spinner from "@components/LoadingSpinner";
import ToggleButton from "../ui/ToggleButton";
import CardSelect from "@components/CardSelect";
import ProfileImageSection from "../ProfileImageSection";
import KeyCodeForm from "./KeyCodeForm";
import PropertyOwnerForm from "./PropertyOwnerForm";
import PropertyAddressForm from "./PropertyAddressForm";
import PropertyDetailsForm from "./PropertyDetailsForm";

const defaultFormData = {
  id: undefined,
  name: undefined,
  bedrooms: 0,
  sleeps: 0,
  bathrooms: 0,
  line_1: undefined,
  line_2: undefined,
  town: undefined,
  county: undefined,
  postcode: undefined,
  what_3_words: undefined,
  package: null,
  service_type: null,
  hired_laundry: false,
  notes: "",
  KeyCodes: [],
  Owners: [],
};

const PropertyForm = () => {
  const queryClient = useQueryClient();
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();
  const { name } = useParams();
  const { showToast } = useToast();
  const { createNotification } = useCreateNotification();
  const { data: property, isLoading } = usePropertyByName(
    name !== "New-Property" ? name : null
  );
  const { data: packages } = usePackages();

  const upsertProperty = useUpsertProperty();

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(PropertyFormSchema),
    mode: "all",
    defaultValues: { ...defaultFormData, ...(property || {}) },
    delayError: 250,
  });

  const formatTo12Hour = (time) => {
    if (!time) return "Not set";

    const [h, m] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);

    return date
      .toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/am|pm/, (match) => match.toUpperCase());
  };

  const hasAddressError = Boolean(
    errors?.name ||
      errors?.line_1 ||
      errors?.line_2 ||
      errors?.town ||
      errors?.county ||
      errors?.postcode ||
      errors?.what_3_words
  );

  const {
    fields: keyCodeFields,
    append: appendKeyCode,
    remove: removeKeyCode,
    update: updateKeyCode,
  } = useFieldArray({
    control,
    name: "KeyCodes",
  });

  const {
    fields: ownerFields,
    append: appendOwner,
    remove: removeOwner,
    update: updateOwner,
    replace: replaceOwners,
  } = useFieldArray({
    control,
    name: "Owners",
    keyName: "formId",
  });

  console.log("Form Data", watch());

  useEffect(() => {
    if (name === "New-Property") {
      reset(defaultFormData);
    } else if (property) {
      reset({ ...defaultFormData, ...property });
    }
  }, [name, property, reset]);

  console.log("Form Values:", watch());

  const openManageOwnersModal = () => {
    openModal({
      title: "Manage Property Owners",
      content: (
        <PropertyOwnerForm
          propertyId={property?.id}
          defaultOwners={ownerFields.map((field) => field)}
          onSave={(updatedOwners) => {
            replaceOwners(updatedOwners); // replaces entire array in form state
            trigger("Owners");
            closeModal();
          }}
          onCancel={closeModal}
        />
      ),
    });
  };

  const openAddKeyCodeModal = () => {
    openModal({
      title: "Add Key Code",
      content: (
        <KeyCodeForm
          onSave={(keyCode) => {
            appendKeyCode(keyCode);
            trigger("KeyCodes");
            closeModal();
          }}
          onCancel={closeModal}
        />
      ),
    });
  };

  const openEditKeyCodeModal = (index, keyCodeItem) => {
    openModal({
      title: "Edit Key Code",
      content: (
        <KeyCodeForm
          defaultValues={keyCodeItem}
          onSave={(updatedKeyCode) => {
            updateKeyCode(index, updatedKeyCode); // <-- use update for edits
            trigger("KeyCodes");
            closeModal();
          }}
          onCancel={closeModal}
        />
      ),
    });
  };

  const openEditAddressModal = () => {
    openModal({
      title: "Edit Address",
      content: (
        <div className="p-3">
          <PropertyAddressForm control={control} />

          <div className="flex justify-end gap-2 mt-4">
            <CTAButton type="cancel" text="Close" callbackFn={closeModal} />
          </div>
        </div>
      ),
    });
  };

  const openEditDetailsModal = () => {
    openModal({
      title: "Edit Property Details",
      content: (
        <div className="p-3 max-h-[80vh] min-w-[60vw] overflow-y-auto">
          <PropertyDetailsForm control={control} />

          <div className="flex justify-end gap-2 mt-4">
            <CTAButton type="cancel" text="Close" callbackFn={closeModal} />
          </div>
        </div>
      ),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center flex-1 w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="grid bg-primary-bg h-full p-3 gap-3 grid-cols-4">
      <div className="flex flex-1 gap-3 flex-col">
        <div className="flex flex-1 overflow-y-auto justify-between flex-col bg-secondary-bg shadow-m rounded-2xl">
          <div className="p-3">
            <ProfileImageSection
              item={property}
              bucket="avatars"
              path="properties"
              table="Properties"
              noImageText="No Image"
              aspectRatio="aspect-video"
              width="w-full"
              onImageChange={(url) => {
                // Optional: update your parent state, e.g. via TanStack Query invalidate
                queryClient.invalidateQueries(["Property", property.name]);
                console.log("New avatar URL:", url);
              }}
            />
          </div>

          <div className="flex flex-1 p-3 overflow-y-auto flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary-text tracking-tight">
                Property Address
              </h2>

              <CTAButton
                type="main"
                text="Edit Address"
                callbackFn={openEditAddressModal}
              />
            </div>

            {/* Card */}
            <div
              className={`rounded-xl bg-tertiary-bg p-4 mb-3 shadow-s ${
                hasAddressError ? "border border-error-color" : ""
              }`}>
              <h3 className="text-base font-semibold pl-7 text-primary-text mb-3">
                {watch("name") || "No Name Provided"}
              </h3>

              <div className="flex items-start mb-3 gap-3 text-sm text-secondary-text">
                <IoLocation className="mt-0.5 h-4 w-4 text-secondary-text shrink-0" />

                <div className="flex flex-col leading-snug">
                  {watch("line_1") && <span>{watch("line_1")}</span>}

                  {watch("line_2") && <span>{watch("line_2")}</span>}

                  {(watch("town") || watch("county") || watch("postcode")) && (
                    <span>
                      {[watch("town"), watch("county"), watch("postcode")]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-secondary-text">
                <PiNumberThreeFill className="mt-0.5 h-4 w-4 text-secondary-text shrink-0" />
                <span className="text-sm text-secondary-text">
                  {watch("what_3_words") || "W3W not set"}
                </span>
              </div>
            </div>
            <ToggleButton
              label="Active Status"
              checked={watch("is_active")}
              onChange={(val) =>
                setValue("is_active", val, { shouldDirty: true })
              }
              trueLabel="Active"
              falseLabel="Inactive"
              icon={BsActivity}
            />
          </div>
        </div>
      </div>
      <div className="h-full flex flex-1 flex-col gap-3">
        <div className="flex justify-start flex-1 p-3 flex-col bg-secondary-bg shadow-m rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary-text tracking-tight">
              Additional Details
            </h2>

            <CTAButton
              type="main"
              text="Edit Details"
              callbackFn={openEditDetailsModal}
            />
          </div>
          <div className="flex flex-1 p-1 gap-5 overflow-y-auto flex-col">
            <div className="flex overflow-y-auto flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <TbClock className="mr-2 h-5 w-5 text-secondary-text shrink-0" />
                  <span className="w-32 text-secondary-text">
                    Check-in time
                  </span>
                </div>
                <span className="font-medium">
                  {formatTo12Hour(watch("check_in")) || "Not set"}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <TbClock className="mr-2 h-5 w-5 text-secondary-text shrink-0" />
                  <span className="w-32 text-secondary-text">
                    Check-out time
                  </span>
                </div>
                <span className="font-medium">
                  {formatTo12Hour(watch("check_out")) || "Not set"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <BiBuildingHouse className="mr-2 h-5 w-5 text-secondary-text shrink-0" />
                  <span className="w-fit text-secondary-text">
                    Property Ref.
                  </span>
                </div>
                <span className="font-medium flex-1 text-right">
                  {watch("property_ref") || "Not set"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <LuUser className="mr-2 h-5 w-5 text-secondary-text shrink-0" />
                  <span className="w-fit text-secondary-text">Owner Ref.</span>
                </div>
                <span className="font-medium flex-1 text-right">
                  {watch("owner_ref") || "Not set"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <BsBuildingGear className="mr-2 h-5 w-5 text-secondary-text shrink-0" />
                  <span className="w-fit text-secondary-text">
                    Letting Agent
                  </span>
                </div>
                <span className="font-medium flex-1 text-right">
                  {watch("letting_agent") || "Not set"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between p-3 flex-col bg-secondary-bg shadow-m rounded-2xl">
          <Controller
            name="package"
            control={control}
            render={({ field, fieldState }) => (
              <CardSelect
                options={packages || []}
                label="Management Package"
                titleKey="name"
                descriptionKey="tier"
                valueKey="id"
                package={true}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>
      <div className="flex flex-col flex-1 gap-3">
        <div className="flex flex-1 justify-start gap-3 p-3 flex-col bg-secondary-bg shadow-m rounded-2xl">
          <Controller
            name="service_type"
            control={control}
            render={({ field, fieldState }) => (
              <CardSelect
                options={[
                  { id: "hot_tub", name: "Hot Tub", icon: MdHotTub },
                  {
                    id: "laundry",
                    name: "Laundry",
                    icon: TbIroning3,
                  },
                  { id: "clean", name: "Clean", icon: GiMagicBroom },
                  {
                    id: "maintenance",
                    name: "Maintenance",
                    icon: HiOutlineWrenchScrewdriver,
                  },
                  {
                    id: "changeover",
                    name: "Changeover",
                    icon: MdPublishedWithChanges,
                  },
                ]}
                multiSelect={true}
                label="Service Type"
                titleKey="name"
                descriptionKey="tier"
                valueKey="id"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="hired_laundry"
            control={control}
            render={({ field, fieldState }) => (
              <ToggleButton
                label="Hired Laundry"
                checked={field.value}
                onChange={field.onChange}
                trueLabel="Yes"
                falseLabel="No"
                icon={TbIroning3}
              />
            )}
          />
          <div className="relative flex-1 bg-amber-100 text-sm p-3 rounded-lg shadow-sm overflow-hidden">
            {/* Fold */}
            <div className="absolute top-0 left-0 w-6 h-6 bg-amber-200 rotate-45 -translate-x-1/2 -translate-y-1/2 shadow-sm" />

            {watch("notes") || "No additional notes entered yet."}
          </div>
        </div>
      </div>
      <div className="flex flex-col h-full gap-3">
        <div className="flex justify-start flex-1 p-3 flex-col bg-secondary-bg shadow-m rounded-2xl">
          <div className="flex items-center justify-between pr-2 mb-3">
            <h2 className="text-xl ml-1 font-semibold text-primary-text">
              Key Codes
            </h2>
            <CTAButton
              type="main"
              text="Add Key Code"
              callbackFn={openAddKeyCodeModal}
            />
          </div>
          {keyCodeFields?.length === 0 ? (
            <p className="text-sm text-primary-text text-center bg-tertiary-bg rounded-lg shadow-s p-3">
              No key codes added yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-1 max-h-28 overflow-y-auto">
              {keyCodeFields.map((field, index) => (
                <li
                  key={field.id}
                  className="flex mb-1 ml-1 shadow-s bg-tertiary-bg rounded-xl gap-2 p-1.5 mr-2 items-center justify-between">
                  <span className="rounded-lg shadow-s p-1 text-lg px-2 bg-primary-bg font-bold text-primary-text">
                    {field.code}
                  </span>
                  <span className="flex-1 p-1 truncate font-medium text-lg text-primary-text">
                    {field.name}
                  </span>
                  {field.is_private && (
                    <span className="rounded-lg text-primary-text shadow-s p-2 bg-pink-500/30 font-medium">
                      <SlLock className="h-5 w-5" />
                    </span>
                  )}

                  <button
                    onClick={() => openEditKeyCodeModal(index, field)}
                    className="p-2 cursor-pointer text-icon-color hover:shadow-s rounded-lg hover:text-cta-color">
                    <BsPencil className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => removeKeyCode(index)}
                    className="p-2 cursor-pointer hover:shadow-s text-icon-color rounded-lg hover:text-error-color">
                    <IoTrashOutline className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto bg-secondary-bg shadow-m rounded-2xl p-3">
          <div className="flex items-center justify-between pr-2 mb-3">
            <h2 className="text-xl ml-1 font-semibold text-primary-text">
              Owners
            </h2>
            <CTAButton
              type="main"
              text="Manage Owners"
              callbackFn={openManageOwnersModal}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {ownerFields.length === 0 ? (
              <p className="text-sm text-primary-text">No owners added yet.</p>
            ) : (
              <ul className="flex flex-col p-1 gap-2">
                {ownerFields.map((owner, index) => (
                  <li
                    key={owner.id}
                    className="flex items-center justify-between p-2 bg-tertiary-bg rounded-xl shadow-s">
                    {owner.avatar ? (
                      <img
                        src={owner.avatar}
                        alt={`${owner.first_name} ${owner.surname}`}
                        className="w-12 h-12 rounded-lg object-cover mr-3"
                      />
                    ) : (
                      <div className="flex items-center justify-center shadow-s w-12 h-12 rounded-lg bg-primary-bg mr-3">
                        <p className="text-lg font-semibold text-primary-text">
                          {owner.first_name.charAt(0).toUpperCase() +
                            owner.surname.charAt(0).toUpperCase()}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-col gap-1 flex-1 ml-2">
                      <span className="font-medium text-primary-text">
                        {owner.first_name} {owner.surname}
                      </span>
                      <div className="flex items-center gap-2">
                        {owner.primary_email ? (
                          <HiOutlineMail className="text-secondary-text" />
                        ) : (
                          <HiOutlinePhone className="text-secondary-text" />
                        )}
                        <span className="text-sm text-secondary-text">
                          {owner.primary_email
                            ? owner.primary_email
                            : owner.primary_phone}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-row gap-3 bg-secondary-bg shadow-m rounded-2xl p-3">
          <CTAButton
            disabled={!isDirty}
            width="w-[50%]"
            type="cancel"
            text="Revert Changes"
            icon={IoIosUndo}
            callbackFn={() =>
              !property || watch("id") === undefined
                ? reset(defaultFormData)
                : reset({ ...defaultFormData, ...property })
            }
          />
          <CTAButton
            isLoading={isSubmitting}
            disabled={!isDirty || !isValid || isSubmitting}
            width="w-[50%]"
            type="success"
            text={isSubmitting ? "Saving..." : "Save Changes"}
            icon={FaCheck}
            callbackFn={handleSubmit(async (data) => {
              try {
                const payload = {
                  ...data,
                  id: watch("id"),
                  is_active: watch("is_active"),
                };

                console.log("Payload Data:", payload);

                // 1. Capture mutation result so we get the real property ID
                const result = await upsertProperty.mutateAsync({
                  propertyData: payload,
                  keyCodesForm: keyCodeFields,
                  ownersForm: ownerFields,
                });

                // These are the IDs involved
                const propertyId = result?.id || payload.id; // Correct ID for both create + update

                showToast({
                  type: "success",
                  title: payload.id ? "Property Updated" : "Property Created",
                  message: payload.id
                    ? "The property has been successfully updated."
                    : "New property successfully entered.",
                });

                navigate("/Client-Management/Properties");

                // 2. Use the actual ID from the mutation result
                await createNotification({
                  title: payload.id
                    ? `Existing Property Updated.`
                    : `New Property Created.`,
                  body: payload.id
                    ? `updated the details of property:`
                    : `added a new property:`,
                  metaData: {
                    url: `/Client-Management/Properties/${payload.name}`,
                    buttonText: "View Property",
                  },
                  docRef: payload.name,
                  category: "Properties",
                  type: !!propertyId ? "update" : "new",
                });
              } catch (error) {
                console.error("Save Failed:", error);

                showToast({
                  type: "error",
                  title: "Save Failed",
                  message: error?.message?.includes(
                    'duplicate key value violates unique constraint "Properties_name_key"'
                  )
                    ? "A property with this name already exists. Please choose a different name."
                    : error?.message ||
                      "An unexpected error occurred while saving the property. Please try again.",
                });
              }
            })}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
