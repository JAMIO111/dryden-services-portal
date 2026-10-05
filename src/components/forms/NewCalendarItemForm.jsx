import React from "react";
import MeetingForm from "@components/forms/MeetingForm";

const NewCalendarItemForm = ({ closeModal, date }) => {
  return (
    <div className="flex flex-1 p-3 w-full sm:min-w-[500px]">
      <MeetingForm closeForm={closeModal} />
    </div>
  );
};

export default NewCalendarItemForm;
