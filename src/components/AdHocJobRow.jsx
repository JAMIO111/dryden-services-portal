import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { IoEllipsisVertical } from "react-icons/io5";
import Pill from "@components/Pill";
import { useModal } from "@/contexts/ModalContext";
import AdHocJobForm from "@components/forms/AdHocJobForm";

const AdHocJobRow = ({
  item,
  selectedItem,
  setSelectedItem,
  handleRowClick,
  onOpenModal,
  handleActiveModalType,
  checked,
  onToggle,
}) => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const ellipsisRef = useRef(null);
  const selected = selectedItem?.id === item.id;
  const modalRef = useRef(null);

  const formattedStartDate = format(
    new Date(item.start_date || item.single_date),
    "EEE, d MMM yy"
  );
  const formattedEndDate = item.end_date
    ? format(new Date(item.end_date), "EEE, d MMM yy")
    : "-";

  const handleEllipsisClick = (e) => {
    e.stopPropagation();
    setSelectedItem(item);

    const rect = ellipsisRef.current.getBoundingClientRect();
    const modalWidth = 176;
    const modalHeight = 190;

    let top = rect.bottom + window.scrollY - 25;
    let left = rect.left + window.scrollX - 180;

    if (left + modalWidth > window.innerWidth)
      left = window.innerWidth - modalWidth - 10;
    if (top + modalHeight > window.innerHeight + window.scrollY)
      top = window.innerHeight + window.scrollY - modalHeight - 10;
    if (left < 0) left = 10;

    handleActiveModalType("Actions");
    onOpenModal({ top, left });
  };

  const handleEditJob = () => {
    openModal({
      title: `Edit ${item.ad_hoc_job_id} - ${item.type}`,
      content: (
        <div
          className="min-w-[600px] overflow-hidden min-h-0 h-[80vh] p-4"
          ref={modalRef}>
          <AdHocJobForm adHocJob={item} />
        </div>
      ),
    });
  };

  return (
    <tr
      onClick={handleRowClick}
      onDoubleClick={() => handleEditJob(item)}
      className={`text-primary-text hover:bg-hover-menu-color ${
        selected ? "bg-active-menu-color" : ""
      }`}>
      <td className="p-2 pl-0 text-center">
        <input
          className="cursor-pointer"
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(item)}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className="p-2">{item.ad_hoc_job_id}</td>
      <td className="p-2 font-semibold">{item.property_name}</td>
      <td className="p-2">{formattedStartDate}</td>
      <td className="p-2">{formattedEndDate}</td>
      <td className="p-2 text-center">
        {item.type === "Laundry" ? (
          <Pill color="purple" text="Laundry" />
        ) : item.type === "Clean" ? (
          <Pill color="green" text="Clean" />
        ) : item.type === "Maintenance" ? (
          <Pill color="orange" text="Maintenance" />
        ) : item.type === "Hot Tub" ? (
          <Pill color="blue" text={item.type} />
        ) : null}
      </td>
      <td className="p-2">{item.notes || "-"}</td>

      <td className="p-2 text-center">
        <button
          ref={ellipsisRef}
          onClick={handleEllipsisClick}
          onDoubleClick={(e) => e.stopPropagation()}
          className="cursor-pointer flex hover:bg-cta-btn-bg border-cta-btn-border w-8 h-8 rounded-lg justify-center items-center">
          <IoEllipsisVertical />
        </button>
      </td>
    </tr>
  );
};

export default AdHocJobRow;
