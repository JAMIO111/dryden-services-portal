import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../supabase-client";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { useToast } from "@/contexts/ToastProvider";
import { CiLock } from "react-icons/ci";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        showToast({
          type: "error",
          title: "Invalid Link",
          message: "Your password reset link is invalid or expired.",
        });
      }
    });
  }, []);

  const resetPassword = async ({ password }) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      showToast({
        type: "success",
        title: "Password Updated",
        message: "Your password has been reset.",
      });

      navigate("/login");
    } catch (err) {
      showToast({
        type: "error",
        title: "Reset Failed",
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start justify-center h-full w-120 p-10 gap-6">
      <img
        src="/Logo-black-on-yellow.png"
        alt="Logo"
        className="w-14 absolute top-5 left-5 rounded-lg mb-4 border border-primary-text/50"
      />
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl text-left text-primary-text font-semibold">
          Reset Your Password
        </h1>
        <h2 className="text-left text-md font-light text-secondary-text">
          Enter your new password.
        </h2>
      </div>

      <form
        onSubmit={handleSubmit(resetPassword)}
        className="flex w-full flex-col gap-5">
        <div className="flex relative flex-col gap-1">
          <label className="text-left text-primary-text">
            Password <span className="text-error-color">*</span>
          </label>
          <div className="w-full relative">
            <CiLock className="absolute left-2 top-2 text-secondary-text w-6 h-6" />
            <input
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                maxLength: {
                  value: 64,
                  message: "Password must be less than 64 characters",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                  message:
                    "Password must include uppercase, lowercase, number, and special char",
                },
              })}
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              className="border w-full pl-10 text-primary-text border-border-color h-10 hover:border-border-dark-color p-2 bg-text-input-color rounded-lg focus-within:border-brand-primary focus-within:hover:border-brand-primary"
            />
          </div>
          {errors.password && (
            <p className="text-error-color text-xs">
              {errors.password.message}
            </p>
          )}
          <button
            type="button"
            className="cursor-pointer"
            onMouseDown={() => setShowPassword(true)}
            onMouseUp={() => setShowPassword(false)}
            onMouseLeave={() => setShowPassword(false)}>
            {showPassword ? (
              <IoEyeOutline className="text-secondary-text w-5 h-5 absolute right-5 top-9.5" />
            ) : (
              <IoEyeOffOutline className="text-secondary-text w-5 h-5 absolute right-5 top-9.5" />
            )}
          </button>
        </div>

        <div className="flex relative flex-col gap-1">
          <label className="text-left text-primary-text">
            Confirm Password <span className="text-error-color">*</span>
          </label>
          <div className="w-full relative">
            <CiLock className="absolute left-2 top-2 text-secondary-text w-6 h-6" />
            <input
              {...register("confirmPassword", {
                required: "Confirm your password",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match",
              })}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              className="w-full pl-10 border text-primary-text border-border-color h-10 hover:border-border-dark-color p-2 bg-text-input-color rounded-lg focus-within:border-brand-primary focus-within:hover:border-brand-primary"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-error-color text-xs">
              {errors.confirmPassword.message}
            </p>
          )}
          <button
            type="button"
            className="cursor-pointer"
            onMouseDown={() => setShowConfirmPassword(true)}
            onMouseUp={() => setShowConfirmPassword(false)}
            onMouseLeave={() => setShowConfirmPassword(false)}>
            {showConfirmPassword ? (
              <IoEyeOutline className="text-secondary-text w-5 h-5 absolute right-5 top-9.5" />
            ) : (
              <IoEyeOffOutline className="text-secondary-text w-5 h-5 absolute right-5 top-9.5" />
            )}
          </button>
        </div>

        <div className="flex flex-col">
          <button
            type="submit"
            disabled={loading}
            className={`bg-cta-btn-bg border border-cta-btn-border hover:border-cta-btn-border-hover hover:bg-cta-btn-bg-hover text-primary-text p-2 rounded-lg cursor-pointer text-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          <Link
            to="/login"
            className={`text-link-color underline mt-2 ${
              loading ? "pointer-events-none opacity-50" : ""
            }`}>
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
