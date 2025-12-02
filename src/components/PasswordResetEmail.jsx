import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useToast } from "@/contexts/ToastProvider";
import { CiAt } from "react-icons/ci";
import supabase from "../supabase-client";

const PasswordResetEmail = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const sendResetLink = async (data) => {
    setLoading(true);
    const { email } = data;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        showToast({
          type: "error",
          title: "Reset Failed",
          message: "We were unable to send the reset link.",
        });
      } else {
        showToast({
          type: "success",
          title: "Reset Link Sent",
          message: "Check your email for the reset link.",
        });
        navigate("/reset-link-sent");
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start justify-center h-full w-fit p-10 gap-6">
      <img
        src="\Logo-black-on-yellow.png"
        alt="Logo"
        className="w-14 h-14 absolute top-5 left-5 rounded-lg mb-4 border border-primary-text/50"
      />
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl text-left text-primary-text font-semibold">
          Enter your email
        </h1>
        <h2 className="text-left text-md font-light text-secondary-text">
          We will send you an email with instructions to reset your password.
        </h2>
      </div>
      <form
        onSubmit={handleSubmit(sendResetLink)}
        className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-left text-primary-text">
            Email <span className="text-error-color">*</span>
          </label>
          <div className="w-full relative">
            <CiAt className="absolute left-2 top-2 text-secondary-text w-6 h-6" />
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Invalid email address",
                },
              })}
              type="text"
              placeholder="Enter your email address"
              className="border pl-10 w-full text-primary-text placeholder:text-secondary-text border-border-color hover:border-border-dark-color p-2 bg-text-input-color rounded-lg focus-within:border-brand-primary focus-within:hover:border-brand-primary"
            />
          </div>
          {errors.email && (
            <p className="text-error-color text-sm">{errors.email.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-cta-btn-bg border border-cta-btn-border hover:border-cta-btn-border-hover hover:bg-cta-btn-bg-hover text-primary-text p-2 rounded-lg cursor-pointer text-lg disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        {message && <p className="text-error-color text-sm">{message}</p>}
        <div className="flex flex-row gap-2 text-sm">
          <p className="font-semibold text-primary-text">
            Don't have an account?
          </p>
          <Link
            to="/signup"
            className={`text-link-color underline ${
              loading ? "pointer-events-none opacity-50" : ""
            }`}>
            Sign Up here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default PasswordResetEmail;
