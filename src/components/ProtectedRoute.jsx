import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import Spinner from "./LoadingSpinner";

const ProtectedRoute = () => {
  const { user, isPasswordRecovery } = useAuth();

  if (user === undefined)
    return (
      <div className="w-full bg-primary-bg h-dvh flex flex-col justify-center items-center">
        <Spinner />
      </div>
    ); // Optional: handle loading state

  // A password recovery session establishes a valid user, but it should
  // never be able to browse the app proper until the password is actually
  // reset - keep it penned on /reset-password.
  if (isPasswordRecovery) {
    return <Navigate to="/reset-password" replace />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
