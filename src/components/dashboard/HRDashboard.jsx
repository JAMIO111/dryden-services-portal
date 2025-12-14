import { useUser } from "@/contexts/UserProvider";
import { PiUsersThree } from "react-icons/pi";
import { FaUmbrellaBeach } from "react-icons/fa";
import { MdOutlineSick } from "react-icons/md";
import DateRangePicker from "../ui/DateRangePicker";
import { getGreeting } from "@/lib/HelperFunctions";
import { useState, useMemo } from "react";
import DashboardCard from "./DashboardCard";
import { useEmployees } from "@/hooks/useEmployees";
import AbsenceList from "../AbsenceList";

const HRDashboard = () => {
  const { profile } = useUser();
  const { data: employees, isLoading } = useEmployees();
  const today = useMemo(() => new Date(), []);
  const end = useMemo(() => {
    const s = new Date(today);
    s.setDate(today.getDate() + 14);
    return s;
  }, [today]);

  const [selectedRange, setSelectedRange] = useState({
    startDate: today,
    endDate: end,
  });
  const memoisedRange = useMemo(() => {
    return {
      startDate: selectedRange.startDate,
      endDate: selectedRange.endDate,
    };
  }, [selectedRange]);

  return (
    // HRDashboard
    <div className="flex flex-col h-full bg-primary-bg w-full">
      {/* Header */}
      <div className="flex flex-col gap-2 xl:flex-row items-start xl:items-center justify-between px-6 py-1 shadow-sm border-b border-border-color shrink-0 bg-primary-bg">
        <div className="flex flex-col">
          <h1 className="text-xl whitespace-nowrap text-primary-text">
            Human Resources Dashboard
          </h1>
          <p className="text-sm text-secondary-text">
            {getGreeting()}, {profile?.first_name || "User"}!
          </p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row items-center justify-between">
          <div className="w-full gap-3 md:w-fit flex items-center justify-start xl:justify-center">
            <DateRangePicker
              alignment="right"
              width="w-80"
              rangeCounter={false}
              onChange={setSelectedRange}
              value={memoisedRange}
              presets={[
                "Last Week",
                "This Week",
                "Next Week",
                "Last Month",
                "This Month",
                "Next Month",
                "Next 7 Days",
                "Next 30 Days",
              ]}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden p-3 gap-3">
        <div className="flex flex-row gap-3 shrink-0">
          <DashboardCard
            title="Total Employees"
            value={employees?.filter((emp) => emp.is_active).length}
            icon={PiUsersThree}
            link="/Human-Resources/Employees"
            isLoading={isLoading}
          />
          <DashboardCard title="Holidays" icon={FaUmbrellaBeach} />
          <DashboardCard title="Sick Leave" icon={MdOutlineSick} />
        </div>

        {/* Absence List + Placeholder */}
        <div className="flex flex-1 flex-row gap-3 overflow-hidden">
          {/* Absence List */}
          <div className="flex-[2] flex flex-col overflow-hidden rounded-2xl shadow-s bg-secondary-bg">
            <AbsenceList
              startDate={selectedRange.startDate}
              endDate={selectedRange.endDate}
            />
          </div>

          {/* Placeholder */}
          <div className="flex-[2] flex justify-center items-center text-primary-text text-xl bg-secondary-bg rounded-2xl shadow-s">
            More to come soon!
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
