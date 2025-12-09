import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserProvider";
import SlidingSelector from "../ui/SlidingSelectorGeneric";
import CTAButton from "../CTAButton";

const options = [
  { label: "New Additions", id: "new" },
  { label: "Updates", id: "updates" },
  { label: "Both", id: "both" },
  { label: "Disabled", id: "disabled" },
];

const SettingsNotifications = () => {
  const { profile, updateProfile } = useUser();
  const [prefs, setPrefs] = useState(profile?.notification_preferences || {});

  useEffect(() => {
    setPrefs(profile?.notification_preferences || {});
  }, [profile?.notification_preferences]);

  if (!profile) return null;

  const handleSelect = (key, option) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: option.id,
    }));
  };

  const handleSave = async () => {
    await updateProfile({ notification_preferences: prefs });
  };

  const hasChanges =
    JSON.stringify(prefs) !== JSON.stringify(profile.notification_preferences);

  // --- identical behaviour to LeadList ---
  useEffect(() => {
    const container = document.getElementById("settings-scroll");
    const header = document.getElementById("settings-header");

    if (!container || !header) return;

    const onScroll = () => {
      if (container.scrollTop > 10) {
        header.setAttribute("data-scrolled", "true");
      } else {
        header.removeAttribute("data-scrolled");
      }
    };

    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, []);
  // ----------------------------------------

  return (
    <div className="flex flex-col bg-secondary-bg shadow-s flex-1 min-h-0 p-0 overflow-hidden">
      {/* SCROLL CONTAINER */}
      <div
        id="settings-scroll"
        className="flex flex-col flex-1 overflow-y-auto pt-0.5 [&::-webkit-scrollbar]:hidden min-h-0">
        {/* BLUR/STICKY HEADER */}
        <div
          id="settings-header"
          className="
            sticky top-0 z-11 p-3 pb-1 mx-0.5 rounded-t-2xl
            backdrop-blur-md bg-secondary-bg/70
            border-b border-transparent
            data-[scrolled=true]:border-border-color/60
            data-[scrolled=true]:bg-secondary-bg/50
          ">
          <div className="flex flex-row items-start justify-between mb-3">
            <div className="flex flex-col">
              <h1 className="text-xl text-primary-text font-bold mb-1">
                Notification Settings
              </h1>
              <p className="text-secondary-text">
                Manage your notification preferences and settings below.
              </p>
            </div>

            {hasChanges && (
              <div className="flex flex-row gap-3">
                <CTAButton
                  type="cancel"
                  text="Revert Changes"
                  callbackFn={() => setPrefs(profile.notification_preferences)}
                />
                <CTAButton
                  type="main"
                  text="Save Changes"
                  callbackFn={handleSave}
                />
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          {Object.entries(prefs).map(([key, value]) => (
            <div className="flex flex-col gap-2" key={key}>
              <div className="flex items-center justify-between">
                <span className="text-secondary-text text-lg w-100">{key}</span>
                <SlidingSelector
                  options={options}
                  value={options.find((o) => o.id === value)}
                  onChange={(option) => handleSelect(key, option)}
                  getLabel={(opt) => opt.label}
                  getValue={(opt) => opt.id}
                />
              </div>
              <div className="h-px bg-border-color"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsNotifications;
