import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoText } from "react-icons/io5";
import { useQueryClient } from "@tanstack/react-query";
import { EmployeeFormSchema } from "../../validationSchema";
import { useUpsertEmployee } from "@/hooks/useUpsertEmployee";
import { useTerminateContract } from "@/hooks/useTerminateContract";
import { useUpdateContract } from "@/hooks/useUpdateContract";
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
import { GrDocumentUpdate } from "react-icons/gr";
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
  contract_type: "",
};

const EmployeeForm = ({ employee }) => {
  const { createNotification } = useCreateNotification();
  const queryClient = useQueryClient();
  const upsertEmployee = useUpsertEmployee();
  const updateContract = useUpdateContract();
  const terminateContract = useTerminateContract();
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

  const formatDateForDateColumn = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSaveEmployee = async (data) => {
    try {
      const payload = {
        first_name: data.first_name,
        middle_name: data.middle_name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        address: data.address,
        dob: data.dob ? formatDateForDateColumn(new Date(data.dob)) : null,
        gender: data.gender,
        ni_number: data.ni_number,
        is_driver: data.is_driver,
        is_cscs: data.is_cscs,
      };

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

  const handleUpdateContract = async () => {
    if (!employee?.employee_period_id) return;

    await updateContract.mutateAsync({
      employeeId: employee.id,
      currentPeriodId: employee.employee_period_id,
      updates: {
        job_title: watch("job_title"),
        contract_type: watch("contract_type"),
        hourly_rate: watch("hourly_rate"),
      },
    });

    showToast({
      type: "success",
      title: "Contract Updated",
      message: "A new contract has been created with updated details.",
    });

    closeModal();
  };

  const handleTerminateEmployment = async () => {
    if (!employee?.employee_period_id) return;

    await terminateContract.mutateAsync({
      employeePeriodId: employee.employee_period_id,
    });

    showToast({
      type: "success",
      title: "Employment Ended",
      message: "The employee's contract has been terminated.",
    });

    closeModal();
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
      className="flex h-[80vh] min-w-[80vw] flex-row"
      onSubmit={handleSubmit(handleSaveEmployee)}>
      <div className="flex flex-col">
        <div className="flex flex-2 flex-col gap-4 overflow-y-auto p-6">
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
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 px-6 py-3">
          <CTAButton
            type="cancel"
            text="Revert"
            icon={RxReset}
            callbackFn={() => reset()}
            disabled={!isDirty || isSubmitting}
          />

          <CTAButton
            type="success"
            text="Save"
            disabled={!isDirty || !isValid || isSubmitting}
            icon={GiSaveArrow}
            callbackFn={handleSubmit(handleSaveEmployee)}
          />
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex flex-1 flex-col p-6 gap-4 overflow-y-auto">
          <h2 className="text-2xl font-semibold text-primary-text mb-1">
            {employee ? "Edit Employee" : "Add New Employee"}
          </h2>
          <Controller
            name="created_at"
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
          <Controller
            name="contract_type"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="Contract Type"
                placeholder="e.g. Full-Time, Part-Time"
                icon={IoText}
                {...field}
                error={fieldState.error}
              />
            )}
          />
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
        <div className="flex justify-end gap-3 py-3 px-6">
          {employee?.employee_period_id && (
            <CTAButton
              type="cancel"
              text="End Employment"
              icon={RxReset}
              callbackFn={handleTerminateEmployment}
            />
          )}
          <CTAButton
            type="success"
            text="Update Contract"
            icon={GrDocumentUpdate}
            callbackFn={handleUpdateContract}
          />
        </div>
      </div>
    </form>
  );
};

export default EmployeeForm;
