import { useQuery } from "@tanstack/react-query";
import supabase from "../supabase-client";

export const useBookingsByProperty = (startDate, endDate) => {
  return useQuery({
    queryKey: ["BookingsByProperty", startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) return [];

      const { data: bookings, error } = await supabase
        .from("Bookings")
        .select("id, property_id, Properties(name)")
        .is("deleted_at", null)
        .gte("departure_date", startDate)
        .lte("departure_date", endDate);

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
