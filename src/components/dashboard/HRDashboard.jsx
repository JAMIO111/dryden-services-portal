import React from "react";
import { useUser } from "@/contexts/UserProvider";
import { PiFilePlus } from "react-icons/pi";
import DateRangePicker from "../ui/DateRangePicker";
import CTAButton from "../CTAButton";
import { getGreeting } from "@/lib/HelperFunctions";
import { useState, useMemo } from "react";

const HRDashboard = () => {
  const { profile } = useUser();
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
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
    <div className="flex flex-col h-full w-full">
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
            <CTAButton
              callbackFn={() => setPreviewModalOpen(true)}
              type="main"
              text="Preview Job Sheets"
              icon={PiFilePlus}
            />
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
      <div className="flex flex-col flex-1 p-3 gap-3 bg-red-500">
        <div className="flex flex-row h-35 bg-green-500"></div>
        <div className="flex flex-row flex-1 bg-green-500"></div>
      </div>
    </div>
  );
};

export default HRDashboard;
