import React, { useState } from "react";
import { fetchAll } from "../api/supabaseApi";
import { useQuery } from "@tanstack/react-query";
import { useGlobalSearch } from "../contexts/SearchProvider";
import CTAButton from "./CTAButton";
import { HiOutlinePencil } from "react-icons/hi2";
import { IoPersonAdd } from "react-icons/io5";
import { useModal } from "@/contexts/ModalContext";
import EmployeeForm from "./forms/EmployeeForm.jsx";

const Employees = () => {
  const { openModal } = useModal();
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase();
    const lastInitial = lastName?.charAt(0)?.toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["Employees"],
    queryFn: () => fetchAll("Employees"),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const { debouncedSearchTerm } = useGlobalSearch();

  const filteredData = debouncedSearchTerm
    ? data?.filter((employee) => {
        const term = debouncedSearchTerm.toLowerCase();
        return (
          employee.first_name?.toLowerCase().includes(term) ||
          employee.surname?.toLowerCase().includes(term) ||
          employee.job_title?.toLowerCase().includes(term) ||
          employee.email?.toLowerCase().includes(term) ||
          employee.phone?.toLowerCase().includes(term) ||
          term === (employee.is_active ? "active" : "inactive")
        );
      })
    : data;

  const handleAddEmployee = () => {
    openModal({
      title: "Add New Employee",
      content: <EmployeeForm employee={null} />,
    });
  };

  const handleEditEmployee = () => {
    openModal({
      title: "Edit Employee Details",
      content: <EmployeeForm employee={selectedEmployee} />,
    });
  };

  const getStatusPill = (status) => {
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          status
            ? "bg-green-500/20 text-green-600 border border-green-500/40"
            : "bg-red-500/20 text-red-600 border border-red-500/40"
        }`}>
        {status ? "Active" : "Inactive"}
      </span>
    );
  };

  return (
    <div className="flex bg-primary-bg flex-1 overflow-auto flex-col gap-5 p-5">
      <div className="flex flex-row justify-between h-7 items-center">
        <p className="text-primary-text text-xl font-semibold pl-1">
          Employee Directory
        </p>
        <div className="flex flex-row gap-2 pr-6">
          {selectedEmployee && (
            <CTAButton
              text={"Edit Details"}
              icon={HiOutlinePencil}
              type={"neutral"}
              callbackFn={handleEditEmployee}
            />
          )}
          <CTAButton
            text={"Add Employee"}
            icon={IoPersonAdd}
            type={"main"}
            callbackFn={handleAddEmployee}
          />
        </div>
      </div>

      <div className="flex flex-1 w-full shadow-s overflow-hidden bg-secondary-bg rounded-xl flex-col">
        <div className="flex text-secondary-text p-2 px-4 font-medium border-b border-secondary-text/20">
          <div className="flex-1 flex items-start gap-3">
            {/* Invisible avatar placeholder for alignment */}
            <div className="w-10 h-6 rounded-full opacity-0" />
            <span>Name</span>
          </div>
          <div className="flex-1">Job Title</div>
          <div className="flex-1">Email</div>
          <div className="flex-1">Phone</div>
          <div className="w-30">Status</div>
        </div>
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {isLoading ? (
            <div className="p-4 text-center text-primary-text">
              Loading Employees...
            </div>
          ) : filteredData?.length === 0 ? (
            <div className="p-4 text-center text-primary-text">
              No employees found.
            </div>
          ) : (
            filteredData.map((employee, index) => (
              <div
                onClick={
                  selectedEmployee?.id === employee.id
                    ? () => setSelectedEmployee(null)
                    : () => setSelectedEmployee(employee)
                }
                key={employee.id}
                className={`${
                  selectedEmployee?.id === employee.id
                    ? "bg-cta-color/20 hover:bg-cta-color/20"
                    : "bg-tertiary-bg hover:bg-cta-color/10"
                } flex text-secondary-text border-secondary-text/10 p-2 px-4 items-center ${
                  index === filteredData.length - 1 ? "" : "border-b"
                }  transition-colors`}>
                <div className="flex-1 flex items-center gap-3">
                  {employee?.avatar ? (
                    <img
                      src={employee.avatar}
                      alt={employee.first_name}
                      className="w-10 h-10 rounded-full object-cover border border-secondary-text/30"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-bg flex items-center justify-center border border-secondary-text/30">
                      <p className="text-secondary-text text-2lg">
                        {getInitials(employee.first_name, employee.surname)}
                      </p>
                    </div>
                  )}

                  <span>
                    {employee.first_name} {employee.surname}
                  </span>
                </div>
                <div className="flex-1">{employee.job_title || "-"}</div>
                <div className="flex-1">{employee.email || "-"}</div>
                <div className="flex-1">{employee.phone || "-"}</div>
                <div className="w-30">{getStatusPill(employee.is_active)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Employees;
