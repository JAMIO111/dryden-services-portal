// UserProvider.js
import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../supabase-client";
import { useAuth } from "./AuthProvider";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(undefined); // undefined = loading
  const [orgUsers, setOrgUsers] = useState([]); // all employees with auth_id

  useEffect(() => {
    if (!authUser) {
      setProfile(null);
      setOrgUsers([]);
      localStorage.removeItem("user_profile");
      return;
    }

    const cached = localStorage.getItem("user_profile");
    if (cached) setProfile(JSON.parse(cached));

    const fetchData = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("Employees")
          .select(
            "first_name, surname, job_title, avatar, id, auth_id, notification_preferences"
          )
          .eq("auth_id", authUser.id)
          .maybeSingle();

        if (profileError) {
          console.error(profileError);
          setProfile(null);
        } else if (profileData) {
          setProfile(profileData);
          localStorage.setItem("user_profile", JSON.stringify(profileData));
        }

        const { data: usersData, error: usersError } = await supabase
          .from("Employees")
          .select(
            "first_name, surname, job_title, avatar, id, auth_id, notification_preferences"
          )
          .not("auth_id", "is", null);

        if (usersError) {
          console.error(usersError);
          setOrgUsers([]);
        } else {
          setOrgUsers(usersData || []);
        }
      } catch (err) {
        console.error(err);
        setProfile(null);
        setOrgUsers([]);
      }
    };

    fetchData();
  }, [authUser]);

  // Add this function to update profile
  const updateProfile = async (updates) => {
    if (!profile?.id) return;

    const newProfile = { ...profile, ...updates };
    setProfile(newProfile); // update local state immediately

    localStorage.setItem("user_profile", JSON.stringify(newProfile));

    const { error } = await supabase
      .from("Employees")
      .update(updates)
      .eq("id", profile.id);

    if (error) console.error("Error updating profile:", error);
  };

  return (
    <UserContext.Provider
      value={{ profile, setProfile, orgUsers, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
