import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoText } from "react-icons/io5";
import { useQueryClient } from "@tanstack/react-query";
import { EmployeeFormSchema } from "../../validationSchema";
import { useUpsertEmployee } from "@/hooks/useUpsertEmployee";
import ProfileImageSection from "../ProfileImageSection";
import TextInput from "../ui/TextInput";
import RHFComboBox from "../ui/RHFComboBox";
import DatePicker from "../ui/DatePicker";
import CTAButton from "../CTAButton";
import { RxReset } from "react-icons/rx";
import { GiSaveArrow } from "react-icons/gi";
import { TbSteeringWheel } from "react-icons/tb";
import RHFTextAreaInput from "../ui/RHFTextArea";
import { PiPassword } from "react-icons/pi";
import { FaRegIdCard } from "react-icons/fa";
import {
  IoMaleFemaleOutline,
  IoBriefcaseOutline,
  IoLocationOutline,
} from "react-icons/io5";
import ToggleButton from "../ui/ToggleButton";
import { HiOutlinePhone } from "react-icons/hi2";
import { TfiEmail } from "react-icons/tfi";
import { useToast } from "../../contexts/ToastProvider";
import { useModal } from "@/contexts/ModalContext";
import { useCreateNotification } from "@/hooks/useCreateNotification";

const defaultFormData = {
  id: null,
  first_name: "",
  surname: "",
  middle_name: "",
  gender: "",
  job_title: "",
  dob: null,
  email: "",
  phone: "",
  address: "",
  ni_number: "",
  start_date: null,
  is_driver: false,
  is_cscs: false,
  is_active: true,
  hourly_rate: "",
};

const EmployeeForm = ({ employee }) => {
  const { createNotification } = useCreateNotification();
  const queryClient = useQueryClient();
  const upsertEmployee = useUpsertEmployee();
  const { showToast } = useToast();
  const { closeModal } = useModal();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm({
    resolver: zodResolver(EmployeeFormSchema),
    mode: "onChange",
    defaultValues: defaultFormData,
  });

  const initials = `${employee?.first_name?.[0] ?? ""}${
    employee?.surname?.[0] ?? ""
  }`.toUpperCase();

  const onSubmit = async (data) => {
    try {
      const payload = { ...data };

      // add ID when editing
      if (employee?.id) payload.id = employee.id;

      // Save employee and get the returned row
      const saved = await upsertEmployee.mutateAsync(payload);

      closeModal();

      showToast({
        type: "success",
        title: "Employee Saved",
        message: employee
          ? "The employee has been successfully updated."
          : "A new employee has been successfully created.",
      });

      await createNotification({
        title: employee ? "Employee Updated" : "Employee Created",
        body: employee
          ? "has made amendments to an employee record:"
          : "has added a new employee:",
        docRef: `${saved?.first_name} ${saved?.surname}`, // <-- use fresh ID from DB
        category: "Employees",
        type: !!employee ? "update" : "new",
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Submission Failed",
        message:
          error?.message || "An error occurred while saving the employee.",
      });
    }
  };

  useEffect(() => {
    if (employee) {
      reset({
        ...defaultFormData,
        ...employee,
        hourly_rate:
          employee.hourly_rate == null
            ? ""
            : Number(employee.hourly_rate).toFixed(2),
        dob: employee.dob ? new Date(employee.dob) : defaultFormData.dob,
        start_date: employee.start_date
          ? new Date(employee.start_date)
          : defaultFormData.start_date,
      });
    }
  }, [employee, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 h-[80vh] min-w-[50vw] overflow-y-auto p-6">
      {/* Profile section */}
      <div className="flex justify-center">
        <ProfileImageSection
          item={employee}
          bucket="avatars"
          path="employees"
          table="Employees"
          width="w-52"
          height="h-52"
          noImageText={initials || "NA"}
          onImageChange={() => {
            queryClient.invalidateQueries(["Employee", employee.id]);
          }}
        />
        <div className="ml-6 flex flex-1 flex-col justify-center gap-1">
          {/* First Name */}
          <Controller
            name="first_name"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                required
                label="First Name"
                placeholder="e.g. John"
                {...field}
                icon={IoText}
                error={fieldState.error}
              />
            )}
          />

          {/* Middle Name */}
          <Controller
            name="middle_name"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="Middle Name"
                placeholder="e.g. William"
                {...field}
                icon={IoText}
                error={fieldState.error}
              />
            )}
          />

          {/* Surname */}
          <Controller
            name="surname"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                required
                label="Surname"
                placeholder="e.g. Doe"
                {...field}
                icon={IoText}
                error={fieldState.error}
              />
            )}
          />
        </div>
      </div>

      {/* Grid layout for fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        <div className="col-span-2">
          {/* Date of Birth */}
          <Controller
            name="dob"
            control={control}
            render={({ field, fieldState }) => (
              <DatePicker
                required
                label="Date of Birth"
                currentDate={field.value}
                onChange={field.onChange}
                defaultPageDate={new Date("1990-01-01")}
                placeholder="Select date of birth..."
                {...field}
                error={fieldState.error}
              />
            )}
          />
        </div>
        {/* Gender */}
        <Controller
          name="gender"
          control={control}
          render={({ field, fieldState }) => (
            <RHFComboBox
              required
              label="Gender"
              icon={IoMaleFemaleOutline}
              placeholder="Select gender..."
              {...field}
              error={fieldState.error}
              options={[
                { id: "male", value: "male", name: "Male" },
                { id: "female", value: "female", name: "Female" },
              ]}
            />
          )}
        />
        {/* Job Title */}
        <Controller
          name="job_title"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              required
              label="Job Title"
              placeholder="e.g. Head Housekeeper"
              {...field}
              icon={IoBriefcaseOutline}
              error={fieldState.error}
            />
          )}
        />
        {/* Email */}
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label="Email"
              icon={TfiEmail}
              placeholder="e.g. john.doe@example.com"
              {...field}
              error={fieldState.error}
            />
          )}
        />
        {/* Phone Number */}
        <Controller
          name="phone"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label="Phone Number"
              icon={HiOutlinePhone}
              placeholder="e.g. 07456321569"
              {...field}
              error={fieldState.error}
            />
          )}
        />
        <div className="col-span-2">
          {/* Address */}
          <Controller
            name="address"
            control={control}
            render={({ field, fieldState }) => (
              <RHFTextAreaInput
                required
                label="Address"
                placeholder="e.g. 23 Baker Street, London, UK, NW1 6XE"
                rows={2}
                icon={IoLocationOutline}
                {...field}
                error={fieldState.error}
              />
            )}
          />
        </div>
        <div className="col-span-2">
          <Controller
            name="start_date"
            control={control}
            render={({ field, fieldState }) => (
              <DatePicker
                required
                label="Start of Employment"
                currentDate={field.value}
                onChange={field.onChange}
                placeholder="Select start date..."
                {...field}
                error={fieldState.error}
              />
            )}
          />
        </div>

        <div className="col-span-1">
          {/* Hourly Rate */}
          <Controller
            name="hourly_rate"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                dataType="number"
                prefix="£"
                label="Hourly Rate"
                placeholder="e.g. 15.00"
                {...field}
                error={fieldState.error}
                icon={IoBriefcaseOutline}
              />
            )}
          />
        </div>

        {/* NI Number */}
        <Controller
          name="ni_number"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              icon={PiPassword}
              label="NI Number"
              placeholder="Enter NI number..."
              {...field}
              error={fieldState.error}
            />
          )}
        />
        {/* Driver */}
        <Controller
          name="is_driver"
          control={control}
          render={({ field, fieldState }) => (
            <ToggleButton
              label="Driver License Holder"
              trueLabel="Yes"
              falseLabel="No"
              icon={TbSteeringWheel}
              checked={field.value}
              onChange={field.onChange}
              error={fieldState.error}
            />
          )}
        />
        {/* Driver License Number */}
        <Controller
          name="is_cscs"
          control={control}
          render={({ field, fieldState }) => (
            <ToggleButton
              label="CSCS Card Holder"
              trueLabel="Yes"
              falseLabel="No"
              icon={FaRegIdCard}
              checked={field.value}
              onChange={field.onChange}
              error={fieldState.error}
            />
          )}
        />
        <Controller
          name="is_active"
          control={control}
          render={({ field, fieldState }) => (
            <ToggleButton
              label="Active Employee"
              trueLabel="Active"
              falseLabel="Inactive"
              checked={field.value}
              onChange={field.onChange}
              error={fieldState.error}
            />
          )}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        <CTAButton
          type="cancel"
          text="Revert"
          icon={RxReset}
          callbackFn={() => reset()}
        />

        <CTAButton
          type="success"
          text="Save"
          disabled={!isDirty || !isValid || isSubmitting}
          icon={GiSaveArrow}
          callbackFn={handleSubmit(onSubmit)}
        />
      </div>
    </form>
  );
};

export default EmployeeForm;
