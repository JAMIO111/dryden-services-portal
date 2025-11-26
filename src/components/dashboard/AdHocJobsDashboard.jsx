import { useState, useMemo, useRef, useEffect } from "react";
import { PiFilePlus } from "react-icons/pi";
import DateRangePicker from "../ui/DateRangePicker";
import { useUser } from "@/contexts/UserProvider";
import CTAButton from "../CTAButton";
import { useNavigate } from "react-router-dom";
import { getGreeting } from "@/lib/HelperFunctions";
import AdHocJobsTable from "../AdHocJobsTable";
import { useAdHocJobs } from "@/hooks/useAdHocJobs";
import { useAdHocJobsFilters } from "@/hooks/useAdHocJobsFilters";
import { useSearchParams, useLocation } from "react-router-dom";
import { useGlobalSearch } from "@/contexts/SearchProvider";
import ActionsModal from "@components/ActionsModal";
import IconButton from "@components/IconButton";
import { BsSliders } from "react-icons/bs";
import FilterPane from "@components/FilterPane";
import { useModal } from "@/contexts/ModalContext";
import AdHocJobForm from "../forms/AdHocJobForm";
import { BiSolidArrowToRight } from "react-icons/bi";

const AdHocJobsDashboard = () => {
  const location = useLocation();
  const { openModal } = useModal();
  const navigate = useNavigate();
  const { profile } = useUser();
  const [sortColumn, setSortColumn] = useState("sort_date_start");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedItem, setSelectedItem] = useState(null); // Required
  const [modalPos, setModalPos] = useState(null); // Required
  const [activeModalType, setActiveModalType] = useState(null); // Required
  const [costData, setCostData] = useState(false); // Required
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "25", 10);
  const modalRef = useRef(null);
  const today = useMemo(() => new Date(), []);
  const end = useMemo(() => {
    const s = new Date(today);
    s.setDate(today.getDate() + 14);
    return s;
  }, [today]);

  const [selectedRange, setSelectedRange] = useState(() => {
    return {
      startDate: location?.state?.startDate ?? today,
      endDate: location?.state?.endDate ?? end,
    };
  });

  const memoisedRange = useMemo(
    () => selectedRange,
    [selectedRange.startDate, selectedRange.endDate]
  );

  const setPage = (newPage) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", newPage);
      return params;
    });
  };

  const setPageSize = (newPageSize) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("pageSize", newPageSize);
      return params;
    });
  };

  const {
    data: adHocJobsData,
    isFetching: isAdHocJobsLoading,
    error,
    refetch,
  } = useAdHocJobs({
    sortColumn,
    sortOrder,
    page,
    pageSize,
    startDate: memoisedRange.startDate,
    endDate: memoisedRange.endDate,
  });

  console.log("Ad-Hoc Jobs Dashboard - Ad-Hoc Jobs Data:", adHocJobsData);

  useEffect(() => {
    // Reset any local state that should clear when type changes
    setSelectedRows([]);
    setSelectedItem(null);
    setCostData(false);

    // Optionally refetch data if your hook depends on 'type'
    refetch();

    // Reset pagination
    if (page !== 1) {
      setPage(1);
    }
  }, []);

  const totalCount = adHocJobsData?.count || 0;
  const { debouncedSearchTerm } = useGlobalSearch();
  const { updateFilters } = useAdHocJobsFilters();

  const isSelected = (id) => selectedRows.some((row) => row.id === id);

  const handleToggle = (row) => {
    setSelectedRows((prev) =>
      isSelected(row.id) ? prev.filter((r) => r.id !== row.id) : [...prev, row]
    );
  };

  const handleSelectAll = (allRows) => {
    setSelectedRows(allRows);
  };

  const handleClearAll = () => {
    setSelectedRows([]);
  };

  useEffect(() => {
    updateFilters((prev) => ({ ...prev, search: debouncedSearchTerm }));
    if (page !== 1) {
      setPage(1);
    }
  }, [debouncedSearchTerm]);

  const handleActiveModalType = (type) => {
    setActiveModalType((prev) => (prev === type ? null : type));
  };

  const handleOpenModal = (position) => {
    setModalPos(position);
  };

  const handleCloseModal = () => {
    setModalPos(null);
    setActiveModalType(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setActiveModalType(null);
        setModalPos(null);
      }
    };

    const handleScroll = () => {
      setActiveModalType(null);
      setModalPos(null);
    };

    if (modalPos !== null) {
      document.addEventListener("click", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true); // true for capturing phase, catches scrolls on all ancestors
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [modalPos]);

  const activeFilters = [
    "property",
    "leadGuest",
    "bookingRef",
    "managementPackage",
    "type",
  ].filter((key) => searchParams.get(key));
  const filterCount = activeFilters.length;

  const handleAdHocJob = () => {
    openModal({
      title: "Ad-Hoc Job Booking",
      content: (
        <div
          className="min-w-[600px] overflow-hidden min-h-0 h-[80vh] p-4"
          ref={modalRef}>
          <AdHocJobForm />
        </div>
      ),
    });
  };

  return (
    <div className="flex bg-primary-bg flex-col flex-grow overflow-hidden">
      <div className="flex flex-col gap-2 xl:flex-row items-start  xl:items-center justify-between px-6 py-1 shadow-sm border-b border-border-color shrink-0 bg-primary-bg">
        <div className="flex flex-col">
          <h1 className="text-xl whitespace-nowrap text-primary-text">
            Ad-hoc Jobs Dashboard
          </h1>
          <p className="text-sm text-secondary-text">
            {getGreeting()}, {profile?.first_name || "User"}!
          </p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row items-center justify-between">
          <div className="w-full gap-3 md:w-fit flex items-center justify-start xl:justify-center">
            <CTAButton
              callbackFn={() => navigate("/Jobs/Bookings")}
              type="secondary"
              text="Go to Bookings"
              icon={BiSolidArrowToRight}
            />
            <CTAButton
              callbackFn={handleAdHocJob}
              type="main"
              text="Create Job"
              icon={PiFilePlus}
            />
            <IconButton
              count={filterCount}
              selected={activeModalType === "Filter"}
              color="blue"
              title="Filter"
              callback={handleActiveModalType}
              icon={<BsSliders className="h-4.5 w-4.5" />}
            />
            {activeModalType === "Filter" && (
              <FilterPane onClose={handleCloseModal} />
            )}
            <DateRangePicker
              rangeCounterText="Days"
              alignment="right"
              width="w-80"
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
      <div className="p-3 flex-1">
        <AdHocJobsTable
          isLoading={isAdHocJobsLoading}
          onOpenModal={handleOpenModal}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          data={adHocJobsData}
          costData={costData}
          handleActiveModalType={handleActiveModalType}
          onRefresh={refetch}
          selectedRows={selectedRows}
          isSelected={isSelected}
          onToggle={handleToggle}
          onSelectAll={handleSelectAll}
          onClearAll={handleClearAll}
          page={page}
          pageSize={pageSize}
          setPage={setPage}
          totalCount={totalCount}
          setPageSize={setPageSize}
        />
      </div>
      {activeModalType === "Actions" && (
        <ActionsModal
          item={selectedItem}
          position={modalPos}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default AdHocJobsDashboard;
