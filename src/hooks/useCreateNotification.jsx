import { useCallback } from "react";
import supabase from "../supabase-client";
import { useUser } from "../contexts/UserProvider";

export function useCreateNotification() {
  const { profile, orgUsers } = useUser();
  const createNotification = useCallback(
    async ({ title, body, metaData = {}, docRef }) => {
      // Step 1: Create the notification
      if (!profile) {
        throw new Error("User profile is not available");
      }
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

      if (notifError)
        throw new Error(`Failed to create notification: ${notifError.message}`);

      const recipientUsers = orgUsers.filter((u) => u.auth_id === authId);

      // Step 3: Insert recipients
      const recipientInserts = recipientUsers.map((u) => ({
        notification_id: notif.id,
        recipient_id: u.auth_id,
        read: false,
      }));

      const { error: recipientError } = await supabase
        .from("Notification Recipients")
        .insert(recipientInserts);

      if (recipientError)
        throw new Error(
          `Failed to assign recipients: ${recipientError.message}`
        );

      return notif;
    },
    []
  );

  return { createNotification };
}
