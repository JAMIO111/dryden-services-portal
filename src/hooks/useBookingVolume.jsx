import { useQuery } from "@tanstack/react-query";
import supabase from "../supabase-client";

const parseISO = (value) => {
  // generateMonthKeys is called with whatever startDate/endDate the caller
  // passed into the hook - that's a Date object from every current call
  // site (getStartOfMonth/getEndOfMonth), not an ISO string. Calling
  // .split on a Date threw here, silently failing the whole query (no
  // catch logs it - React Query just leaves `data` undefined forever).
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const [y, m, d] = value.split("-").map(Number);
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

      const { data: bookings, error } = await supabase
        .from("Bookings")
        .select("id, departure_date")
        .is("deleted_at", null)
        .gte("departure_date", startDate) // ISO string works perfectly in SQL
        .lte("departure_date", endDate);

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
      const monthKeys = generateMonthKeys(startDate, endDate);

      return monthKeys.map((month) => ({
        month,
        bookings: grouped[month] || 0,
      }));
    },
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
};
