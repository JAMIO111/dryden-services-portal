import CTAButton from "../CTAButton";
import ProfileImageSection from "../ProfileImageSection";
import TextInput from "../ui/TextInput";
import { useUser } from "@/contexts/UserProvider";
import { useAuth } from "@/contexts/AuthProvider";
import { PiPassword } from "react-icons/pi";

const SettingsAccount = () => {
  const { user: authUser } = useAuth();
  const { profile } = useUser();
  console.log("profile:", profile);
  console.log("authUser:", authUser);
  return (
    <div className="flex flex-col lg:flex-row w-full overflow-y-auto">
      <div className="flex flex-col p-3 gap-3 lg:w-1/2 w-full">
        {/* Photo Card */}
        <div className="flex flex-row justify-between shadow-s items-center bg-tertiary-bg rounded-xl p-3">
          <div className="flex flex-col w-1/2 gap-2 justify-start h-full">
            <p className="text-primary-text text-xl">Profile Picture</p>
            <p className="text-secondary-text text-sm mb-3">
              Add an image of yourself so your team can easily identify you.
            </p>
          </div>
          <ProfileImageSection
            noImageText={`${profile?.first_name.charAt(
              0
            )} ${profile?.surname.charAt(0)}`}
            item={profile}
            bucket="avatars"
            path="employees"
            table="Employees"
            width="w-32"
            height="h-32"
            aspectRatio="aspect-square"
            onImageChange={(url) => {
              console.log("New avatar URL:", url);
            }}
          />
        </div>

        {/* Personal Info Card */}
        <div className="flex flex-col bg-tertiary-bg shadow-s rounded-xl">
          <p className="text-primary-text text-xl mb-3 py-2 px-3 border-b border-secondary-text/20">
            Personal Information
          </p>
          <div className="p-3 flex flex-col text-primary-text gap-3">
            <div className="flex items-center justify-between flex-row gap-3">
              <p className="flex-1/3">First Name</p>
              <TextInput
                icon={PiPassword}
                value={profile?.first_name}
                placeholder="First Name..."
              />
            </div>
            <div className="flex items-center justify-between flex-row gap-3">
              <p className="flex-1/3">Surname</p>
              <TextInput
                icon={PiPassword}
                value={profile?.surname}
                placeholder="Surname..."
              />
            </div>
            <div className="flex items-center justify-between flex-row gap-3">
              <p className="flex-1/3">Job Title</p>
              <TextInput
                icon={PiPassword}
                value={profile?.job_title}
                placeholder="Job Title..."
              />
            </div>
            <div className="flex items-center justify-between flex-row gap-3">
              <p className="flex-1/3">Email Address</p>
              <TextInput
                icon={PiPassword}
                value={profile?.email}
                placeholder="Email..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col p-3 lg:w-1/2 w-full gap-3">
        {/* Password Card */}
        <div className="flex flex-col gap-3 bg-tertiary-bg shadow-s rounded-xl p-3">
          <p className="text-primary-text text-xl mb-1">Password</p>
          <p className="text-secondary-text text-sm mb-3">
            You can change your password here. Please enter your current
            password and then your new password.
          </p>
          <TextInput icon={PiPassword} placeholder="Current Password..." />
          <TextInput icon={PiPassword} placeholder="New Password..." />
          <TextInput icon={PiPassword} placeholder="Confirm New Password..." />
          <div className="h-10 flex flex-row justify-between items-center">
            <CTAButton type="main" text="Change Password" />
          </div>
        </div>
        {/* Optional small card */}
        <div className="flex flex-col shadow-s bg-tertiary-bg rounded-xl p-3">
          <p className="text-primary-text text-xl mb-2">Delete Account</p>
          <p className="text-secondary-text text-sm mb-3">
            Permanently delete your account. This cannot be undone.
          </p>
          <CTAButton type="cancel" text="Delete Account" />
        </div>
      </div>
    </div>
  );
};

export default SettingsAccount;
