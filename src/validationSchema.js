import { z } from "zod";

export const PropertyFormSchema = z.object({
  name: z
    .string({ required_error: "Property name is required" })
    .min(1, { message: "Property name must be at least 1 character long" })
    .max(40, {
      message: "Property name must not be more than 40 characters long",
    })
    .transform((val) =>
      val
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ")
    ),
  bedrooms: z
    .number({ required_error: "Number of bedrooms is required" })
    .min(1),
  sleeps: z.number({ required_error: "Number of sleeps is required" }).min(1),
  bathrooms: z
    .number({ required_error: "Number of bathrooms is required" })
    .min(1),
  line_1: z
    .string({ required_error: "Address line 1 is required" })
    .min(2, { message: "Address line 1 must be at least 2 characters long" })
    .max(100, {
      message: "Address line 1 must not be more than 100 characters long",
    })
    .optional(),
  line_2: z
    .string({ required_error: "Address line 2 is required" })
    .min(2, { message: "Address line 2 must be at least 2 characters long" })
    .max(100, {
      message: "Address line 2 must not be more than 100 characters long",
    })
    .optional(),
  town: z.string({ required_error: "Town is required" }).min(2).max(100),
  county: z.string({ required_error: "County is required" }).min(2).max(100),
  postcode: z
    .string()
    .regex(
      /^([Gg][Ii][Rr]0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]))))\s?[0-9][A-Za-z]{2})$/,
      "Invalid UK postcode"
    )
    .transform((val) =>
      val
        .replace(/\s+/g, "")
        .replace(/(.{3})$/, " $1")
        .toUpperCase()
    ),
  what_3_words: z
    .string({ required_error: "What3Words address is required" })
    .regex(
      /^(?:\/\/\/)?[a-z]+(?:-[a-z]+)?\.[a-z]+(?:-[a-z]+)?\.[a-z]+(?:-[a-z]+)?$/,
      "Enter a valid What3Words address"
    ),
  KeyCodes: z
    .array(
      z.object({
        code: z.string().min(1),
        name: z.string().min(2).max(30),
        is_private: z.boolean(),
      })
    )
    .optional(),
  package: z.number(),
  service_type: z.string(),
  hired_laundry: z.boolean(),
});

const phoneRegex = /^[+()\-0-9\s]{6,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    .email({ message: "Invalid email address" }),
  primary_phone: z
    .string()
    .regex(phoneRegex, { message: "Invalid phone number format" })
    .min(6, { message: "Phone number must be at least 6 characters long" })
    .max(20, {
      message: "Phone number must not be more than 20 characters long",
    })
    .optional()
    .nullable()
    .or(z.literal("")), // ✅ allow blank strings
  secondary_email: z
    .string()
    .email({ message: "Invalid email address" })
    .max(100, { message: "Email must not be more than 100 characters long" })
    .optional()
    .nullable()
    .or(z.literal("")), // ✅ allow blank strings
  secondary_phone: z
    .string()
    .regex(phoneRegex, { message: "Invalid phone number format" })
    .min(6, { message: "Phone number must be at least 6 characters long" })
    .max(20, {
      message: "Phone number must not be more than 20 characters long",
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
  first_name: z.string({ required_error: "First name is required" }),
  surname: z.string({ required_error: "Surname is required" }),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),
  phone: z
    .string()
    .regex(/^[+()\-0-9\s]{6,20}$/, { message: "Invalid phone number format" }),
  dob: z.date({ required_error: "Date of birth is required" }),
  gender: z.string({ required_error: "Gender is required" }),
  job_title: z.string({ required_error: "Job title is required" }),
  start_date: z.date({ required_error: "Start date is required" }),
  ni_number: z
    .string()
    .max(15, { message: "NI Number must not exceed 15 characters" }),
  is_active: z.boolean().default(true),
});
