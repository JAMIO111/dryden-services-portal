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

    // Load cached profile first
    const cached = localStorage.getItem("user_profile");
    if (cached) {
      setProfile(JSON.parse(cached));
    }

    const fetchData = async () => {
      try {
        // Fetch current user profile
        const { data: profileData, error: profileError } = await supabase
          .from("Employees")
          .select(
            "first_name, surname, job_title, avatar, id, auth_id, notification_preferences"
          )
          .eq("auth_id", authUser.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile", profileError);
          setProfile(null);
        } else if (profileData) {
          setProfile(profileData);
          localStorage.setItem("user_profile", JSON.stringify(profileData));
        }

        // Fetch all org users with auth_id
        const { data: usersData, error: usersError } = await supabase
          .from("Employees")
          .select("first_name, surname, job_title, avatar, id, auth_id")
          .not("auth_id", "is", null); // only employees with auth_id

        if (usersError) {
          console.error("Error fetching org users", usersError);
          setOrgUsers([]);
        } else {
          setOrgUsers(usersData || []);
        }
      } catch (err) {
        console.error("Unexpected error fetching users", err);
        setProfile(null);
        setOrgUsers([]);
      }
    };

    fetchData();
  }, [authUser]);

  return (
    <UserContext.Provider value={{ profile, setProfile, orgUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
