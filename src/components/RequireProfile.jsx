import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";
import Spinner from "./LoadingSpinner";

const RequireProfile = () => {
  const { profile, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="w-full bg-primary-bg h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export default RequireProfile;
