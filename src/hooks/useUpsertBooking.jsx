import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase-client";

export const useUpsertBooking = () => {
  const queryClient = useQueryClient();

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

      if (id) query = query.neq("id", id);

      const { data: existingBookings, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      const newStart = new Date(arrival_date);
      const newEnd = new Date(departure_date);

      const overlappingBooking = existingBookings?.find((b) => {
        const start = new Date(b.arrival_date);
        const end = new Date(b.departure_date);
        return newStart < end && newEnd > start;
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
            overlappingBooking.booking_ref || overlappingBooking.id
          }. Existing booking runs from ${formattedStart} to ${formattedEnd}.`
        );
        error.code = "OVERLAP";
        error.details = overlappingBooking;
        throw error;
      }

      // === Generate sequential booking_id on INSERT only ===
      let booking_id = bookingData.booking_id;
      if (!id) {
        const currentYear = new Date().getFullYear();
        const yearSuffix = String(currentYear).slice(-2);

        const { data: lastBooking, error: refError } = await supabase
          .from("Bookings")
          .select("booking_id")
          .like("booking_id", `BKG-${yearSuffix}-%`)
          .order("booking_id", { ascending: false })
          .limit(1)
          .single();

        if (refError && refError.code !== "PGRST116") throw refError;

        let nextNumber = 1;
        if (lastBooking?.booking_id) {
          const match = lastBooking.booking_id.match(/BKG-\d{2}-(\d{3})/);
          if (match) nextNumber = parseInt(match[1], 10) + 1;
        }

        const nextNumberStr = String(nextNumber).padStart(3, "0");
        booking_id = `BKG-${yearSuffix}-${nextNumberStr}`;
      }

      // === Upsert ===
      const { data, error } = id
        ? await supabase
            .from("Bookings")
            .update({ ...bookingData, booking_id })
            .eq("id", id)
            .select()
            .single()
        : await supabase
            .from("Bookings")
            .insert({ ...bookingData, booking_id })
            .select()
            .single();

      if (error) throw error;
      return data;
    },

    onSuccess: (data) => {
      const bookingId = data?.id;
      queryClient.invalidateQueries(["Bookings"]);
      if (bookingId) queryClient.invalidateQueries(["Booking", bookingId]);
    },
  });
};
