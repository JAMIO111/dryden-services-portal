import { useCallback } from "react";
import supabase from "../supabase-client";
import { useUser } from "../contexts/UserProvider";

export function useLogChange() {
  const { profile } = useUser();

  const logChange = useCallback(
    async ({ tableName, recordId, changes }) => {
      if (!profile) {
        throw new Error("User profile is not available");
      }

      if (!tableName || !recordId) {
        throw new Error("tableName and recordId are required");
      }

      if (!changes || changes.length === 0) return;

      const { error } = await supabase.from("ChangeLog").insert([
        {
          table_name: tableName,
          record_id: String(recordId),
          changed_by: profile.auth_id,
          changes: changes.map(({ field, label, oldValue, newValue }) => ({
            field,
            label,
            old: oldValue,
            new: newValue,
          })),
        },
      ]);

      if (error) throw error;
    },
    [profile]
  );

  return { logChange };
}
