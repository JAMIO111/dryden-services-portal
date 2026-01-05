import { useState } from "react";
import { useGlobalSearch } from "../contexts/SearchProvider";
import CTAButton from "./CTAButton";
import { HiOutlinePencil } from "react-icons/hi2";
import { AiOutlineUserAdd } from "react-icons/ai";
import { useModal } from "@/contexts/ModalContext";
import EmployeeForm from "./forms/EmployeeForm.jsx";
import { useActiveEmployees, useInactiveEmployees } from "@/hooks/useEmployees";
import { BiSolidShow, BiSolidHide } from "react-icons/bi";
import ToggleButton from "./ui/ToggleButton";

const Employees = () => {
  const { openModal } = useModal();
  const [activeStatus, setActiveStatus] = useState("Active");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const {
    data: employees,
    isLoading,
    error,
  } = activeStatus === "Active" ? useActiveEmployees() : useInactiveEmployees(); // fetch inactive employees
  console.log("Employees:", employees);
  const [showHourlyRate, setShowHourlyRate] = useState(false);

  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase();
    const lastInitial = lastName?.charAt(0)?.toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  const { debouncedSearchTerm } = useGlobalSearch();

  const filteredData = employees?.filter((employee) => {
    // Filter by search term
    const termMatch = debouncedSearchTerm
      ? (
          employee.first_name?.toLowerCase() +
          employee.surname?.toLowerCase() +
          employee.job_title?.toLowerCase() +
          employee.email?.toLowerCase() +
          employee.phone?.toLowerCase()
        ).includes(debouncedSearchTerm.toLowerCase())
      : true;

    return termMatch;
  });

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
      <div className="rounded-lg flex w-20 bg-tertiary-bg">
        <span
          className={`py-1 w-20 text-center shadow-s rounded-lg text-sm font-medium ${
            status
              ? "bg-green-500/20 text-green-600"
              : "bg-red-500/20 text-red-600"
          }`}>
          {status ? "Active" : "Inactive"}
        </span>
      </div>
    );
  };

  return (
    <div className="flex bg-primary-bg flex-1 overflow-auto flex-col gap-5 pt-5 p-3">
      <div className="flex flex-row justify-between h-5 items-center">
        <p className="text-primary-text text-xl font-semibold pl-1">
          Employee Directory
        </p>
        <div className="flex flex-row gap-2">
          <div className="w-56">
            <ToggleButton
              checked={activeStatus === "Active"}
              onChange={(isActive) =>
                setActiveStatus(isActive ? "Active" : "All")
              }
              trueLabel="Active Employees"
              falseLabel="All Employees"
              verticalPadding={"py-1.25"}
            />
          </div>
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
            icon={AiOutlineUserAdd}
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
          <div className="flex gap-1 w-30">
            <span>Hourly Rate</span>
            <button
              onMouseDown={() => setShowHourlyRate(true)}
              onMouseUp={() => setShowHourlyRate(false)}
              onMouseLeave={() => setShowHourlyRate(false)}
              className="p-1 cursor-pointer hover:bg-tertiary-bg rounded-md">
              {showHourlyRate ? <BiSolidShow /> : <BiSolidHide />}
            </button>
          </div>
          <div className="w-25 text-center">Status</div>
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
                onDoubleClick={() => {
                  setSelectedEmployee(employee); // optional if you want to highlight
                  openModal({
                    title: "Edit Employee Details",
                    content: <EmployeeForm employee={employee} />, // use the clicked employee directly
                  });
                }}
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
                <div className="w-30">
                  {showHourlyRate
                    ? employee.hourly_rate != null &&
                      employee.hourly_rate !== ""
                      ? `£${Number(employee.hourly_rate).toFixed(2)}`
                      : "-"
                    : "*****"}
                </div>

                <div className="flex justify-center w-25">
                  {getStatusPill(employee.is_active)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Employees;
