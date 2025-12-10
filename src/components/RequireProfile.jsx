import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";
import Spinner from "./LoadingSpinner";

const RequireProfile = () => {
  const { profile } = useUser();

  // Still loading
  if (profile === undefined) {
    return (
      <div className="w-full bg-primary-bg h-screen flex flex-col justify-center items-center">
        <Spinner />
      </div>
    );
  }

  // Logged in, but no employee record → onboarding
  if (profile === null) {
    return <Navigate to="/onboarding" replace />;
  }

  // Profile exists → proceed
  return <Outlet />;
};

export default RequireProfile;
