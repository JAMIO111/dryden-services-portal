import { Link, useRouteError } from "react-router-dom";

// Generic errorElement for the auth route group (login/signup/forgot
// password/reset password). Without this, any render error there -
// including a stale lazy-loaded chunk after a fresh deploy, which React
// Router treats as a thrown render error - fell through to React
// Router's raw, unstyled default error page instead of anything useful.
const AuthErrorFallback = () => {
  const error = useRouteError();
  console.error("Auth route error:", error);

  return (
    <div className="flex flex-col items-start justify-center h-full w-full max-w-120 p-6 sm:p-10 gap-6">
      <img
        src="/Logo-black-on-yellow.png"
        alt="Logo"
        className="w-14 absolute top-5 left-5 rounded-lg mb-4 border border-primary-text/50"
      />
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl text-left text-primary-text font-semibold">
          Something Went Wrong
        </h1>
        <h2 className="text-left text-md font-light text-secondary-text">
          This page failed to load. This is usually temporary - reloading
          the page fixes it.
        </h2>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <button
          onClick={() => window.location.reload()}
          className="bg-cta-btn-bg border border-cta-btn-border hover:border-cta-btn-border-hover hover:bg-cta-btn-bg-hover text-primary-text p-2 rounded-lg cursor-pointer text-lg">
          Reload Page
        </button>
        <Link to="/login" className="text-link-color underline text-center">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default AuthErrorFallback;
