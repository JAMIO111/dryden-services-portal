import { createPortal } from "react-dom";
import { FiTrash2 } from "react-icons/fi";
import { HiOutlinePencil } from "react-icons/hi2";
import ActionsModalItem from "./ActionsModalItem";
import { useQueryClient } from "@tanstack/react-query";
import { softDeleteRow } from "../api/supabaseApi";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastProvider";
import { useConfirm } from "../contexts/ConfirmationModalProvider";
import { forwardRef } from "react";

const ActionsModal = forwardRef(({ item, position, onClose }, ref) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const confirm = useConfirm();

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
      try {
        await softDeleteRow("Bookings", item.id);
        queryClient.invalidateQueries(["Bookings"]);
        showToast({
          type: "success",
          title: "Deleted",
          message: "The booking was successfully deleted.",
        });
      } catch (err) {
        console.error("Failed to delete:", err);
        showToast({
          type: "error",
          title: "Deletion Failed",
          message: "We were unable to delete the record.",
        });
      }
    }
  };

  const navigate = useNavigate();

  const handleEditBooking = () => {
    console.log(`Editing ${item.booking_id}`);
    navigate(`/Jobs/Bookings/${item.booking_id}`);
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
          label="Edit Booking"
          icon={HiOutlinePencil}
          color="blue"
          item={item}
          callback={handleEditBooking}
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
