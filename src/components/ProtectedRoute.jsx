import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import Spinner from "./LoadingSpinner";

const ProtectedRoute = () => {
  const { user } = useAuth();

  if (user === undefined)
    return (
      <div className="w-full bg-primary-bg h-screen flex flex-col justify-center items-center">
        <Spinner />
      </div>
    ); // Optional: handle loading state

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
