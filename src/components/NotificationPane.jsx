import { createPortal } from "react-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "../contexts/NotificationProvider";
import { CgClose } from "react-icons/cg";
import SlidingSelectorGeneric from "./ui/SlidingSelectorGeneric";
import NotificationCard from "./NotificationCard";
import { useNotifications } from "../hooks/useNotifications";
import { useUser } from "../contexts/UserProvider";

const NotificationPane = () => {
  const { profile } = useUser();
  const { isOpen, content, closePane } = useNotification();
  const [typeFilter, setTypeFilter] = useState("New");

  const { data: notifications, isLoading, isError } = useNotifications();
  console.log("Notifications:", notifications);

  const filtered = notifications
    ? notifications.filter((n) => {
        if (typeFilter === "All") return true;
        if (typeFilter === "New") return n.read === false;
        if (typeFilter === "Read") return n.read === true;
        return true;
      })
    : [];

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
                <button
                  className="hover:bg-border-color transition-colors duration-300 rounded-md cursor-pointer p-1.5"
                  onClick={closePane}>
                  <CgClose />
                </button>
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
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4">
              {isLoading ? (
                <LoadingCard />
              ) : isError ? (
                <ErrorCard />
              ) : filtered.length > 0 ? (
                filtered.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    closePane={closePane}
                    userId={profile.auth_id}
                  />
                ))
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
