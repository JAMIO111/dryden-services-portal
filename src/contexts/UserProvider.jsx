// UserProvider.js
import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../supabase-client";
import { useAuth } from "./AuthProvider";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { user: authUser } = useAuth();
  const [orgUsers, setOrgUsers] = useState([]); // all employees with auth_id
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authUser) {
      setProfile(null);
      setIsLoading(false);
      localStorage.removeItem("user_profile");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("Employees")
        .select(
          "first_name, surname, job_title, avatar, id, auth_id, notification_preferences"
        )
        .eq("auth_id", authUser.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        setProfile(null);
      } else {
        setProfile(data ?? null);
        if (data) {
          localStorage.setItem("user_profile", JSON.stringify(data));
        }
      }

      setIsLoading(false);
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

  const refreshProfile = async () => {
    if (!authUser) return;

    const { data, error } = await supabase
      .from("Employees")
      .select(
        "first_name, surname, job_title, avatar, id, auth_id, notification_preferences"
      )
      .eq("auth_id", authUser.id)
      .maybeSingle();

    if (error) {
      console.error("Error refreshing profile:", error);
      setProfile(null);
      return;
    }

    setProfile(data);
    localStorage.setItem("user_profile", JSON.stringify(data));
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        setProfile,
        isLoading,
        orgUsers,
        updateProfile,
        refreshProfile,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
