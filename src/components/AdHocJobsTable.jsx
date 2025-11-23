import { useState, useEffect, useRef } from "react";
import AdHocJobRow from "./AdHocJobRow";
import { IoCalendarOutline, IoPeopleOutline } from "react-icons/io5";
import { CiTextAlignLeft } from "react-icons/ci";
import { FaUser } from "react-icons/fa6";
import DataNavBar from "./DataNavBar";

const AdHocJobsTable = ({
  isLoading, //Required
  handleActiveModalType, //Required
  selectedItem, //Required
  setSelectedItem, //Required
  onOpenModal,
  onRefresh, //Required
  costData, //Required
  data, //Required
  selectedRows, //Required - Checkbox
  isSelected, //Required - Checkbox
  onToggle, //Required - Checkbox
  onSelectAll, //Required - Checkbox
  onClearAll, //Required - Checkbox
  page,
  pageSize,
  totalCount,
  setPage,
  setPageSize,
}) => {
  const [openModalRowId, setOpenModalRowId] = useState(null);
  const [modalPos, setModalPos] = useState(null);
  const [activeModalType, setActiveModalType] = useState(null); // Required

  console.log("Selected Rows:", selectedRows.length);
  console.log("Total Count:", totalCount);
  console.log("Bookings Data.count:", data?.count);

  const selectAllCheckbox = useRef(null);

  const pageLimit = totalCount < pageSize ? totalCount : pageSize;
  const allSelected =
    selectedRows?.length === pageLimit && pageSize > 0 && totalCount > 0;
  const noneSelected = selectedRows?.length === 0;
  const someSelected = !allSelected && !noneSelected;

  useEffect(() => {
    if (selectAllCheckbox.current) {
      selectAllCheckbox.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleHeaderCheckbox = () => {
    if (allSelected) {
      onClearAll();
    } else {
      onSelectAll(data?.data);
    }
  };

  const handleRowClick = (item) => {
    setSelectedItem((prev) => (prev === item ? null : item));
    console.log("Row selected:", item.id);
  };

  useEffect(() => {
    const handleScroll = () => {
      setOpenModalRowId(null);
      setModalPos(null);
    };
    if (openModalRowId !== null) {
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [openModalRowId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpenModalRowId(null);
        setModalPos(null);
        setModalItem(null);
      }
    };
    if (openModalRowId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openModalRowId]);

  const rows = Array.isArray(data?.data) ? data.data : [];

  return (
    <div className="flex h-full shadow-md flex-col border relative border-border-color rounded-2xl max-h-[100vh] overflow-y-auto min-h-[14px]">
      <div className="flex-1 text-[13px] bg-secondary-bg overflow-y-auto relative">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b border-border-color th-sticky">
              <th className="pl-2 pr-2">
                <div className="table-header">
                  <p className="text-transparent">
                    <input
                      id="checkbox-select-all"
                      name="checkbox-select-all"
                      type="checkbox"
                      ref={selectAllCheckbox}
                      checked={allSelected}
                      onChange={handleHeaderCheckbox}
                      className="cursor-pointer"></input>
                  </p>
                </div>
              </th>
              <th>
                <div className="table-header">
                  <span className="font-normal">#</span> Booking ID
                </div>
              </th>
              <th>
                <div className="table-header">
                  <IoPeopleOutline /> Property
                </div>
              </th>
              <th>
                <div className="table-header max-w-28">
                  <IoCalendarOutline /> Start Date
                </div>
              </th>
              <th>
                <div className="table-header max-w-28">
                  <IoCalendarOutline /> End Date
                </div>
              </th>
              <th>
                <div className="table-header">Job Type</div>
              </th>
              <th>
                <div className="table-header">
                  <CiTextAlignLeft /> Notes
                </div>
              </th>
              <th>
                <div className="text-transparent h-full table-header">
                  <p className="text-transparent">.</p>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {totalCount === 0 ? (
              <tr>
                <td colSpan="14" className="text-center py-6 text-muted">
                  No Ad-Hoc Jobs found.
                </td>
              </tr>
            ) : (
              rows.map((item, index) => (
                <AdHocJobRow
                  handleRowClick={() => handleRowClick(item)}
                  key={item.id || index} //Required
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  item={item} //Required
                  openModalRowId={openModalRowId}
                  setOpenModalRowId={setOpenModalRowId}
                  modalPos={modalPos}
                  setModalPos={setModalPos}
                  onOpenModal={onOpenModal}
                  costData={costData} //Required
                  handleActiveModalType={handleActiveModalType} //Required
                  checked={isSelected(item.id)}
                  onToggle={onToggle}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      <DataNavBar
        isLoading={isLoading}
        onRefresh={onRefresh}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        setPageSize={setPageSize}
        onPageChange={setPage}
      />
    </div>
  );
};

export default AdHocJobsTable;
