import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase-client";
import { useUser } from "@/contexts/UserProvider";

export const useUpsertBooking = () => {
  const queryClient = useQueryClient();
  const { profile } = useUser();

  return useMutation({
    mutationFn: async (bookingData) => {
      const { property_id, arrival_date, departure_date, id } = bookingData;

      if (!property_id || !arrival_date || !departure_date) {
        throw new Error("Property and valid booking dates are required.");
      }

      // === Check for overlaps ===
      let query = supabase
        .from("Bookings")
        .select("id, arrival_date, departure_date, booking_ref, booking_id")
        .eq("property_id", property_id);

      query = query.is("deleted_at", null);

      if (id) query = query.neq("id", id);

      const { data: existingBookings, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      const toYYYYMMDD = (d) => {
        if (!d) return null;
        const date = new Date(d);
        return date.toISOString().split("T")[0]; // "2026-07-10"
      };

      const newStartStr = toYYYYMMDD(arrival_date);
      const newEndStr = toYYYYMMDD(departure_date);

      const overlappingBooking = existingBookings?.find((b) => {
        const startStr = toYYYYMMDD(b.arrival_date);
        const endStr = toYYYYMMDD(b.departure_date);

        // allow newStart === old end or newEnd === old start
        return newStartStr < endStr && newEndStr > startStr;
      });

      if (overlappingBooking) {
        const formatDate = (date) =>
          new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

        const formattedStart = formatDate(overlappingBooking.arrival_date);
        const formattedEnd = formatDate(overlappingBooking.departure_date);

        const error = new Error(
          `Booking conflict with reference ${
            overlappingBooking.booking_id
          }. Existing booking runs from ${formattedStart} to ${formattedEnd}.`,
        );
        error.code = "OVERLAP";
        error.details = overlappingBooking;
        throw error;
      }

      // === Update: no booking_id regeneration needed ===
      if (id) {
        const { data, error } = await supabase
          .from("Bookings")
          .update({ ...bookingData })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // === Insert: generate sequential booking_id, retrying on collision ===
      // Reading the current max then incrementing is inherently racy if two
      // bookings are created at nearly the same time - both can read the
      // same "last" value and try to insert the same booking_id. This
      // retries with a freshly re-read number if the insert collides,
      // rather than silently creating a duplicate reference. This only
      // fully closes the race if `booking_id` has a UNIQUE constraint in
      // the database (so a collision actually fails instead of succeeding
      // twice) - add one if it doesn't already exist.
      const currentYear = new Date().getFullYear();
      const yearSuffix = String(currentYear).slice(-2);
      const maxAttempts = 5;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const { data: lastBooking, error: refError } = await supabase
          .from("Bookings")
          .select("booking_id")
          .like("booking_id", `BKG-${yearSuffix}-%`)
          .order("booking_id", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (refError) throw refError;

        let nextNumber = 1;
        if (lastBooking?.booking_id) {
          const match = lastBooking.booking_id.match(/BKG-\d{2}-(\d{4})/);
          if (match) nextNumber = parseInt(match[1], 10) + 1;
        }

        const booking_id = `BKG-${yearSuffix}-${String(nextNumber).padStart(4, "0")}`;

        const { data, error } = await supabase
          .from("Bookings")
          .insert({ ...bookingData, booking_id, created_by: profile.id })
          .select()
          .single();

        if (!error) return data;

        const isBookingIdCollision =
          error.code === "23505" && error.message?.includes("booking_id");

        if (!isBookingIdCollision || attempt === maxAttempts - 1) {
          throw error;
        }
        // otherwise loop and try the next number
      }
    },

    onSuccess: (data) => {
      const bookingId = data?.id;
      queryClient.invalidateQueries(["Bookings"]);
      if (bookingId) queryClient.invalidateQueries(["Booking", bookingId]);
    },
  });
};
