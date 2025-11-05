import React from "react";
import ProfileImageSection from "../ProfileImageSection";
import { useEmployeeById } from "@/hooks/useEmployeeById";
import { useQueryClient } from "@tanstack/react-query";
import { Controller } from "react-hook-form";
import TextInput from "../ui/TextInput";
import { IoText } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OwnerFormSchema } from "../../validationSchema";

const defaultFormData = {
  id: null,
  first_name: "",
  surname: "",
};

const EmployeeForm = ({ employeeId }) => {
  const queryClient = useQueryClient();
  const { data: employee, isLoading } = useEmployeeById(employeeId);

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
    resolver: zodResolver(EmployeeFormSchema),
    mode: "all",
    defaultValues: defaultFormData,
    delayError: 250,
  });

  const initials = `${employee?.first_name?.charAt(0) || ""}${
    employee?.surname?.charAt(0) || ""
  }`.toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <ProfileImageSection
          item={employee}
          bucket="avatars"
          path="employees"
          table="Employees"
          width="w-36"
          height="h-36"
          noImageText={initials || "NA"}
          onImageChange={(url) => {
            // Optional: update your parent state, e.g. via TanStack Query invalidate
            queryClient.invalidateQueries(["Employee", employee.id]);
            console.log("New avatar URL:", url);
          }}
        />
        <div className="flex flex-1 flex-col gap-2">
          <Controller
            name="first_name"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                required={true}
                label="First Name"
                placeholder="Enter first name..."
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
                placeholder="Enter surname..."
                {...field}
                icon={IoText}
                error={fieldState.error}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
