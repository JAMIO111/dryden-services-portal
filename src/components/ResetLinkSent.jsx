import { MdOutlineMarkEmailRead } from "react-icons/md";
import { Link } from "react-router-dom";

const ResetLinkSent = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-fit p-10 gap-6">
      <MdOutlineMarkEmailRead className="text-[150px] text-cta-color" />
      <h1 className="text-3xl text-center text-primary-text font-semibold">
        Reset Link Sent
      </h1>
      <h2 className="text-center text-md font-light w-120 text-secondary-text">
        If an account with the provided email exists, a password reset link has
        been sent. Please check your email.
      </h2>
      <Link to="/login" className="text-link-color underline">
        Return to Login
      </Link>
    </div>
  );
};

export default ResetLinkSent;
