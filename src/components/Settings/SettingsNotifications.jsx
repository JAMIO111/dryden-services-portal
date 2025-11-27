import React, { useState } from "react";
import { useUser } from "@/contexts/UserProvider";
import SlidingSelector from "../ui/SlidingSelectorGeneric";

const options = [
  { label: "New Records", id: "new" },
  { label: "Updates", id: "updates" },
  { label: "Both", id: "both" },
  { label: "Disabled", id: "disabled" },
];

const SettingsNotifications = () => {
  const { profile, updateProfile } = useUser();
  const [prefs, setPrefs] = useState(profile?.notification_preferences || {});

  const handleSelect = (key, option) => {
    const newPrefs = { ...prefs, [key]: option.id };
    setPrefs(newPrefs);
    updateProfile({ notification_preferences: newPrefs }); // assumes your context has an updateProfile function
  };

  if (!profile) return null;

  return (
    <div className="p-5">
      <h1 className="text-2xl text-primary-text font-bold mb-4">
        Notification Settings
      </h1>
      <p className="mb-6 text-secondary-text">
        Manage your notification preferences and settings below.
      </p>

      <div className="flex flex-col gap-4">
        {Object.entries(prefs).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-primary-text w-100 capitalize">
              {key.replace(/_/g, " ")}
            </span>
            <SlidingSelector
              options={options}
              value={options.find((o) => o.id === value)} // match the current selected value
              onChange={(option) => handleSelect(key, option)}
              getLabel={(opt) => opt.label}
              getValue={(opt) => opt.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsNotifications;
