import { useQuery } from "@tanstack/react-query";
import supabase from "../supabase-client";

export function useJobs(startDate, endDate) {
  return useQuery({
    queryKey: ["jobs", startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) return [];

      // 1. Fetch bookings in range (by departure date) with property details
      const { data: bookings, error } = await supabase
        .from("Bookings")
        .select(
          `
          id,
          booking_id,
          property_id,
          arrival_date,
          departure_date,
          is_owner_booking,
          Properties (
            id,
            name,
            line_1,
            line_2,
            town,
            postcode,
            what_3_words,
            county,
            check_in,
            check_out,
            service_type,
            hired_laundry,
            notes,
            hired_laundry_items,
            laundry_items
          )
        `,
        )
        .is("deleted_at", null)
        .gte("departure_date", startDate)
        .lte("departure_date", endDate)
        .order("departure_date", { ascending: true });

      if (error) throw error;
      if (!bookings?.length) return [];

      // 2. Extract unique property IDs
      const propertyIds = [...new Set(bookings.map((b) => b.property_id))];

      // 3. Fetch all key codes for these properties
      const { data: keyCodes, error: keyErr } = await supabase
        .from("KeyCodes")
        .select("property_id, code, name")
        .eq("is_private", false)
        .in("property_id", propertyIds);

      if (keyErr) throw keyErr;

      // 4. Fetch the next booking per property after each departure - one
      // batched query covering every property in this window instead of
      // one round-trip per booking (was N+1: 50 bookings -> 50 queries).
      const minDeparture = bookings.reduce(
        (min, b) => (b.departure_date < min ? b.departure_date : min),
        bookings[0].departure_date,
      );

      const { data: candidateBookings, error: nextErr } = await supabase
        .from("Bookings")
        .select("*")
        .in("property_id", propertyIds)
        .gte("arrival_date", minDeparture)
        .is("deleted_at", null)
        .order("arrival_date", { ascending: true });

      if (nextErr) throw nextErr;

      // Group by property, already sorted ascending by arrival_date (from
      // the query above), so each booking just needs the first candidate
      // for its own property with arrival_date >= its departure_date -
      // same "next booking" semantics as the original per-booking query.
      const candidatesByProperty = {};
      for (const candidate of candidateBookings ?? []) {
        (candidatesByProperty[candidate.property_id] ??= []).push(candidate);
      }

      const nextBookingsMap = {};
      for (const booking of bookings) {
        const candidates = candidatesByProperty[booking.property_id] ?? [];
        nextBookingsMap[booking.id] =
          candidates.find((c) => c.arrival_date >= booking.departure_date) ??
          null;
      }

      // 5. Build jobs array
      const jobs = bookings.map((booking) => {
        const propertyKeyCodes = keyCodes
          ?.filter((k) => k.property_id === booking.property_id)
          ?.map((k) => ({ code: k.code, name: k.name }));

        return {
          jobId: booking.id,
          bookingId: booking.booking_id,
          propertyId: booking.property_id,
          propertyDetails: booking.Properties ?? null,
          jobDate: booking.departure_date,
          departureBooking: booking,
          nextArrival: nextBookingsMap[booking.id]?.arrival_date ?? null,
          keyCodes: propertyKeyCodes ?? [],
          bookingDetails: nextBookingsMap[booking.id] ?? null,
        };
      });

      return jobs;
    },
    staleTime: 1000 * 60 * 5, // optional: cache 5 minutes
  });
}
