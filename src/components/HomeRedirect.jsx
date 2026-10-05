import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

export default function HomeRedirect() {
  const { user, isPasswordRecovery } = useAuth();

  if (user === undefined) return <div>Loading...</div>; // or a spinner

  // A password recovery session still counts as "logged in", but it should
  // never be treated as a normal visit - send it straight to the reset
  // form instead of the dashboard.
  if (isPasswordRecovery) {
    return <Navigate to="/reset-password" replace />;
  }

  // Redirect based on user state
  if (user) {
    return <Navigate to="/Dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
}
