import { useUser } from "@/contexts/UserProvider";
import { PiUsersThree } from "react-icons/pi";
import { FaUmbrellaBeach } from "react-icons/fa";
import { MdOutlineSick } from "react-icons/md";
import DateRangePicker from "../ui/DateRangePicker";
import { getGreeting } from "@/lib/HelperFunctions";
import { useState, useMemo } from "react";
import DashboardCard from "./DashboardCard";

const MaintenanceDashboard = () => {
  const { profile } = useUser();
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
    <div className="flex flex-col bg-primary-bg h-full w-full">
      <div className="flex flex-col gap-2 xl:flex-row items-start xl:items-center justify-between px-6 py-1 shadow-sm border-b border-border-color shrink-0 bg-primary-bg">
        <div className="flex flex-col">
          <h1 className="text-xl whitespace-nowrap text-primary-text">
            Maintenance Dashboard
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
      <div className="flex flex-col flex-1 ">
        <div className="flex flex-row p-3 gap-3">
          <DashboardCard title="Jobs Pending" value={5} icon={PiUsersThree} />
          <DashboardCard
            title="Jobs Completed"
            value={8}
            icon={FaUmbrellaBeach}
          />
          <DashboardCard title="Contractors" value={18} icon={MdOutlineSick} />
        </div>
        <div className="flex flex-row flex-1 p-3 pt-0 gap-3">
          <div className="flex-3 flex justify-center items-center text-primary-text text-xl bg-secondary-bg rounded-2xl shadow-s">
            More to come soon!
          </div>
          <div className="flex-2 flex justify-center items-center text-primary-text text-xl bg-secondary-bg rounded-2xl shadow-s">
            More to come soon!
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
