import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../supabase-client";
import { router } from "../router.jsx";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // `undefined` = loading
  const [error, setError] = useState(null); // Optional error state

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error.message);
          setUser(null);
          setError(error);
        } else {
          setUser(data.session?.user || null);
        }
      } catch (err) {
        console.error("Unexpected error during getSession:", err);
        setUser(null);
        setError(err);
      }
    };

    initAuth();

    const { data: listener, error: listenerError } =
      supabase.auth.onAuthStateChange((_event, session) => {
        try {
          console.log("Auth event:", _event);
          console.log("Session:", session);
          setUser(session?.user || null);

          // A password recovery link can land the browser somewhere other
          // than /reset-password (e.g. if the Supabase project's allowed
          // Redirect URLs don't include it, it silently falls back to the
          // default Site URL) - since that still establishes a valid
          // session, the app would otherwise treat the user as simply
          // logged in and send them to the dashboard. Force them to the
          // reset-password screen whenever this event fires, regardless
          // of where they actually landed.
          if (_event === "PASSWORD_RECOVERY") {
            router.navigate("/reset-password");
          }
        } catch (err) {
          console.error("Error handling auth event:", err);
          setUser(null);
          setError(err);
        }
      });

    if (listenerError) {
      console.error("Error setting up auth listener:", listenerError.message);
    }

    return () => {
      try {
        listener?.subscription?.unsubscribe();
      } catch (err) {
        console.warn("Error unsubscribing from auth listener:", err);
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
