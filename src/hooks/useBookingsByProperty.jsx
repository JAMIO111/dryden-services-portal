import { useQuery } from "@tanstack/react-query";
import supabase from "../supabase-client";
import { formatToDateString } from "../lib/HelperFunctions";

export const useBookingsByProperty = (startDate, endDate) => {
  return useQuery({
    queryKey: ["BookingsByProperty", startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) return [];

      // startDate/endDate are typically Date objects; a raw Date serializes
      // via .gte()/.lte() as its toString() form, which Postgres can't
      // parse as a date filter. Normalize to "YYYY-MM-DD" first.
      const { data: bookings, error } = await supabase
        .from("Bookings")
        .select("id, property_id, Properties(name)")
        .is("deleted_at", null)
        .gte("departure_date", formatToDateString(startDate))
        .lte("departure_date", formatToDateString(endDate));

      if (error) throw error;

      const grouped = bookings.reduce((acc, booking) => {
        const name = booking.Properties?.name || "Unknown Property";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(grouped)
        .map(([property, bookings]) => ({ property, bookings }))
        .sort((a, b) => b.bookings - a.bookings);
    },
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
};
