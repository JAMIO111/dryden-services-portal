// Which fields get tracked in the change log / shown in notification diffs
// for each entity, and how to display their values. Deliberately scoped to
// scalar fields on the record itself - nested relations (KeyCodes, Owners
// on a property, EmployeePeriod contracts, etc.) are handled by their own
// insert/update/delete logic already and aren't diffed here.

const yesNo = (v) => (v ? "Yes" : "No");

export const PROPERTY_CHANGE_FIELDS = {
  name: { label: "Property Name" },
  bedrooms: { label: "Bedrooms" },
  sleeps: { label: "Sleeps" },
  bathrooms: { label: "Bathrooms" },
  line_1: { label: "Address Line 1" },
  line_2: { label: "Address Line 2" },
  town: { label: "Town" },
  county: { label: "County" },
  postcode: { label: "Postcode" },
  what_3_words: { label: "What3Words" },
  service_type: { label: "Service Type" },
  hired_laundry: { label: "Hired Laundry", format: yesNo },
  notes: { label: "Notes" },
  owner_ref: { label: "Owner Reference" },
  property_ref: { label: "Property Reference" },
  letting_agent: { label: "Letting Agent" },
  check_in: { label: "Check-in Time" },
  check_out: { label: "Check-out Time" },
};

export const OWNER_CHANGE_FIELDS = {
  first_name: { label: "First Name" },
  middle_name: { label: "Middle Name" },
  surname: { label: "Surname" },
  primary_email: { label: "Primary Email" },
  primary_phone: { label: "Primary Phone" },
  secondary_email: { label: "Secondary Email" },
  secondary_phone: { label: "Secondary Phone" },
  is_active: { label: "Active Status", format: (v) => (v ? "Active" : "Inactive") },
};

export const BOOKING_CHANGE_FIELDS = {
  booking_ref: { label: "Booking Reference" },
  arrival_date: { label: "Arrival Date" },
  departure_date: { label: "Departure Date" },
  nights: { label: "Nights" },
  adults: { label: "Adults" },
  children: { label: "Children" },
  infants: { label: "Infants" },
  pets: { label: "Pets" },
  highchairs: { label: "Highchairs" },
  cots: { label: "Cots" },
  stairgates: { label: "Stairgates" },
  lead_guest: { label: "Lead Guest" },
  lead_guest_contact: { label: "Lead Guest Contact" },
  notes: { label: "Notes" },
  is_return_guest: { label: "Return Guest", format: yesNo },
  is_owner_booking: { label: "Owner Booking", format: yesNo },
};

export const AD_HOC_JOB_CHANGE_FIELDS = {
  type: { label: "Job Type" },
  single_date: { label: "Job Date" },
  start_date: { label: "Start Date" },
  end_date: { label: "End Date" },
  transport: { label: "Transport" },
  notes: { label: "Notes" },
};

export const EMPLOYEE_CHANGE_FIELDS = {
  first_name: { label: "First Name" },
  middle_name: { label: "Middle Name" },
  surname: { label: "Surname" },
  email: { label: "Email" },
  phone: { label: "Phone" },
  address: { label: "Address" },
  dob: { label: "Date of Birth" },
  gender: { label: "Gender" },
  ni_number: { label: "NI Number" },
  is_driver: { label: "Driver License Holder", format: yesNo },
  is_cscs: { label: "CSCS Card Holder", format: yesNo },
};

// Notifications broadcast to the whole org (see useCreateNotification - every
// org user gets one unless they've opted out of the category, there's no
// per-role restriction). DOB and NI number are sensitive PII that should be
// recorded in the change log for audit purposes but never fanned out in
// plaintext to everyone's notification feed. Use this narrower list when
// building a notification's changeSummary; keep EMPLOYEE_CHANGE_FIELDS (the
// full set) for the change log itself.
export const EMPLOYEE_NOTIFICATION_SAFE_FIELDS = Object.fromEntries(
  Object.entries(EMPLOYEE_CHANGE_FIELDS).filter(
    ([field]) => field !== "dob" && field !== "ni_number"
  )
);
