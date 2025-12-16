import { createPortal } from "react-dom";
import { FiTrash2 } from "react-icons/fi";
import { HiOutlinePencil } from "react-icons/hi2";
import ActionsModalItem from "./ActionsModalItem";
import { useQueryClient } from "@tanstack/react-query";
import { softDeleteRow } from "../api/supabaseApi";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastProvider";
import { useConfirm } from "../contexts/ConfirmationModalProvider";
import { forwardRef, useRef } from "react";
import AdHocJobForm from "./forms/AdHocJobForm";
import { useModal } from "../contexts/ModalContext";
import { useUser } from "../contexts/UserProvider";

const ActionsModal = forwardRef(({ item, position, onClose, type }, ref) => {
  const queryClient = useQueryClient();
  const { openModal } = useModal();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const modalRef = useRef(null);
  const { profile } = useUser();

  const handleDelete = async (id) => {
    onClose();
    const ok = await confirm({
      title: "Are you sure you want to delete this booking?",
      message: "This action can't be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "warning",
    });
    if (ok) {
      const table = type === "adHocJob" ? "AdHocJobs" : "Bookings";
      try {
        await softDeleteRow(table, item.id, profile);
        queryClient.invalidateQueries([table]);
        showToast({
          type: "success",
          title: "Deleted",
          message: `The ${
            type === "adHocJob" ? "job" : "booking"
          } was successfully deleted.`,
        });
      } catch (err) {
        console.error("Failed to delete:", err);
        showToast({
          type: "error",
          title: "Deletion Failed",
          message: `We were unable to delete the ${
            type === "adHocJob" ? "job" : "booking"
          }.`,
        });
      }
    }
  };

  const navigate = useNavigate();

  const handleEditBooking = () => {
    console.log(`Editing ${item.booking_id}`);
    navigate(`/Jobs/Bookings/${item.booking_id}`);
  };

  const handleEditAdHocJob = () => {
    onClose();
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

  return createPortal(
    <div
      ref={ref}
      className="w-44 h-fit bg-secondary-bg rounded-xl border border-border-color shadow-lg flex flex-col justify-center items-center"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 1000,
      }}>
      <div className="w-full h-1/4 flex gap-2 flex-col p-2 justify-center items-center border-b border-border-color">
        <ActionsModalItem
          label={type === "adHocJob" ? "Edit Job" : "Edit Booking"}
          icon={HiOutlinePencil}
          color="blue"
          item={item}
          callback={
            type === "adHocJob" ? handleEditAdHocJob : handleEditBooking
          }
        />
      </div>
      <div className="w-full h-1/4 flex p-2 justify-center items-center">
        <ActionsModalItem
          label="Delete"
          icon={FiTrash2}
          color="red"
          item={item}
          callback={handleDelete}
        />
      </div>
    </div>,
    document.getElementById("modal-root")
  );
});

export default ActionsModal;
