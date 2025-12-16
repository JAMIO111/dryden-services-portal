import { Mail, Building2 } from "lucide-react";
import CTAButton from "./CTAButton";
import { IoAddOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import { useModal } from "@/contexts/ModalContext";
import { useAbsences } from "@/hooks/useAbsences";
import AbsenceForm from "./forms/AbsenceForm.jsx";
import { IoBriefcaseOutline, IoAirplaneOutline } from "react-icons/io5";
import { RiUserLine } from "react-icons/ri";
import { GiTribunalJury } from "react-icons/gi";
import { PiBaby } from "react-icons/pi";
import { MdOutlineSick, MdMoneyOff } from "react-icons/md";
import { TbCoffin } from "react-icons/tb";
import { TbMedicalCross } from "react-icons/tb";

export default function AbsenceList({ startDate, endDate }) {
  const { openModal } = useModal();
  const navigate = useNavigate();
  const { data: absences, isLoading } = useAbsences(startDate, endDate);
  console.log("Absences data:", absences);
  const statusColor = {
    "Annual Leave": "bg-orange-400/20 text-orange-500",
    Maternity: "bg-pink-400/20 text-pink-500",
    Sickness: "bg-green-400/20 text-green-500",
    Bereavement: "bg-purple-400/20 text-purple-500",
    "Unpaid Leave": "bg-gray-400/20 text-gray-500",
    Paternity: "bg-blue-400/20 text-blue-500",
    Other: "bg-yellow-400/20 text-yellow-500",
    "Jury Duty": "bg-teal-400/20 text-teal-500",
    "Medical Leave": "bg-red-400/20 text-red-500",
  };

  const statusIcons = {
    "Annual Leave": <IoAirplaneOutline />,
    Maternity: <PiBaby />,
    Sickness: <MdOutlineSick />,
    Bereavement: <TbCoffin />,
    "Unpaid Leave": <MdMoneyOff />,
    Paternity: <PiBaby />,
    Other: <IoBriefcaseOutline />,
    "Jury Duty": <GiTribunalJury />,
    "Medical Leave": <TbMedicalCross />,
  };

  useEffect(() => {
    const container = document.getElementById("absence-list-scroll");
    const header = document.getElementById("absence-list-header");

    const handleScroll = () => {
      if (container.scrollTop > 10) {
        header.setAttribute("data-scrolled", "true");
      } else {
        header.removeAttribute("data-scrolled");
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddAbsence = () => {
    openModal({
      title: "Add New Absence",
      content: (
        <div className="min-w-[600px] max-w-[800px] max-h-[80vh] min-h-0 overflow-y-auto px-3 pt-3">
          <p className="text-sm text-secondary-text mb-4">
            Fill out the form below to add a new absence to the system.
          </p>
          <AbsenceForm />
        </div>
      ),
    });
  };

  const handleEditAbsence = (absence) => {
    openModal({
      title: `Edit Absence - ${absence.employee.first_name} ${absence.employee.surname}`,
      content: (
        <div className="min-w-[600px] max-w-[800px] max-h-[80vh] min-h-0 overflow-y-auto px-3 pt-3">
          <AbsenceForm absence={absence} />
        </div>
      ),
    });
  };

  return (
    <div className="w-full bg-secondary-bg shadow-s p-0.5 rounded-2xl h-full flex flex-col overflow-hidden">
      {/* Make this the scroll container */}
      <div
        id="absence-list-scroll"
        className="relative flex flex-col overflow-y-auto flex-grow [&::-webkit-scrollbar]:hidden">
        {/* Header INSIDE the scroll container */}
        <div
          id="absence-list-header"
          className="sticky top-0 inset-m z-10 rounded-t-3xl backdrop-blur-md bg-secondary-bg/70 
                 border-b border-transparent 
                 data-[scrolled=true]:border-border-color/60 
                 data-[scrolled=true]:bg-secondary-bg/50
                 p-6 py-3 flex justify-between items-center">
          <div className="flex flex-col justify-between items-start">
            <h2 className="text-xl text-primary-text font-semibold">
              Employee Absences
            </h2>
            <p className="text-sm text-secondary-text">
              {`${
                absences?.length
              } absences between ${startDate?.toLocaleDateString("en-GB", {
                year: "2-digit",
                month: "short",
                day: "numeric",
              })} and ${endDate?.toLocaleDateString("en-GB", {
                year: "2-digit",
                month: "short",
                day: "numeric",
              })}`}
            </p>
          </div>
          <CTAButton
            icon={IoAddOutline}
            width="w-auto"
            type="main"
            text="Add New Absence"
            callbackFn={handleAddAbsence}
          />
        </div>

        {/* Scrollable cards */}
        <div className="flex p-4 pt-1 flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center bg-tertiary-bg shadow-s rounded-2xl items-center h-40">
              <p className="text-secondary-text animate-pulse">
                Loading absences...
              </p>
            </div>
          ) : absences?.length === 0 || !absences ? (
            <div className="flex bg-tertiary-bg rounded-2xl shadow-s flex-col justify-center items-center h-40 text-secondary-text">
              <Building2 className="w-8 h-8 opacity-60 mb-3" />
              <p>No absences found</p>
              <p className="text-sm text-muted-text mt-2">
                Try adding a new absence.
              </p>
            </div>
          ) : (
            absences?.map((absence) => (
              <div
                onDoubleClick={() => handleEditAbsence(absence)}
                key={absence.id}
                className="bg-primary-bg p-1.5 rounded-2xl shadow-s transition-shadow duration-200 hover:shadow-m">
                <div className="p-2 bg-primary-bg rounded-t-2xl w-full flex flex-row justify-between items-start">
                  <div className="flex gap-1 flex-col">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-primary-text">
                      {absence?.employee?.avatar ? (
                        <img
                          src={absence.employee.avatar}
                          alt="Employee Avatar"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-secondary-text/20 flex items-center justify-center">
                          <RiUserLine className="w-4 h-4 text-secondary-text" />
                        </div>
                      )}
                      {`${absence.employee.first_name || ""} ${
                        absence.employee.surname || ""
                      }`}
                    </h3>
                    <p className="text-sm text-secondary-text">
                      {(() => {
                        const start = new Date(absence.start_date);
                        const end = new Date(absence.end_date);
                        const options = {
                          weekday: "short",
                          year: "2-digit",
                          month: "short",
                          day: "numeric",
                        };
                        const startStr = start.toLocaleDateString(
                          "en-GB",
                          options
                        );
                        const endStr = end.toLocaleDateString("en-GB", options);
                        return startStr === endStr
                          ? startStr
                          : `${startStr} - ${endStr}`;
                      })()}
                    </p>
                  </div>
                  <div
                    className={`${
                      statusColor[absence.category]
                    } flex px-3 py-1.5 rounded-lg items-center gap-2`}>
                    {statusIcons[absence.category]}
                    <span className={`text-sm font-medium`}>
                      {absence.category}
                    </span>
                  </div>
                </div>
                {absence.reason && (
                  <div className="p-3 bg-tertiary-bg border border-border-color/50 rounded-xl text-sm space-y-2">
                    <p className="font-medium text-primary-text">
                      {absence.reason || "No reason provided"}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
