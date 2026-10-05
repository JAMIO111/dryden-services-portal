import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../supabase-client";
import { useToast } from "./ToastProvider";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // `undefined` = loading
  const [error, setError] = useState(null); // Optional error state
  // A password recovery link can land the browser somewhere other than
  // /reset-password (e.g. if the Supabase project's allowed Redirect URLs
  // don't include it, it silently falls back to the default Site URL) -
  // since that still establishes a valid session, every gate that decides
  // "where does a logged-in user go" (HomeRedirect, ProtectedRoute) needs
  // to know this is a recovery session, not a normal login, and send them
  // to /reset-password instead of the dashboard. This is read alongside
  // `user` in the same render pass those gates already use, so there's no
  // race between "user is now truthy -> go to dashboard" rendering before
  // a separate imperative redirect gets a chance to run.
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // If a recovery/PKCE code is still sitting in the URL once init
    // finishes, Supabase's client never attempted the exchange at all -
    // it only does so when it finds a matching code-verifier in this
    // browser's localStorage, which is only ever present in the browser
    // that originally requested the link. Clicking the email link on a
    // different device/browser (very common on mobile, e.g. an email
    // app's separate in-app browser) silently fails this way, with no
    // error - the user just ends up wherever an unauthenticated visitor
    // goes, with no idea why. Captured before any async work so it
    // reflects the URL exactly as the page was loaded.
    const hadRecoveryLink =
      new URLSearchParams(window.location.search).has("code") ||
      window.location.hash.includes("type=recovery");

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error.message);
          setUser(null);
          setError(error);
        } else {
          setUser(data.session?.user || null);
          if (hadRecoveryLink && !data.session?.user) {
            // Could be a password reset or a signup confirmation link -
            // both use the same PKCE "?code=" shape, and in this failure
            // case no session ever gets established to tell them apart,
            // so keep the wording flow-agnostic.
            showToast({
              type: "error",
              title: "Link Didn't Work",
              message:
                "This usually happens when a confirmation link is opened in a different browser or device than the one used to request it. Please request a new link and open it in that same browser.",
            });
          }
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

          if (_event === "PASSWORD_RECOVERY") {
            setIsPasswordRecovery(true);
          } else if (_event === "SIGNED_OUT" || _event === "SIGNED_IN") {
            // A fresh sign-in or sign-out means whatever recovery flow was
            // in progress is over - stop steering the user back to
            // /reset-password.
            setIsPasswordRecovery(false);
          }

          setUser(session?.user || null);
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

  const clearPasswordRecovery = () => setIsPasswordRecovery(false);

  return (
    <AuthContext.Provider
      value={{ user, error, isPasswordRecovery, clearPasswordRecovery }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
