import { useCallback } from "react";
import supabase from "../supabase-client";
import { useUser } from "../contexts/UserProvider";

export function useCreateNotification() {
  const { profile, orgUsers } = useUser();

  const createNotification = useCallback(
    async ({
      title,
      body,
      metaData = {},
      docRef,
      type = "new", // "new" or "update"
      category, // "lead", "property", "nc" etc.
    }) => {
      if (!profile) {
        throw new Error("User profile is not available");
      }

      if (!category) {
        throw new Error("Notification category is required.");
      }

      // STEP 1: Create the notification
      const authId = profile.auth_id;

      const { data: notif, error: notifError } = await supabase
        .from("Notifications")
        .insert([
          {
            created_by: authId,
            title,
            body,
            meta_data: metaData,
            doc_ref: docRef,
          },
        ])
        .select()
        .single();

      if (notifError) {
        throw new Error(`Failed to create notification: ${notifError.message}`);
      }

      // STEP 2: Filter users by prefs based on CATEGORY + TYPE
      const recipientUsers = orgUsers.filter((user) => {
        const prefs = user.notification_preferences || {};

        // Grab the actual preference for the given category
        const pref = (prefs[category] || "both").toLowerCase();

        if (pref === "disabled") return false;
        if (pref === "both") return true;
        if (pref === "new" && type === "new") return true;
        if (pref === "updates" && type === "update") return true;

        return false;
      });

      // No recipients? Return safely.
      if (recipientUsers.length === 0) return notif;

      // STEP 3: Insert recipients
      const recipientInserts = recipientUsers.map((u) => ({
        notification_id: notif.id,
        recipient_id: u.auth_id,
        read: false,
      }));

      const { error: recipientError } = await supabase
        .from("Notification Recipients")
        .insert(recipientInserts);

      if (recipientError) {
        throw new Error(
          `Failed to assign recipients: ${recipientError.message}`
        );
      }

      return notif;
    },
    [orgUsers, profile]
  );

  return { createNotification };
}
