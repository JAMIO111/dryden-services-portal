import { useMemo, useState } from "react";
import { useUser } from "@/contexts/UserProvider";
import DateRangePicker from "@components/ui/DateRangePicker";
import {
  getGreeting,
  getStartOfMonth,
  getEndOfMonth,
} from "@/lib/HelperFunctions";
import BookingVolumeChart from "@components/charts/StackedBarChart";
import CategoryBarChart from "@components/charts/CategoryBarChart";
import CategoryPieChart from "@components/charts/CategoryPieChart";
import DashboardCard from "@components/dashboard/DashboardCard";
import { useBookingVolume } from "@/hooks/useBookingVolume";
import { useBookingsByProperty } from "@/hooks/useBookingsByProperty";
import { useProperties } from "@/hooks/useProperties";
import { useOwners } from "@/hooks/useOwners";
import { getPeriodLabel } from "@/lib/utils";
import { CgClose } from "react-icons/cg";
import { BsHouses } from "react-icons/bs";
import { MdPeopleOutline, MdOutlinePublishedWithChanges } from "react-icons/md";
import { IoCalendarOutline } from "react-icons/io5";

// Validated against the dataviz skill's palette checker (lightness band,
// chroma floor, CVD separation) - semantic colors for package tiers, not
// the app's generic categorical chart palette, since these names carry
// their own meaning independent of category order.
const PACKAGE_COLORS = {
  Gold: "#ca8a04",
  Silver: "#3e7cae",
  Bronze: "#b45309",
  Unmanaged: "var(--chart-1)",
};

const Dashboard = () => {
  const { profile } = useUser();
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Every mount (i.e. every time the user navigates to the dashboard)
  // should default to the current month, not whatever range was left
  // selected last time.
  const [selectedRange, setSelectedRange] = useState(() => {
    const now = new Date();
    return { startDate: getStartOfMonth(now), endDate: getEndOfMonth(now) };
  });

  const memoisedRange = useMemo(
    () => selectedRange,
    [selectedRange.startDate, selectedRange.endDate]
  );

  // Fixed trailing 12-month window, deliberately independent of the date
  // filter above - this chart is meant to always show the same "last 12
  // months" trend regardless of what range the rest of the dashboard is
  // scoped to.
  const last12MonthsRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    return { startDate: getStartOfMonth(start), endDate: getEndOfMonth(now) };
  }, []);

  const { data: last12MonthsData } = useBookingVolume(
    last12MonthsRange.startDate,
    last12MonthsRange.endDate
  );

  const { data: bookingsByProperty } = useBookingsByProperty(
    memoisedRange.startDate,
    memoisedRange.endDate
  );

  const { data: properties, isLoading: isPropertiesLoading } = useProperties();
  const { data: owners, isLoading: isOwnersLoading } = useOwners();

  const packageBreakdown = useMemo(() => {
    if (!properties) return [];

    const counts = properties.reduce((acc, property) => {
      const name = property.Packages?.name || "Unmanaged";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [properties]);

  const activePropertiesCount = useMemo(
    () => properties?.filter((p) => p.is_active).length,
    [properties]
  );

  const activeOwnersCount = useMemo(
    () => owners?.filter((o) => o.is_active).length,
    [owners]
  );

  const bookingsThisMonth =
    last12MonthsData?.[last12MonthsData.length - 1]?.bookings;

  const totalBookingsLast12Months = last12MonthsData?.reduce(
    (sum, month) => sum + month.bookings,
    0
  );

  return (
    <div className="h-full w-full">
      {previewModalOpen && (
        <div
          onClick={() => setPreviewModalOpen(false)}
          className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-bg h-[95vh] shadow-l rounded-2xl p-3 border border-border-color relative w-fit overflow-hidden min-w-[300px]">
            <div className="flex justify-between select-none pb-2 border-b border-border-color items-center text-primary-text rounded-t-xl">
              <h3 className="text-lg pl-2 select-none text-primary-text font-semibold">
                {`Job Sheet Preview`}
              </h3>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="group flex justify-center items-center p-1.5 cursor-pointer transition-colors duration-300 hover:text-error-color hover:bg-border-color/50 rounded-lg">
                <CgClose className="h-5 w-5 transition-colors duration-300 group-hover:text-error-color text-primary-text" />
              </button>
            </div>

            <div className="h-full overflow-y-auto p-2"></div>
          </div>
        </div>
      )}
      <div className="flex flex-col h-full w-full bg-primary-bg">
        <div className="flex flex-row items-center justify-between gap-2 px-6 py-1 shadow-sm border-b border-border-color shrink-0 bg-primary-bg">
          <div className="flex flex-col">
            <h1 className="text-xl whitespace-nowrap text-primary-text">
              Business Dashboard
            </h1>
            <p className="text-sm text-secondary-text">
              {getGreeting()}, {profile?.first_name || "User"}!
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row items-center justify-between">
            <div className="w-full gap-3 md:w-fit flex flex-wrap items-center justify-start xl:justify-center">
              <DateRangePicker
                alignment="right"
                width="w-10 sm:w-64 md:w-80"
                compact
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
        <div className="flex flex-col lg:flex-row gap-3 p-3 flex-grow overflow-y-auto lg:overflow-hidden">
          <div className="flex flex-col gap-3 flex-1 lg:flex-8 lg:min-h-0">
            <div className="flex flex-col lg:flex-row gap-3 flex-1">
              <div className="min-h-64 lg:min-h-0 lg:flex-3">
                <BookingVolumeChart
                  data={last12MonthsData}
                  subtitle="Last 12 months"
                />
              </div>
              <div className="min-h-64 lg:min-h-0 lg:flex-2">
                <CategoryPieChart
                  data={packageBreakdown}
                  dataKey="count"
                  nameKey="name"
                  title="Properties by Package"
                  subtitle="Current portfolio"
                  colorMap={PACKAGE_COLORS}
                />
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-3 flex-1">
              <div className="min-h-64 lg:min-h-0 flex-1">
                <CategoryBarChart
                  data={bookingsByProperty}
                  dataKey="bookings"
                  categoryKey="property"
                  valueLabel="Bookings"
                  title="Bookings by Property"
                  subtitle={`Top properties for ${getPeriodLabel(
                    memoisedRange.startDate,
                    memoisedRange.endDate,
                    "current"
                  )}`}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-row flex-wrap lg:flex-col gap-3 lg:flex-4 lg:overflow-y-auto">
            <div className="h-28 w-full shrink-0">
              <DashboardCard
                title="Active Properties"
                value={activePropertiesCount}
                icon={BsHouses}
                isLoading={isPropertiesLoading}
                link="/Client-Management/Properties"
              />
            </div>
            <div className="h-28 w-full shrink-0">
              <DashboardCard
                title="Active Owners"
                value={activeOwnersCount}
                icon={MdPeopleOutline}
                isLoading={isOwnersLoading}
                link="/Client-Management/Owners"
              />
            </div>
            <div className="h-28 w-full shrink-0">
              <DashboardCard
                title="Bookings This Month"
                value={bookingsThisMonth}
                icon={MdOutlinePublishedWithChanges}
                link="/Jobs/Bookings"
              />
            </div>
            <div className="h-28 w-full shrink-0">
              <DashboardCard
                title="Bookings (Last 12 Months)"
                value={totalBookingsLast12Months}
                icon={IoCalendarOutline}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
