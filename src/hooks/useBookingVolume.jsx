import { useQuery } from "@tanstack/react-query";
import supabase from "../supabase-client";
import { formatToDateString } from "../lib/HelperFunctions";

const parseISO = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d); // local midnight, no UTC shift
};

const getMonthKey = (date) =>
  date.toLocaleString("default", { month: "short", year: "2-digit" });

// Generate all month keys between two ISO strings
const generateMonthKeys = (startISO, endISO) => {
  const start = parseISO(startISO);
  const end = parseISO(endISO);

  const keys = [];
  const date = new Date(start.getFullYear(), start.getMonth(), 1);

  while (date <= end) {
    keys.push(getMonthKey(date));
    date.setMonth(date.getMonth() + 1);
  }

  return keys;
};

export const useBookingVolume = (startDate, endDate) => {
  return useQuery({
    queryKey: ["BookingVolume", startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) return [];

      // Every caller passes Date objects (getStartOfMonth/getEndOfMonth),
      // but a raw Date serializes via .gte()/.lte() as its toString() form
      // ("Sat Nov 01 2025 00:00:00 GMT+0000 (...)"), which Postgres can't
      // parse as a date filter - the query was failing silently against
      // the real database (mocked tests never caught this since a mock
      // doesn't validate the query string). Normalize to "YYYY-MM-DD"
      // before it touches the query.
      const startISO = formatToDateString(startDate);
      const endISO = formatToDateString(endDate);

      const { data: bookings, error } = await supabase
        .from("Bookings")
        .select("id, departure_date")
        .is("deleted_at", null)
        .gte("departure_date", startISO)
        .lte("departure_date", endISO);

      if (error) throw error;

      // Group bookings by month
      const grouped = bookings.reduce((acc, booking) => {
        const date = parseISO(booking.departure_date);
        const month = getMonthKey(date);

        if (!acc[month]) acc[month] = 0;
        acc[month]++;

        return acc;
      }, {});

      // Generate full month range
      const monthKeys = generateMonthKeys(startISO, endISO);

      return monthKeys.map((month) => ({
        month,
        bookings: grouped[month] || 0,
      }));
    },
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
};
