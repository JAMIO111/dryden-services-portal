import { z } from "zod";

const postcodeRegex =
  /^([Gg][Ii][Rr]0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]))))\s?[0-9][A-Za-z]{2})$/;
const what3WordsRegex =
  /^(?:\/\/\/)?[a-z]+(?:-[a-z]+)?\.[a-z]+(?:-[a-z]+)?\.[a-z]+(?:-[a-z]+)?$/;
const phoneRegex = /^[+()\-0-9\s]{6,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailMaxLength = 255;
const nameMaxLength = 30;
const phoneMaxLength = 20;

const transformPhoneNumber = (val) => {
  if (!val) return "";

  // Strip all non-digits
  let digits = val.replace(/\D/g, "");

  // ---------------------------------------
  // NORMALISE COUNTRY CODE
  // ---------------------------------------
  if (digits.startsWith("44")) {
    digits = "0" + digits.slice(2);
  }

  // Mobile typed without the leading zero
  if (/^7\d{9}$/.test(digits)) {
    digits = "0" + digits;
  }

  // ---------------------------------------
  // UK NUMBER DETECTION
  // ---------------------------------------
  // Mobile: 07xxxxxxxxx (11 digits)
  const isUkMobile = /^07\d{9}$/.test(digits);

  // Landline (01 / 02) — realistically 10 or 11 digits
  const isUkLandline = /^0[12]\d{8,9}$/.test(digits);

  // Non-geo: 03, 05, 08, 09 — also normally 10 or 11 digits
  const isUkNonGeo = /^0[3589]\d{8,9}$/.test(digits);

  const looksUk = isUkMobile || isUkLandline || isUkNonGeo;

  if (!looksUk) {
    // return original digits cleaned, without forcing UK structure
    return digits;
  }

  // ---------------------------------------
  // SIMPLE UK FORMATTING
  // "xxxxx xxxxxx" for anything UK-like
  // (Not perfect for every STD code, but consistent)
  // ---------------------------------------
  if (digits.length > 5) {
    return digits.slice(0, 5) + " " + digits.slice(5);
  }

  return digits;
};

export const PropertyFormSchema = z.object({
  name: z
    .string({ required_error: "Property name is required" })
    .min(1, { message: "Property name must be at least 1 character long" })
    .max(nameMaxLength, {
      message: `Property name must not be more than ${nameMaxLength} characters long`,
    })
    .transform((val) =>
      val
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ")
    ),
  bedrooms: z.number(),
  sleeps: z.number(),
  bathrooms: z.number(),

  line_1: z
    .string({ required_error: "Address line 1 is required" })
    .min(2, { message: "Address line 1 must be at least 2 characters long" })
    .max(100, {
      message: "Address line 1 must not be more than 100 characters long",
    }),
  line_2: z
    .string()
    .max(100, {
      message: "Address line 2 must not be more than 100 characters long",
    })
    .nullable()
    .optional()
    .or(z.literal("")),
  town: z.string({ required_error: "Town is required" }).min(2).max(100),
  county: z
    .string({ required_error: "County is required" })
    .min(2)
    .max(100)
    .or(z.literal("")),
  postcode: z
    .string()
    .regex(postcodeRegex, "Invalid UK postcode")
    .transform((val) =>
      val
        .replace(/\s+/g, "")
        .replace(/(.{3})$/, " $1")
        .toUpperCase()
    ),
  what_3_words: z
    .string()
    .regex(what3WordsRegex, "Enter a valid What3Words address")
    .optional()
    .nullable()
    .or(z.literal("")), // allow blank input
  KeyCodes: z
    .array(
      z.object({
        code: z.string().min(1).max(10),
        name: z
          .string()
          .min(2, { message: "Location must be at least 2 characters long" })
          .max(20, {
            message: "Location must not be more than 20 characters long",
          }),
        is_private: z.boolean(),
      })
    )
    .optional(),
  package: z.number(),
  service_type: z.array(z.string()),
  hired_laundry: z.boolean(),
  notes: z
    .string()
    .max(1000, { message: "Notes must not exceed 1000 characters" })
    .optional()
    .nullable()
    .or(z.literal("")),
  owner_ref: z.string().optional().nullable().or(z.literal("")),
  property_ref: z.string().optional().nullable().or(z.literal("")),
});

export const OwnerFormSchema = z.object({
  first_name: z
    .string({ required_error: "First name is required" })
    .max(30, {
      message: "First name must not be more than 30 characters long",
    })
    .trim() // removes whitespace
    .min(1, "First name is required"),
  surname: z
    .string({ required_error: "Surname is required" })
    .max(30, { message: "Surname must not be more than 30 characters long" })
    .trim()
    .min(1, "Surname is required"),
  middle_name: z
    .string()
    .max(30, {
      message: "Middle name must not be more than 30 characters long",
    })
    .optional()
    .nullable()
    .or(z.literal("")), // ✅ allow blank strings
  primary_email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must not be more than 255 characters long" })
    .optional()
    .nullable()
    .or(z.literal("")), // ✅ allow blank strings,
  primary_phone: z
    .string()
    .min(6, { message: "Phone number must be at least 6 characters long" })
    .max(20, {
      message: "Phone number must not be more than 20 characters long",
    })
    .regex(phoneRegex, { message: "Invalid phone number format" })
    .transform((val) => {
      return transformPhoneNumber(val);
    })
    .optional()
    .nullable()
    .or(z.literal("")), // ✅ allow blank strings
  secondary_email: z
    .string()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must not be more than 255 characters long" })
    .optional()
    .nullable()
    .or(z.literal("")), // ✅ allow blank strings
  secondary_phone: z
    .string()
    .min(6, { message: "Phone number must be at least 6 characters long" })
    .max(20, {
      message: "Phone number must not be more than 20 characters long",
    })
    .regex(phoneRegex, { message: "Invalid phone number format" })
    .transform((val) => {
      return transformPhoneNumber(val);
    })
    .optional()
    .nullable()
    .or(z.literal("")), // ✅ allow blank strings
  is_active: z.boolean().default(true),
  location: z.any().nullable().optional(),
});

export const BookingFormSchema = z.object({
  property_id: z
    .string({ message: "You must select a valid property" })
    .uuid("You must select a valid property"),

  booking_ref: z
    .string()
    .max(50, { message: "Booking reference must not exceed 50 characters" }),

  bookingDates: z
    .object({
      startDate: z
        .date({ required_error: "Start date is required" })
        .nullable(),
      endDate: z.date({ required_error: "End date is required" }).nullable(),
    })
    .refine((val) => val.startDate && val.endDate, {
      message: "Please select an arrival and departure date",
    }),

  adults: z
    .number({ message: "Please enter a valid number of adults" })
    .min(1, { message: "At least one adult is required" }),
  children: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z
      .number({ message: "Please enter a valid number of children" })
      .min(0, { message: "Children cannot be negative" })
  ),
  infants: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z
      .number({ message: "Please enter a valid number of infants" })
      .min(0, { message: "Infants cannot be negative" })
  ),
  pets: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z
      .number({ message: "Please enter a valid number of pets" })
      .min(0, { message: "Pets cannot be negative" })
  ),
  highchairs: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z
      .number({ message: "Please enter a valid number of highchairs" })
      .min(0, { message: "Highchairs cannot be negative" })
  ),
  cots: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z
      .number({ message: "Please enter a valid number of cots" })
      .min(0, { message: "Cots cannot be negative" })
  ),
  stairgates: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z
      .number({ message: "Please enter a valid number of stairgates" })
      .min(0, { message: "Stairgates cannot be negative" })
  ),
  is_return_guest: z.boolean().optional(),

  lead_guest: z
    .string()
    .max(50, {
      message: "Lead guest name must not be more than 50 characters long",
    })
    .optional()
    .nullable()
    .or(z.literal("")), // ✅ allow blank strings

  lead_guest_contact: z
    .string()
    .max(100, {
      message: "Lead guest contact must not be more than 100 characters long",
    })
    .optional()
    .nullable()
    .or(z.literal("")), // ✅ allow blank strings
  notes: z
    .string()
    .max(1000, { message: "Notes must not exceed 1000 characters" })
    .optional()
    .nullable()
    .or(z.literal("")), // ✅ allow blank strings
  is_owner_booking: z.boolean(),
});

export const LeadFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Title is required" })
    .max(50, { message: "Title must not exceed 50 characters" }),
  first_name: z
    .string()
    .trim()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name must not exceed 50 characters" }),
  surname: z
    .string()
    .trim()
    .min(1, { message: "Surname is required" })
    .max(50, { message: "Surname must not exceed 50 characters" }),
  phone: z
    .string()
    .min(6, { message: "Phone number must be at least 6 characters long" })
    .max(20, {
      message: "Phone number must not be more than 20 characters long",
    })
    .regex(phoneRegex, { message: "Invalid phone number format" })
    .transform((val) => {
      return transformPhoneNumber(val);
    })
    .optional()
    .nullable()
    .or(z.literal("")), // ✅ allow blank strings
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must not be more than 255 characters long" })
    .optional()
    .nullable()
    .or(z.literal("")), // ✅ allow blank strings
  status: z.string({ required_error: "Status is required" }),
});

export const CorrespondenceFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Title is required" })
    .max(50, { message: "Title must not exceed 50 characters" }),

  content: z
    .string()
    .trim()
    .min(1, { message: "Content is required" })
    .max(500, { message: "Content must not exceed 500 characters" }),

  tag: z
    .string()
    .trim()
    .min(1, { message: "Tag is required" })
    .max(15, { message: "Tag must not exceed 15 characters" }),
});

export const MeetingFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, { message: "Title is required" })
      .max(50, { message: "Title must not exceed 50 characters" }),
    date: z.date({ required_error: "Date is required" }),
    start_time: z.date({ required_error: "Start time is required" }),
    end_time: z.date({ required_error: "End time is required" }),
    location: z
      .string()
      .trim()
      .min(1, { message: "Location is required" })
      .max(25, { message: "Location must not exceed 25 characters" }),
  })
  .refine((data) => data.end_time > data.start_time, {
    path: ["end_time"],
    message: "End time must be later than start time",
  });

export const EmployeeFormSchema = z.object({
  first_name: z
    .string({ required_error: "First name is required" })
    .min(1, { message: "First name is required" }),
  middle_name: z.string().optional().nullable().or(z.literal("")),
  surname: z
    .string({ required_error: "Surname is required" })
    .min(1, { message: "Surname is required" }),
  address: z.string({ required_error: "Address is required" }),
  email: z
    .string()
    .email("Invalid email format")
    .optional()
    .nullable()
    .or(z.literal("")),
  phone: z
    .string()
    .min(6, { message: "Phone number must be at least 6 characters long" })
    .max(20, {
      message: "Phone number must not be more than 20 characters long",
    })
    .regex(/^[+()\-0-9\s]{6,20}$/, { message: "Invalid phone number format" })
    .transform((val) => {
      return transformPhoneNumber(val);
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  dob: z.date({ required_error: "Date of birth is required" }),
  gender: z.string({ required_error: "Gender is required" }),
  job_title: z
    .string({ required_error: "Job title is required" })
    .min(1, { message: "Job title is required" })
    .nullable(),
  ni_number: z
    .string()
    .max(15, { message: "NI Number must not exceed 15 characters" }),
  is_driver: z.boolean(),
  is_cscs: z.boolean(),
  contract_type: z
    .string()
    .max(50, { message: "Contract type must not exceed 50 characters" })
    .nullable(),
  hourly_rate: z
    .union([z.string(), z.number()])
    .transform((val) =>
      typeof val === "string" && val.trim() !== "" ? parseFloat(val) : null
    )
    .nullable(),
});

export const AbsenceFormSchema = z.object({
  employee_id: z
    .string({
      required_error: "Select an employee",
      invalid_type_error: "Select an employee",
    })
    .min(1, "Select an employee"),
  category: z.enum(
    [
      "Annual Leave",
      "Sickness",
      "Maternity",
      "Paternity",
      "Unpaid Leave",
      "Medical Leave",
      "Bereavement",
      "Jury Duty",
      "Other",
    ],
    {
      required_error: "Select an absence category",
      invalid_type_error: "Select an absence category",
    }
  ),
  start_date: z.date(),
  end_date: z.date(),
  reason: z.string().max(200).optional(),
});

export const AdHocJobFormSchema = z
  .object({
    property_id: z
      .string({ message: "You must select a property" })
      .uuid("You must select a property"),
    type: z.enum(["Clean", "Hot Tub", "Laundry"]),
    single_date: z.date().nullable().optional(),
    start_date: z.date().nullable().optional(),
    end_date: z.date().nullable().optional(),
    transport: z.string().nullable().optional(),
    notes: z
      .string()
      .max(300, { message: "Notes must not exceed 300 characters" }),
  })
  .superRefine((data, ctx) => {
    if (data.type === "Laundry") {
      if (!data.transport) {
        ctx.addIssue({
          path: ["transport"],
          code: z.ZodIssueCode.custom,
          message: "Transport must be selected.",
        });
      }

      if (!data.start_date) {
        ctx.addIssue({
          path: ["start_date"],
          code: z.ZodIssueCode.custom,
          message: "Delivery start date is required.",
        });
      }

      if (!data.end_date) {
        ctx.addIssue({
          path: ["end_date"],
          code: z.ZodIssueCode.custom,
          message: "Delivery end date is required.",
        });
      }
    }

    if (data.type !== "Laundry") {
      if (!data.single_date) {
        ctx.addIssue({
          path: ["single_date"],
          code: z.ZodIssueCode.custom,
          message: "Job date must be selected.",
        });
      }
    }
  });
