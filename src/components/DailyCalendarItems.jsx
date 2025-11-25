import MeetingCard from "./MeetingCard";
import { TbExternalLink } from "react-icons/tb";
import { MdHotTub, MdPublishedWithChanges } from "react-icons/md";
import { BsTruck } from "react-icons/bs";
import { GiMagicBroom } from "react-icons/gi";
import { TbIroning3 } from "react-icons/tb";

const DailyCalendarItems = ({ date, items, navigate, closeModal }) => {
  console.log("DailyCalendarItems items:", items);
  // Group items by type
  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.itemType]) acc[item.itemType] = [];
      acc[item.itemType].push(item);
      return acc;
    },
    { job: [], meeting: [], absence: [] }
  );

  console.log("Grouped Items:", groupedItems);

  if (items?.length === 0) {
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
      {groupedItems?.meeting?.length > 0 && (
        <div className="mb-3">
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

      {groupedItems?.absence?.length > 0 && (
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-secondary-text mb-2">
            Absences
          </h2>
          <div className="flex gap-2">
            {groupedItems.absence.map((absence) => (
              <div
                key={absence.id}
                className="bg-tertiary-bg shadow-s max-w-[250px] w-full p-3 rounded-lg flex flex-col items-start gap-2">
                {/* Category */}
                <p className="font-semibold text-sm text-primary-text text-center">
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
                      <p className="text-sm font-semibold text-primary-text/80 text-center">
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

      {groupedItems?.adHocJob?.length > 0 && (
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-secondary-text mb-2">
            Ad-Hoc Jobs
          </h2>
          <div className="flex flex-col gap-3">
            {groupedItems.adHocJob.map((job) => (
              <div className="relative" key={job.jobId}>
                <div className="bg-tertiary-bg p-3 rounded-lg shadow-s flex flex-row gap-3">
                  <div className="bg-primary-bg rounded-lg shadow-s h-12 w-12">
                    {job.type === "Hot Tub" && (
                      <MdHotTub className="w-8 h-8 text-blue-500 m-2" />
                    )}
                    {job.type === "Laundry" && (
                      <TbIroning3 className="w-8 h-8 text-purple-600 m-2" />
                    )}
                    {job.type === "Clean" && (
                      <GiMagicBroom className="w-8 h-8 text-green-600 m-2" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center gap-1">
                    <p className="font-semibold text-sm text-primary-text">
                      {job.property_name || "Unnamed Property"}
                    </p>
                    <div className="flex flex-row items-center gap-2">
                      <p className="text-xs text-secondary-text">
                        {`${
                          job.type === "Laundry"
                            ? `${new Date(job.start_date).toLocaleString(
                                "en-GB",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )} - ${new Date(job.end_date).toLocaleString(
                                "en-GB",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}`
                            : new Date(job.single_date).toLocaleString(
                                "en-GB",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                        } - ${job?.ad_hoc_job_id || ""}`}
                      </p>
                      {job.bookingId && (
                        <button
                          onClick={() => {
                            navigate(`/Bookings/${job.bookingId}`);
                            closeModal();
                          }}
                          className="text-icon-color hover:shadow-s p-1 rounded active:scale-95">
                          <TbExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {job?.type === "Laundry" && (
                  <div className="absolute top-2 right-2 gap-3 rounded-md shadow-s flex flex-row items-center justify-between py-1 px-2 bg-secondary-bg">
                    <BsTruck className="w-4 h-4 text-secondary-text" />
                    <p className="text-xs text-secondary-text">
                      {`${job.transport} ${
                        job.splitType === "Start" && job.transport === "Client"
                          ? "Dropoff"
                          : job.splitType === "End" &&
                            job.transport === "Dryden Services"
                          ? "Dropoff"
                          : "Pickup"
                      }`}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {groupedItems?.job?.length > 0 && (
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-secondary-text mb-2">
            Changeovers
          </h2>
          <div className="flex flex-col gap-2">
            {groupedItems.job.map((job) => (
              <div
                key={job.jobId}
                className="bg-tertiary-bg p-3 rounded-lg shadow-s flex flex-row gap-3">
                <div className="bg-primary-bg rounded-lg shadow-s h-18 w-18 flex items-center justify-center">
                  <MdPublishedWithChanges className="w-12 h-12 text-pink-500 m-2" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-sm text-primary-text">
                    {job.propertyDetails?.name || "Unnamed Property"}
                  </p>
                  <div className="flex flex-row items-center gap-2">
                    <p className="text-xs text-secondary-text">
                      {`Departure: ${new Date(job.jobDate).toLocaleString(
                        "en-GB",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )} ${job.propertyDetails.check_out || ""} - ${
                        job?.bookingId || ""
                      }`}
                    </p>
                    {job.bookingId && (
                      <button
                        onClick={() => {
                          navigate(`/Jobs/Bookings/${job.bookingId}`);
                          closeModal();
                        }}
                        className="text-icon-color hover:shadow-s p-1 rounded active:scale-95">
                        <TbExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <p className="text-xs text-secondary-text">
                      {job.nextArrival
                        ? `Next Arrival: ${new Date(
                            job.nextArrival
                          ).toLocaleString("en-GB", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })} ${job.propertyDetails.check_in || ""} ${
                            job?.bookingDetails?.booking_id
                              ? `- ${job.bookingDetails.booking_id}`
                              : ""
                          }
                      `
                        : "Next Arrival: No future booking"}
                    </p>
                    {job.bookingDetails?.booking_id && (
                      <button
                        onClick={() => {
                          navigate(
                            `/Jobs/Bookings/${job.bookingDetails.booking_id}`
                          );
                          closeModal();
                        }}
                        className="text-icon-color hover:shadow-s p-1 rounded active:scale-95">
                        <TbExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyCalendarItems;
