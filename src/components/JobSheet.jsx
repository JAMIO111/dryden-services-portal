import Logo from "@assets/dryden-logo.png";
import { forwardRef } from "react";

const JobSheet = forwardRef(({ job }, ref) => {
  const publicKeyCodes = job?.keyCodes.filter((kc) => !kc.is_private);
  console.log("Job data:", job);
  return (
    <div
      ref={ref}
      className="job-sheet flex flex-col"
      style={{
        fontSize: "9pt",
        width: "210mm",
        minHeight: "297mm",
        padding: "10mm",
        background: "#fff",
        color: "#000",
        fontFamily: "Arial, sans-serif",
        borderBottom: "1px solid #000",
      }}>
      <header className="flex justify-between">
        <div>
          <img src={Logo} className="h-14 -ml-4" alt="Company Logo" />
        </div>

        <div className="flex text-[11px] flex-col items-end">
          <span className="font-bold">Dryden Services Limited</span>
          <span>North Seaton Industrial Estate,</span>
          <span>Unit 12B Armstrong Ct,</span>
          <span>Ashington, NE63 0YE</span>
        </div>
      </header>

      <section style={{ marginBottom: "10px" }}>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "semibold",
            borderBottom: "1px solid #000",
          }}>
          Job Sheet{" "}
          {(() => {
            switch (job?.itemType) {
              case "job":
                switch (job?.sheetType) {
                  case "changeover":
                    return "- Changeover";
                  case "hot_tub":
                    return "- Changeover Hot Tub";

                  default:
                    break;
                }
              case "adHocJob":
                switch (job?.type) {
                  case "Clean":
                    return "- Clean Only";
                  case "Laundry":
                    return "- Laundry Only";
                  case "Hot Tub":
                    return "- Hot Tub";
                  default:
                    break;
                }
            }
          })()}
        </h2>
      </section>
      <section className="flex gap-3">
        <section className="flex-2 rounded-lg overflow-hidden border mb-3">
          <div className="p-1 pr-2 flex justify-between items-center border-b bg-gray-200">
            <h2 className="font-semibold">Property Details</h2>
            <p></p>
          </div>
          <div className="p-2">
            <div className="flex gap-3 flex-row mb-1.5">
              <div className="flex-1 font-semibold">Name</div>
              <div className="flex-3 ">{job?.propertyDetails?.name}</div>
            </div>
            <div className="flex gap-3 flex-row">
              <div className="flex-1 font-semibold">Address</div>
              <div className="flex-3">
                {[
                  job?.propertyDetails?.line_1,
                  job?.propertyDetails?.line_2,
                  job?.propertyDetails?.town,
                  job?.propertyDetails?.county,
                  job?.propertyDetails?.postcode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 rounded-lg overflow-hidden border mb-3">
          <h2 className="p-1 border-b font-semibold bg-gray-200">Key Codes</h2>
          <div className="p-2">
            {publicKeyCodes.length > 0 ? (
              publicKeyCodes.map((keyCode, index) => (
                <div className="flex gap-3 flex-row mb-1.5" key={index}>
                  <div className="flex-1 font-semibold">
                    {`${keyCode?.code} - `}
                    <span className="font-normal">{keyCode?.name}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No key codes available.</p>
            )}
          </div>
        </section>
      </section>

      <section className="rounded-lg overflow-hidden border mb-3">
        <h2 className="p-1 border-b  font-semibold bg-gray-200">Job Details</h2>
        <div className="p-2">
          {job?.itemType === "job" && (
            <div>
              <div className="flex gap-3 flex-row mb-1.5">
                <div className="flex-1 font-semibold">Current Departure</div>
                <div className="flex-4">
                  {`${new Date(job?.jobDate).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}  ${
                    job?.propertyDetails?.check_out
                      ? new Date(`1970-01-01T${job.propertyDetails.check_out}`)
                          .toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })
                          .replace(/\b(am|pm)\b/, (match) =>
                            match.toUpperCase()
                          )
                      : ""
                  }  (${job?.bookingId}) ${
                    job?.departureBooking?.is_owner_booking
                      ? "Owner Booking"
                      : ""
                  }`}
                </div>
              </div>
              <div className="flex gap-3 flex-row">
                <div className="flex-1 font-semibold">Next Arrival</div>
                <div className="flex-4">
                  {job.nextArrival
                    ? `${new Date(job?.nextArrival).toLocaleDateString(
                        "en-GB",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}  ${
                        job?.propertyDetails?.check_in
                          ? new Date(
                              `1970-01-01T${job.propertyDetails.check_in}`
                            )
                              .toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })
                              .replace(/\b(am|pm)\b/, (match) =>
                                match.toUpperCase()
                              )
                          : ""
                      } (${job?.bookingDetails?.booking_id}) ${
                        job?.bookingDetails?.is_owner_booking
                          ? "Owner Booking"
                          : ""
                      }`
                    : "No future booking"}
                </div>
              </div>
            </div>
          )}

          {job?.itemType === "adHocJob" && job?.type !== "Laundry" && (
            <div className="flex gap-3 flex-row">
              <div className="flex-1 font-semibold">Job Date</div>
              <div className="flex-5">
                {`${new Date(job?.single_date).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}  ${
                  job?.propertyDetails?.check_in
                    ? new Date(`1970-01-01T${job.propertyDetails.check_in}`)
                        .toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                        .replace(/\b(am|pm)\b/, (match) => match.toUpperCase())
                    : ""
                } (${job?.ad_hoc_job_id})`}
              </div>
            </div>
          )}

          {job?.itemType === "adHocJob" && job?.type === "Laundry" && (
            <div>
              <div className="flex gap-3 flex-row mb-1.5">
                <div className="flex-1 font-semibold">Start Date</div>
                <div className="flex-5">
                  {`${new Date(job?.start_date).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })} (${job?.ad_hoc_job_id} - ${
                    job?.transport === "Client"
                      ? "Client Drop-off"
                      : "Dryden Services Pick-up"
                  })`}
                </div>
              </div>

              <div className="flex gap-3 flex-row">
                <div className="flex-1 font-semibold">End Date</div>
                <div className="flex-5">
                  {`${new Date(job?.end_date).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })} (${job?.ad_hoc_job_id} - ${
                    job?.transport === "Client"
                      ? "Client Pick-up"
                      : "Dryden Services Drop-off"
                  })`}
                </div>
              </div>
            </div>
          )}

          {job?.itemType === "adHocJob" && (
            <div className="flex gap-3 mt-1.5 flex-row">
              <div className="flex-1 font-semibold">Job Description</div>
              <div className="flex-5">
                {job?.notes || "No description provided."}
              </div>
            </div>
          )}
        </div>
      </section>
      {job?.itemType === "job" && (
        <section className="rounded-lg overflow-hidden border mb-3">
          <h2 className="p-1 border-b font-semibold bg-gray-200">
            Booking Details
          </h2>
          {job?.bookingDetails ? (
            <div className="flex gap-10">
              <div className="flex flex-col items-stretch p-2 flex-1">
                <div className="flex justify-between flex-row gap-3">
                  <div className="font-semibold">
                    <span className="mr-2">
                      {job.bookingDetails.adults || 0}
                    </span>
                    Adult{(job.bookingDetails.adults || 0) !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="flex justify-between flex-row gap-3">
                  <div className="font-semibold">
                    <span className="mr-2">
                      {job.bookingDetails.children || 0}
                    </span>
                    Child{(job.bookingDetails.children || 0) !== 1 ? "ren" : ""}
                  </div>
                </div>

                <div className="flex justify-between flex-row gap-3">
                  <div className="font-semibold">
                    <span className="mr-2">
                      {job.bookingDetails.infants || 0}
                    </span>
                    Infant{(job.bookingDetails.infants || 0) !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              <div className="p-2 flex-1">
                <div className="flex justify-between flex-row gap-3">
                  <div className="font-semibold">
                    <span className="mr-2">{job.bookingDetails.pets || 0}</span>
                    Pet{(job.bookingDetails.pets || 0) !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="flex justify-between flex-row gap-3">
                  <div className="font-semibold">
                    <span className="mr-2">
                      {job.bookingDetails.stairgates || 0}
                    </span>
                    Stairgate
                    {(job.bookingDetails.stairgates || 0) !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="flex justify-between flex-row gap-3">
                  <div className="font-semibold">
                    <span className="mr-2">
                      {job.bookingDetails.highchairs || 0}
                    </span>
                    Highchair
                    {(job.bookingDetails.highchairs || 0) !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              <div className="p-2 flex-1">
                <div className="flex justify-between flex-row gap-3">
                  <div className="font-semibold">
                    <span className="mr-2">{job.bookingDetails.cots || 0}</span>
                    Cot{(job.bookingDetails.cots || 0) !== 1 ? "s" : ""}
                  </div>
                </div>
                {job.bookingDetails.is_return_guest && (
                  <div className="py-0.5 px-1.5 flex-1 w-fit rounded-lg bg-orange-200">
                    Return Guest
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3">
              <p>No future booking.</p>
            </div>
          )}
        </section>
      )}

      <section className="flex gap-3">
        {job?.propertyDetails?.notes && (
          <section className="flex-1 rounded-lg overflow-hidden bg-yellow-50 border mb-3">
            <h2 className="p-1 border-b font-semibold bg-yellow-100">
              Property Notes
            </h2>
            <div className="p-2">
              {job?.propertyDetails?.notes ? (
                <p>{job.propertyDetails.notes}</p>
              ) : (
                <p>No property notes available.</p>
              )}
            </div>
          </section>
        )}

        {job?.bookingDetails?.notes && (
          <section className="flex-1 border rounded-lg overflow-hidden bg-yellow-50 mb-3">
            <h2 className="p-1 border-b font-semibold bg-yellow-100">
              Booking Notes
            </h2>
            <div className="p-2">
              {job?.bookingDetails?.notes ? (
                <p>{job.bookingDetails.notes}</p>
              ) : (
                <p>No booking notes available.</p>
              )}
            </div>
          </section>
        )}
      </section>
      {job?.sheetType === "changeover" &&
        job?.propertyDetails?.hired_laundry && (
          <section className="rounded-lg overflow-hidden border mb-3">
            <h2 className="p-1 border-b font-semibold bg-gray-200">
              Laundry{" "}
              <span className="text-[10px]">(Record quantity used)</span>
            </h2>

            <div className="flex flex-wrap gap-10 p-1">
              {[
                ["Superking Set", "King Set", "Double Set"],
                ["Single Set", "Hand Towels", "Tea Towels"],
                ["Bath Mats", "Oven Gloves", "Bathrobes"],
              ].map((group, i) => (
                <div
                  key={i}
                  className="flex flex-col flex-1 min-w-[200px] gap-1">
                  {group.map((item) => (
                    <div
                      key={item}
                      className="flex justify-between gap-2 items-center flex-row">
                      <div className="h-7 w-7 border rounded" />
                      <div className="flex-1 text-left font-semibold">
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}
      {job?.sheetType === "changeover" && (
        <section className="flex gap-3 mb-3">
          <section className="flex-2 rounded-lg overflow-hidden border">
            <h2 className="p-1 border-b font-semibold bg-gray-200">
              Items Replenished{" "}
              <span className="text-[10px]">(Record quantity replenished)</span>
            </h2>
            <div className="flex flex-wrap gap-10 p-1">
              {[
                ["Log Pack", "Washing Up Liquid"],
                ["Handwash", "Henry Bags"],
              ].map((group, i) => (
                <div
                  key={i}
                  className="flex flex-col flex-1 min-w-[200px] gap-1">
                  {group.map((item) => (
                    <div
                      key={item}
                      className="flex justify-between gap-2 items-center flex-row">
                      <div className="h-7 w-7 border rounded" />
                      <div className="flex-1 text-left font-semibold">
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
          <section className="flex-1 rounded-lg overflow-hidden border">
            <h2 className="p-1 border-b font-semibold bg-gray-200">
              Fire Safety Checks{" "}
              <span className="text-[10px] ml-2">(Tick)</span>
            </h2>

            <div className="flex flex-wrap gap-10 p-2">
              {[["Smoke/Heat Alarm", "Carbon Monoxide Detector"]].map(
                (group, i) => (
                  <div
                    key={i}
                    className="flex flex-col flex-1 min-w-[200px] gap-1">
                    {group.map((item) => (
                      <div
                        key={item}
                        className="flex justify-between gap-3 items-center flex-row">
                        <div className="h-5 w-5 border" />
                        <div className="flex-1 text-left font-semibold">
                          {item}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </section>
        </section>
      )}
      {job?.propertyDetails?.service_type?.includes("laundry") && (
        <section className="rounded-lg mb-3 overflow-hidden border">
          <h2 className="p-1 border-b font-semibold bg-gray-200">
            Laundry Used{" "}
            <span className="text-[10px]">(Record quantity used)</span>
          </h2>
          <div className="flex flex-wrap gap-2 p-1">
            {[
              [
                "Super King Sheets",
                "Super King Duvet Covers",
                "Super King Protectors",
              ],
              ["King Sheets", "King Duvet Covers", "King Protectors"],
              ["Double Sheets", "Double Duvet Covers", "Double Protectors"],
              ["Single Sheets", "Single Duvet Covers", "Single Protectors"],
              ["Pillowcases", "Duvets", "Pillows"],
              ["Hand Towels", "Bath Towels", "Bath Sheets"],
              ["Bath Mats", "Bathrobes", "Face Cloths"],
              ["Oven Gloves", "Tea Towels", "Table Cloths"],
              ["Cushion Covers", "Throws", "Rugs"],
            ].map((group, i) => (
              <div
                key={i}
                className="flex flex-col flex-1 min-w-[200px] gap-0.5">
                {group.map((item) => (
                  <div
                    key={item}
                    className="flex justify-between gap-2 items-center flex-row">
                    <div className="h-6 w-6 border rounded" />
                    <div className="flex-1 text-left font-semibold">{item}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {(job?.sheetType === "changeover" || job?.type === "Clean") && (
        <section className="rounded-lg overflow-hidden border mb-3">
          <h2 className="p-1 border-b font-semibold bg-gray-200">
            Quality Checks
            <span className="text-[10px] ml-2">(Tick upon completion)</span>
          </h2>

          <div className="flex flex-wrap gap-10 p-2">
            {[
              ["Living Room", "Kitchen", "Bathrooms"],
              ["Bedrooms", "Hallways", "Staircases"],
              ["Garden", "Windows & Doors", "Check Key Safe"],
            ].map((group, i) => (
              <div key={i} className="flex flex-col flex-1 min-w-[200px] gap-1">
                {group.map((item) => (
                  <div
                    key={item}
                    className="flex justify-between gap-3 items-center flex-row">
                    <div className="h-5 w-5 border" />
                    <div className="flex-1 text-left font-semibold">{item}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border rounded-lg flex-1 overflow-hidden mb-3">
        <h2 className="p-1 border-b font-semibold bg-gray-200">Comments</h2>
        <div className="p-3 flex h-24 flex-col gap-5"></div>
      </section>

      <section className="border rounded-lg overflow-hidden">
        <h2 className="p-1 border-b font-semibold bg-gray-200">Sign-Off</h2>
        <div className="p-3 flex flex-col gap-5">
          <p>
            The above works have been completed and checked to my complete
            satisfaction.
          </p>
          <div className="flex h-12 gap-6 items-end">
            <div className="mb-7">Team Leader:</div>
            <div className="flex-3 items-stretch flex flex-col gap-1">
              <div className="border-b"></div>
              <p className="text-center text-sm">PRINT NAME</p>
            </div>

            <div className="flex-3 items-stretch flex flex-col gap-1">
              <div className="border-b"></div>
              <p className="text-center text-sm">SIGNATURE</p>
            </div>
            <div className="flex-2 items-stretch flex flex-col gap-1">
              <div className="border-b"></div>
              <p className="text-center text-sm">DATE:</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export default JobSheet;
