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

  return (
    // This is the only thing that changed — proper flex height flow
    <div className="flex flex-col h-full min-h-0">
      {/* Sticky bar — exactly as you had it */}
      <div className="sticky top-0 z-10 bg-secondary-bg pb-3">
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

      {/* THIS is the fix: flex-1 + overflow-y-auto + min-h-0 */}
      <div className="flex-1 overflow-y-auto pb-4 min-h-0">
        <div className="flex flex-col gap-4">
          {Object.entries(prefs).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-primary-text w-100">{key}</span>
              <SlidingSelector
                options={options}
                value={options.find((o) => o.id === value)}
                onChange={(option) => handleSelect(key, option)}
                getLabel={(opt) => opt.label}
                getValue={(opt) => opt.id}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsNotifications;
