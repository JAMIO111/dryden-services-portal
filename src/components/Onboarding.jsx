import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CTAButton from "./CTAButton";
import TextInput from "./ui/TextInput";
import RHFTextAreaInput from "./ui/RHFTextArea";
import DatePicker from "./ui/DatePicker";
import { IoMaleFemaleOutline } from "react-icons/io5";
import RHFComboBox from "./ui/RHFComboBox";
import { IoLocationOutline } from "react-icons/io5";
import supabase from "../supabase-client";
import { IoBriefcaseOutline } from "react-icons/io5";
import { RiUserLine } from "react-icons/ri";
import { useAuth } from "../contexts/AuthProvider";
import { useUser } from "../contexts/UserProvider";

const Onboarding = () => {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [gender, setGender] = useState(null);
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { user } = useAuth();
  const { profile, refreshProfile } = useUser();
  const navigate = useNavigate();

  console.log("Onboarding user:", user);
  console.log("Onboarding profile:", profile);

  useEffect(() => {
    if (profile) {
      navigate("/Dashboard", { replace: true });
    }
  }, [profile, navigate]);

  const formatDateForDateColumn = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const validate = () => {
    const newErrors = {};
    if (!firstName.trim())
      newErrors.firstName = { message: "First name is required." };
    if (!surname.trim())
      newErrors.surname = { message: "Surname is required." };
    if (!jobTitle.trim())
      newErrors.jobTitle = { message: "Job title is required." };
    if (!gender) newErrors.gender = { message: "Gender is required." };
    if (!address.trim())
      newErrors.address = { message: "Address is required." };
    if (!dateOfBirth)
      newErrors.dateOfBirth = { message: "Date of birth is required." };
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!user) return;

    setLoading(true);

    const payload = {
      first_name: firstName.trim(),
      middle_name: "",
      surname: surname.trim(),
      dob: dateOfBirth ? formatDateForDateColumn(new Date(dateOfBirth)) : null,
      job_title: jobTitle.trim(),
      auth_id: user.id,
      email: user.email,
      start_date: new Date().toISOString(),
      phone: "",
      gender: gender,
      address: address.trim(),
      avatar: null,
      is_driver: false,
      is_cscs: false,
      ni_number: "",
      utr_number: "",
      contract_type: "",
      notification_preferences: {
        Leads: "both",
        Owners: "both",
        Absences: "both",
        Bookings: "both",
        Meetings: "both",
        Employees: "both",
        Properties: "both",
        "Ad-Hoc Jobs": "both",
        Correspondence: "both",
      },
      is_active: true,
    };

    const { data, error } = await supabase
      .from("Employees")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Onboarding insert error:", error);
      setLoading(false);
      return;
    }

    await refreshProfile();

    setLoading(false);

    navigate("/Dashboard", { replace: true });
  };

  return (
    <div className="relative px-4 py-8 bg-primary-bg flex flex-row gap-10 items-center min-h-screen">
      <img
        src="\Logo-black-on-yellow.png"
        alt="Logo"
        className="w-14 h-14 absolute top-4 left-4 rounded-lg border border-primary-text/50"
      />

      <div className="flex flex-col text-center max-w-2xl mt-12 mb-4 px-20">
        <h1 className="text-2xl font-bold text-primary-text mb-2">
          Let's get you onboarded!
        </h1>
        <p className="text-lg text-secondary-text mt-3">
          Thank you for signing up! Please follow the steps below to complete
          your onboarding process.
        </p>
        <img
          src="/onboarding-illustration.webp"
          alt="Onboarding Illustration"
          className="mx-auto mt-10 w-80 h-60 object-contain"
        />
      </div>

      <div className="flex flex-col bg-secondary-bg p-6 sm:p-8 shadow-s rounded-2xl w-full max-w-2xl">
        <div className="bg-secondary-bg flex flex-row gap-8">
          <div className="flex flex-col gap-4 flex-1">
            <TextInput
              icon={RiUserLine}
              placeholder="e.g. Jamie"
              label="First Name"
              value={firstName}
              error={errors.firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <TextInput
              icon={IoBriefcaseOutline}
              placeholder="e.g. IT Admin"
              label="Job Title"
              value={jobTitle}
              error={errors.jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-4 flex-1">
            <TextInput
              icon={RiUserLine}
              placeholder="e.g. Dryden"
              label="Surname"
              value={surname}
              error={errors.surname}
              onChange={(e) => setSurname(e.target.value)}
            />
            <RHFComboBox
              required
              label="Gender"
              icon={IoMaleFemaleOutline}
              placeholder="Select gender..."
              value={gender}
              onChange={(value) => setGender(value)}
              error={errors.gender}
              options={[
                { id: "male", value: "male", name: "Male" },
                { id: "female", value: "female", name: "Female" },
              ]}
            />
          </div>
        </div>
        <div className="flex flex-col mt-4 gap-5">
          <DatePicker
            required
            label="Date of Birth"
            currentDate={dateOfBirth}
            onChange={setDateOfBirth}
            defaultPageDate={new Date("1990-01-01")}
            placeholder="Select date of birth..."
            error={errors.dateOfBirth}
          />
          <RHFTextAreaInput
            required
            label="Home Address"
            placeholder="e.g. 23 Baker Street, London, UK, NW1 6XE"
            rows={2}
            icon={IoLocationOutline}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            error={errors.address}
          />
          <CTAButton
            type="main"
            text={loading ? "Saving…" : "Complete Onboarding"}
            width="w-full"
            disabled={loading}
            callbackFn={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
