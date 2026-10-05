import { createPortal } from "react-dom";
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useQueryClient } from "@tanstack/react-query";
import { useNotification } from "../contexts/NotificationProvider";
import { CgClose } from "react-icons/cg";
import SlidingSelectorGeneric from "./ui/SlidingSelectorGeneric";
import NotificationCard from "./NotificationCard";
import { useNotifications } from "../hooks/useNotifications";
import { useUser } from "../contexts/UserProvider";
import supabase from "@/supabase-client";

const LoadingCard = () => (
  <div className="flex items-center justify-center text-secondary-text p-6">
    Loading notifications...
  </div>
);

const ErrorCard = () => (
  <div className="flex flex-col items-center justify-center text-error-color border border-dashed border-error-color/50 p-6 rounded-xl">
    Failed to load notifications.
  </div>
);

const NotificationPane = () => {
  const { profile } = useUser();
  const { isOpen, content, closePane } = useNotification();
  const [typeFilter, setTypeFilter] = useState("New");
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);

  const { data: notifications, isLoading, isError } = useNotifications();

  const filtered = useMemo(() => {
    if (!notifications) return [];
    return notifications.filter((n) => {
      if (typeFilter === "All") return true;
      if (typeFilter === "New") return n.read === false;
      if (typeFilter === "Read") return n.read === true;
      return true;
    });
  }, [notifications, typeFilter]);

  const unreadCount = useMemo(
    () => notifications?.filter((n) => !n.read).length ?? 0,
    [notifications]
  );

  // Thousands of notifications rendered as full DOM nodes (each with its
  // own Framer Motion layout animation) is what was freezing the pane on
  // open - only mount the rows actually scrolled into view.
  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 128,
    overscan: 8,
  });

  const handleMarkAllRead = async () => {
    if (!profile?.auth_id || unreadCount === 0) return;

    queryClient.setQueryData(["Notifications", profile.auth_id], (old) =>
      old?.map((n) => (n.read ? n : { ...n, read: true }))
    );

    const { error } = await supabase
      .from("Notification Recipients")
      .update({ read: true })
      .eq("recipient_id", profile.auth_id)
      .eq("read", false);

    if (error) {
      console.error("Failed to mark all notifications as read:", error);
      queryClient.invalidateQueries({
        queryKey: ["Notifications", profile.auth_id],
      });
    }
  };

  if (typeof window === "undefined") return null;
  const root = document.getElementById("notification-root");
  if (!root) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed p-5 inset-0 z-50 flex justify-end bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePane} // Clicking the backdrop closes the pane
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="w-120 overflow-hidden max-w-full h-full bg-primary-bg p-0 shadow-s rounded-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent backdrop close
          >
            {/* Sticky Blur Header */}
            <div className="sticky top-0 z-20 p-4 flex flex-col gap-2 border-b border-border-color/70">
              <div className="flex justify-between items-center text-primary-text">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      className="text-sm text-link-color hover:underline cursor-pointer px-1.5"
                      onClick={handleMarkAllRead}>
                      Mark all as read
                    </button>
                  )}
                  <button
                    className="hover:bg-border-color transition-colors duration-300 rounded-md cursor-pointer p-1.5"
                    onClick={closePane}>
                    <CgClose />
                  </button>
                </div>
              </div>

              {/* Sliding Selector */}
              <SlidingSelectorGeneric
                options={["All", "New", "Read"]}
                value={typeFilter}
                onChange={setTypeFilter}
                notifications={notifications}
              />
            </div>

            {/* Notifications List */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <LoadingCard />
              ) : isError ? (
                <ErrorCard />
              ) : filtered.length > 0 ? (
                <div
                  style={{
                    height: rowVirtualizer.getTotalSize(),
                    position: "relative",
                    width: "100%",
                  }}>
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const notification = filtered[virtualRow.index];
                    return (
                      <div
                        key={notification.id}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                        className="pb-2">
                        <NotificationCard
                          notification={notification}
                          closePane={closePane}
                          userId={profile.auth_id}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-secondary-text border border-dashed border-border-color/50 p-6 rounded-xl">
                  No notifications to show.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    root
  );
};

export default NotificationPane;
