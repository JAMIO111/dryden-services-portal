import CTAButton from "./CTAButton";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

const JobList = ({ jobs = [], isLoading, error, openModal }) => {
  const navigate = useNavigate();

  const typeClasses = {
    Changeover: "bg-pink-500/10 text-pink-600",
    Clean: "bg-green-500/10 text-green-600",
    Maintenance: "bg-yellow-500/10 text-yellow-600",
    Laundry: "bg-purple-500/10 text-purple-600",
    "Hot Tub": "bg-blue-500/10 text-blue-600",
  };
  return (
    <div className="flex flex-col bg-secondary-bg p-2 h-full rounded-2xl shadow-m">
      {/* Header */}

      <div className="flex flex-row justify-between items-center pt-2 pb-3 px-1">
        <h2 className="text-xl px-1 text-primary-text font-semibold">
          Upcoming Jobs
        </h2>
        <CTAButton
          callbackFn={openModal}
          type="main"
          text="Job Sheets"
          icon={HiOutlineDocumentText}
          disabled={jobs.length === 0 || isLoading || error}
          title={
            jobs.length === 0
              ? "No jobs available to preview"
              : isLoading
              ? "Loading jobs..."
              : error
              ? "Error loading jobs"
              : ""
          }
        />
      </div>

      <div className="flex flex-1 bg-tertiary-bg flex-col border border-border-color h-full rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1.5fr_2.5fr_2fr_2fr_140px] border-b border-border-color text-sm bg-primary-bg text-secondary-text">
          <div className="p-2 border-r border-border-color">Job No.</div>
          <div className="p-2 border-r border-border-color">Property</div>
          <div className="p-2 border-r border-border-color">Start Date</div>
          <div className="p-2 border-r border-border-color">End Date</div>
          <div className="p-2 text-center">Job Type</div>
        </div>

        {/* Body */}
        <div className="flex-1 [&::-webkit-scrollbar]:hidden overflow-y-scroll">
          {jobs.length > 0 ? (
            jobs.map((job, index) => (
              <div
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-tertiary-bg" : "bg-secondary-bg"
                } ${
                  index !== jobs.length ? "border-b" : ""
                } border-border-color grid grid-cols-[1.5fr_2.5fr_2fr_2fr_140px] text-xs text-primary-text hover:bg-brand-primary/15`}>
                <div className="flex hover:underline cursor-pointer font-medium items-center px-2 py-1">
                  {job.jobId || "N/A"}
                </div>
                <div className="flex font-medium items-center px-2 py-1">
                  {job.propertyDetails
                    ? job.propertyDetails.name
                    : "Unknown Property"}
                </div>
                <div className="flex items-center px-3 py-1">
                  {job?.itemType === "job" && job.jobDate
                    ? new Date(job.jobDate).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })
                    : job?.itemType === "adHocJob" && job?.type === "Laundry"
                    ? new Date(job.start_date).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })
                    : new Date(job.single_date).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                </div>
                <div className="flex items-center px-3 py-1">
                  {job?.itemType === "job" && !job.nextArrival
                    ? "No Booking"
                    : job?.itemType === "job" && job.nextArrival
                    ? new Date(job.nextArrival).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })
                    : job?.itemType === "adHocJob" && job?.type === "Laundry"
                    ? new Date(job.end_date).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })
                    : "-"}
                </div>
                <div className=" justify-center items-center px-3 py-1">
                  <p
                    className={`py-0.5 px-2 text-center shadow-s rounded-md ${
                      typeClasses[
                        job.itemType === "job" ? "Changeover" : job.type
                      ]
                    }`}>
                    {job.itemType === "job" ? "Changeover" : job.type}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-secondary-text text-sm">
              No jobs found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobList;
