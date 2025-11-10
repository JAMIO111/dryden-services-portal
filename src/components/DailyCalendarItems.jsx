import React from "react";
import MeetingCard from "./MeetingCard";

const DailyCalendarItems = ({ date, items }) => {
  // Group items by type
  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    },
    { job: [], meeting: [], absence: [] }
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-1 justify-center items-center min-w-[50vw] min-h-[60vh] max-h-[80vh] p-4">
        <div className="text-center">
          <p className="text-xl font-semibold text-primary-text">
            No items for this day.
          </p>
          <p className="text-secondary-text mt-2">
            Finally some downtime? Kick your feet up and relax!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-w-[50vw] min-h-[70vh] max-h-[80vh] overflow-y-auto p-4">
      {groupedItems.meeting.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-secondary-text mb-2">
            Meetings
          </h2>
          <div className="flex flex-col gap-2 items-start">
            {groupedItems.meeting.map((meeting) => (
              <div className="w-fit" key={meeting.id}>
                <MeetingCard key={meeting.id} meeting={meeting} />
              </div>
            ))}
          </div>
        </div>
      )}

      {groupedItems.absence.length > 0 && (
        <div className="">
          <h2 className="text-lg font-semibold text-secondary-text mb-2">
            Absences
          </h2>
          <div className="flex gap-2">
            {groupedItems.absence.map((absence) => (
              <div
                key={absence.id}
                className="bg-tertiary-bg shadow-s max-w-[250px] w-full p-3 rounded-lg flex flex-col items-start gap-2">
                {/* Category */}
                <p className="font-semibold text-sm text-center">
                  {absence.category
                    ?.toLowerCase()
                    .replace(/\b\w/g, (char) => char.toUpperCase()) ||
                    "Absence"}
                </p>

                {/* Dates */}
                <p className="text-xs text-secondary-text text-center">
                  {`${new Date(absence.start_date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })} - ${new Date(absence.end_date).toLocaleDateString(
                    "en-GB",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}`}
                </p>

                {/* Reason */}
                {absence.reason && (
                  <p className="text-xs text-secondary-text text-center">
                    {absence.reason}
                  </p>
                )}

                {/* Employee Info */}
                {absence.employee && (
                  <div className="flex flex-row items-center gap-1 mt-1">
                    {absence.employee.avatar ? (
                      <img
                        src={absence.employee.avatar}
                        alt={`${absence.employee.first_name || ""} ${
                          absence.employee.surname || ""
                        }`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center">
                        <p className="text-white text-xs font-semibold">
                          {absence.employee.first_name?.charAt(0) || ""}
                          {absence.employee.surname?.charAt(0) || ""}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-col ml-2 items-start">
                      <p className="text-sm font-semibold text-secondary-text text-center">
                        {absence.employee.first_name} {absence.employee.surname}
                      </p>
                      <p className="text-xs text-secondary-text text-center">
                        {absence.employee.job_title || ""}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {groupedItems.job.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-secondary-text mt-5 mb-2">
            Jobs
          </h2>
          <div className="flex flex-col gap-2">
            {groupedItems.job.map((job) => (
              <div
                key={job.jobId}
                className="bg-blue-400/30 p-3 rounded shadow flex flex-col gap-1">
                <p className="font-semibold text-sm">
                  {job.propertyDetails?.name || "Unnamed Property"}
                </p>
                <p className="text-xs text-secondary-text">
                  Departure:{" "}
                  {new Date(job.jobDate).toLocaleString("en-GB", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {job.nextArrival && (
                  <p className="text-xs text-secondary-text">
                    Next Arrival:{" "}
                    {new Date(job.nextArrival).toLocaleString("en-GB", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyCalendarItems;
