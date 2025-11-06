import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoText } from "react-icons/io5";
import { useQueryClient } from "@tanstack/react-query";
import { useEmployeeById } from "@/hooks/useEmployeeById";
import { EmployeeFormSchema } from "../../validationSchema";
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

const defaultFormData = {
  id: null,
  first_name: "",
  surname: "",
  gender: "",
  job_title: "",
  dob: new Date("1990-01-01"),
  email: "",
  phone: "",
  address: "",
  ni_number: "",
  is_driver: false,
};

const EmployeeForm = ({ employee }) => {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(EmployeeFormSchema),
    mode: "onChange",
    defaultValues: defaultFormData,
  });

  const initials = `${employee?.first_name?.[0] ?? ""}${
    employee?.surname?.[0] ?? ""
  }`.toUpperCase();

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
  };

  useEffect(() => {
    if (employee) {
      reset({
        ...defaultFormData,
        ...employee,
        dob: employee.dob ? new Date(employee.dob) : defaultFormData.dob,
      });
    }
  }, [employee, reset]);

  console.log("Rendering EmployeeForm with employee:", employee);

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
                onDateChange={field.onChange}
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
        {/* NI Number */}
        <Controller
          name="ni_number"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              required
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
          callbackFn={() => console.log("Revert Button Clicked")}
        />

        <CTAButton
          type="success"
          text="Save"
          icon={GiSaveArrow}
          callbackFn={() => console.log("CTA Button Clicked")}
        />
      </div>
    </form>
  );
};

export default EmployeeForm;
