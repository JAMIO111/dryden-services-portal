import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase-client";
import { useUser } from "../contexts/UserProvider";

// Mount this exactly once near the app root (see App.jsx). useNotifications()
// is called from several places (Header's badge, NotificationPane's list),
// so the subscription lives here instead - one realtime channel per session
// rather than one per consumer.
export function useNotificationsRealtime() {
  const { profile } = useUser();
  const queryClient = useQueryClient();
  const authId = profile?.auth_id;

  useEffect(() => {
    if (!authId) return;

    // A new notification, a read-status change from another tab/device,
    // etc. all land in "Notification Recipients" for this user. Just
    // invalidate and let the existing RPC-backed query refetch - it
    // already does the join/shaping, no need to duplicate that here.
    const channel = supabase
      .channel(`notification-recipients-${authId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Notification Recipients",
          filter: `recipient_id=eq.${authId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["Notifications", authId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authId, queryClient]);
}
