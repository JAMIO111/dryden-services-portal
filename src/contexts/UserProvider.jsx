// UserProvider.js
import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../supabase-client";
import { useAuth } from "./AuthProvider";

const UserContext = createContext(null);

const PROFILE_CACHE_KEY = "user_profile";
const ORG_USERS_CACHE_KEY = "org_users";

export const UserProvider = ({ children }) => {
  const { user: authUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [orgUsers, setOrgUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* -----------------------------
     Hydrate from cache on mount
  ----------------------------- */
  useEffect(() => {
    const cachedProfile = localStorage.getItem(PROFILE_CACHE_KEY);
    if (cachedProfile) {
      try {
        setProfile(JSON.parse(cachedProfile));
      } catch {
        localStorage.removeItem(PROFILE_CACHE_KEY);
      }
    }

    const cachedOrgUsers = localStorage.getItem(ORG_USERS_CACHE_KEY);
    if (cachedOrgUsers) {
      try {
        setOrgUsers(JSON.parse(cachedOrgUsers));
      } catch {
        localStorage.removeItem(ORG_USERS_CACHE_KEY);
      }
    }
  }, []);

  /* -----------------------------
     Fetch current user profile
  ----------------------------- */
  useEffect(() => {
    if (!authUser) {
      setProfile(null);
      setOrgUsers([]);
      setIsLoading(false);
      localStorage.removeItem(PROFILE_CACHE_KEY);
      localStorage.removeItem(ORG_USERS_CACHE_KEY);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("Employees")
        .select(
          "id, first_name, surname, job_title, avatar, auth_id, notification_preferences"
        )
        .eq("auth_id", authUser.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      } else {
        setProfile(data ?? null);
        if (data) {
          localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
        }
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, [authUser]);

  /* -----------------------------
     Fetch all org users
  ----------------------------- */
  useEffect(() => {
    if (!authUser) return;

    const fetchOrgUsers = async () => {
      const { data, error } = await supabase
        .from("Employees")
        .select(
          "id, first_name, surname, job_title, avatar, auth_id, notification_preferences"
        )
        .not("auth_id", "is", null);

      if (error) {
        console.error("Error fetching org users:", error);
        return;
      }

      setOrgUsers(data);
      localStorage.setItem(ORG_USERS_CACHE_KEY, JSON.stringify(data));
    };

    fetchOrgUsers();
  }, [authUser]);

  /* -----------------------------
     Update current profile
  ----------------------------- */
  const updateProfile = async (updates) => {
    if (!profile?.id) return;

    const optimisticProfile = { ...profile, ...updates };
    setProfile(optimisticProfile);
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(optimisticProfile));

    const { error } = await supabase
      .from("Employees")
      .update(updates)
      .eq("id", profile.id);

    if (error) {
      console.error("Error updating profile:", error);
    }
  };

  /* -----------------------------
     Manual refresh helpers
  ----------------------------- */
  const refreshProfile = async () => {
    if (!authUser) return;

    const { data, error } = await supabase
      .from("Employees")
      .select(
        "id, first_name, surname, job_title, avatar, auth_id, notification_preferences"
      )
      .eq("auth_id", authUser.id)
      .maybeSingle();

    if (error) {
      console.error("Error refreshing profile:", error);
      return;
    }

    setProfile(data);
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
  };

  const refreshOrgUsers = async () => {
    const { data, error } = await supabase
      .from("Employees")
      .select(
        "id, first_name, surname, job_title, avatar, auth_id, notification_preferences"
      )
      .not("auth_id", "is", null);

    if (error) {
      console.error("Error refreshing org users:", error);
      return;
    }

    setOrgUsers(data);
    localStorage.setItem(ORG_USERS_CACHE_KEY, JSON.stringify(data));
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        orgUsers,
        isLoading,
        updateProfile,
        refreshProfile,
        refreshOrgUsers,
        setProfile,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
