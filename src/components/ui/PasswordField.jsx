import { useState } from "react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { CiLock } from "react-icons/ci";

const PasswordField = ({ value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="w-full relative">
      <CiLock className="absolute left-2 top-2 text-secondary-text w-6 h-6" />
      <input
        value={value}
        onChange={onChange}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className="pl-10 shadow-s hover:shadow-m w-full text-primary-text placeholder:text-muted placeholder:text-sm hover:border-border-dark-color p-2 bg-text-input-color rounded-lg focus-within:border-brand-primary focus-within:hover:border-brand-primary"
      />
      <button
        type="button"
        className="cursor-pointer"
        onMouseDown={() => setShow(true)}
        onMouseUp={() => setShow(false)}
        onMouseLeave={() => setShow(false)}>
        {show ? (
          <IoEyeOutline className="text-secondary-text w-5 h-5 absolute right-5 top-2.5" />
        ) : (
          <IoEyeOffOutline className="text-secondary-text w-5 h-5 absolute right-5 top-2.5" />
        )}
      </button>
    </div>
  );
};

export default PasswordField;
