import { useState } from "react";
import CTAButton from "../CTAButton";
import ProfileImageSection from "../ProfileImageSection";
import TextInput from "../ui/TextInput";
import { useUser } from "@/contexts/UserProvider";
import { useAuth } from "@/contexts/AuthProvider";
import supabase from "@/supabase-client";
import PasswordField from "../ui/PasswordField";
import { useToast } from "@/contexts/ToastProvider";

const SettingsAccount = () => {
  const { user: authUser } = useAuth();
  const { profile, updateProfile } = useUser();
  const { showToast } = useToast();

  // Editable personal info
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [surname, setSurname] = useState(profile?.surname || "");
  const [jobTitle, setJobTitle] = useState(profile?.job_title || "");
  const infoDirty =
    firstName !== (profile?.first_name || "") ||
    surname !== (profile?.surname || "") ||
    jobTitle !== (profile?.job_title || "");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Loading states
  const [savingInfo, setSavingInfo] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Update personal information
  const handleSaveInfo = async () => {
    if (!profile) return;

    setSavingInfo(true);

    const updates = {
      first_name: firstName,
      surname: surname,
      job_title: jobTitle,
    };

    const { error } = await supabase
      .from("Employees")
      .update(updates)
      .eq("auth_id", profile.auth_id);

    setSavingInfo(false);

    if (error) {
      showToast({
        type: "error",
        title: "Update Failed",
        message: "Failed to update profile information: " + error.message,
      });
      return;
    }
    await updateProfile(updates);
    showToast({
      type: "success",
      title: "Profile Updated",
      message: "Your profile information has been successfully updated.",
    });
  };

  // Change password
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showToast({
        type: "error",
        title: "Incomplete Fields",
        message: "Please fill out all password fields.",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast({
        type: "error",
        title: "Password Mismatch",
        message: "New password and confirmation do not match.",
      });
      return;
    }

    setChangingPassword(true);

    // Re-authenticate the user (Supabase requires this)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authUser.email,
      password: currentPassword,
    });

    if (signInError) {
      setChangingPassword(false);
      showToast({
        type: "error",
        title: "Authentication Failed",
        message: "Current password is incorrect.",
      });
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setChangingPassword(false);

    if (updateError) {
      showToast({
        type: "error",
        title: "Update Failed",
        message: "Failed to change password: " + updateError.message,
      });
      return;
    }

    showToast({
      type: "success",
      title: "Password Changed",
      message: "Your password has been successfully updated.",
    });
    // Clear password fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  return (
    <div className="flex flex-col lg:flex-row w-full overflow-y-auto">
      <div className="flex flex-col p-3 gap-3 lg:w-1/2 w-full">
        {/* Profile Photo */}
        <div className="flex flex-row justify-between shadow-s items-center bg-tertiary-bg rounded-xl p-3">
          <div className="flex flex-col w-1/2 gap-2 justify-start h-full">
            <p className="text-primary-text text-xl">Profile Picture</p>
            <p className="text-secondary-text text-sm mb-3">
              Add an image of yourself so your team can easily identify you.
            </p>
          </div>
          <ProfileImageSection
            noImageText={`${profile?.first_name?.[0] ?? ""} ${
              profile?.surname?.[0] ?? ""
            }`}
            item={profile}
            bucket="avatars"
            path="employees"
            table="Employees"
            width="w-32"
            height="h-32"
            aspectRatio="aspect-square"
            onImageChange={async () => {
              await refreshProfile();
            }}
          />
        </div>

        {/* Personal Info */}
        <div className="flex flex-col bg-tertiary-bg shadow-s rounded-xl">
          <p className="text-primary-text text-xl mb-3 py-2 px-3 border-b border-secondary-text/20">
            Personal Information
          </p>

          <div className="flex flex-col text-primary-text gap-3">
            <div className="px-4 py-2 flex flex-col gap-3">
              <div className="flex items-center justify-between flex-row gap-3">
                <p className="flex-1/3">First Name</p>
                <TextInput
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name..."
                />
              </div>

              <div className="flex items-center justify-between flex-row gap-3">
                <p className="flex-1/3">Surname</p>
                <TextInput
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Surname..."
                />
              </div>

              <div className="flex items-center justify-between flex-row gap-3">
                <p className="flex-1/3">Job Title</p>
                <TextInput
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Job Title..."
                />
              </div>
            </div>
            <div className="flex items-center p-4 gap-3 border-t border-secondary-text/20">
              <CTAButton
                type="main"
                text={savingInfo ? "Saving..." : "Save Changes"}
                callbackFn={handleSaveInfo}
              />
              {infoDirty && (
                <CTAButton
                  type="cancel"
                  text="Revert Changes"
                  disabled={savingInfo}
                  callbackFn={() => {
                    setFirstName(profile?.first_name || "");
                    setSurname(profile?.surname || "");
                    setJobTitle(profile?.job_title || "");
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex flex-col p-3 lg:w-1/2 w-full gap-3">
        {/* Password */}
        <div className="flex flex-col gap-5 bg-tertiary-bg shadow-s rounded-xl">
          <div className="flex px-4 pt-2 border-b border-secondary-text/20 flex-col">
            <p className="text-primary-text text-xl">Password</p>
            <p className="text-secondary-text text-sm mb-2">
              Update your password below.
            </p>
          </div>
          <div className="px-4 flex flex-col gap-3">
            <PasswordField
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password..."
            />

            <PasswordField
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password..."
            />

            <PasswordField
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm New Password..."
            />
          </div>
          <div className="border-t p-4 border-secondary-text/20">
            <CTAButton
              type="main"
              text={changingPassword ? "Updating..." : "Change Password"}
              callbackFn={handleChangePassword}
            />
          </div>
        </div>

        {/* Delete Account (optional later) */}
        <div className="flex flex-col shadow-s bg-tertiary-bg rounded-xl">
          <div className="flex px-4 pt-2 border-b border-secondary-text/20 flex-col">
            <p className="text-primary-text text-xl">Delete Account</p>
            <p className="text-secondary-text text-sm mb-3">
              Permanently delete your account. This cannot be undone.
            </p>
          </div>
          <div className="p-4">
            <CTAButton type="cancel" text="Delete Account" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsAccount;
