import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase-client";

export const useUpsertOwner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ownerData, propertiesForm }) => {
      let ownerId = ownerData.id;
      let result;

      // ----- Upsert Owner -----
      if (ownerId) {
        const { data, error } = await supabase
          .from("Owners")
          .update(ownerData)
          .eq("id", ownerId)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from("Owners")
          .insert(ownerData)
          .select()
          .single();
        if (error) throw error;
        ownerId = data.id;
        result = data;
      }

      // ----- Property Link Handling -----
      // Always fetch existing links
      const { data: existing, error: fetchError } = await supabase
        .from("PropertyOwner")
        .select("property_id")
        .eq("owner_id", ownerId);
      if (fetchError) throw fetchError;

      const formPropertyIds = (propertiesForm || [])
        .map((p) => p.id)
        .filter(Boolean);

      // Upsert new properties
      const toUpsert = (propertiesForm || [])
        .filter((p) => !existing.some((e) => e.property_id === p.id))
        .map((p) => ({ owner_id: ownerId, property_id: p.id }));

      if (toUpsert.length > 0) {
        const { error: upsertError } = await supabase
          .from("PropertyOwner")
          .upsert(toUpsert, { onConflict: ["owner_id", "property_id"] });
        if (upsertError) throw upsertError;
      }

      // Delete removed properties
      const toDelete = existing
        .filter((e) => !formPropertyIds.includes(e.property_id))
        .map((e) => e.property_id);

      if (toDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("PropertyOwner")
          .delete()
          .eq("owner_id", ownerId)
          .in("property_id", toDelete);
        if (deleteError) throw deleteError;
      }

      return result;
    },

    onSuccess: (result) => {
      queryClient.invalidateQueries(["Owners"]);
      queryClient.invalidateQueries(["Owner", result.id]);
    },
  });
};
