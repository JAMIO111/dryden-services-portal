import { useState, useEffect } from "react";
import CTAButton from "../CTAButton";
import TextInput from "../ui/TextInput";
import { PiPassword } from "react-icons/pi";
import ToggleButton from "../ui/ToggleButton";
import { SlLock, SlLockOpen } from "react-icons/sl";
import { GrLocationPin } from "react-icons/gr";

const KeyCodeForm = ({ defaultValues, onSave, onCancel }) => {
  const [form, setForm] = useState({
    id: null,
    code: "",
    name: "",
    is_private: false,
    ...defaultValues,
  });

  const [submitted, setSubmitted] = useState(false);

  // Sync defaults if editing
  useEffect(() => {
    if (defaultValues) {
      setForm((prev) => ({ ...prev, ...defaultValues }));
    }
  }, [defaultValues]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    const code = form.code?.trim() || "";
    const name = form.name?.trim() || "";

    // Validate safely
    if (!code || !name) return;

    // If valid
    onSave({ ...form, code, name });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
      <TextInput
        label="Key Code"
        placeholder="Enter key code..."
        icon={PiPassword}
        value={form.code}
        onChange={(e) => setForm({ ...form, code: e.target.value })}
        error={(() => {
          if (!submitted) return null;
          const code = form.code?.trim() || "";
          if (!code) {
            return { message: "Key Code is required" };
          }
          if (code.length < 1) {
            return { message: "Key Code must be at least 1 characters long" };
          }
          if (code.length > 10) {
            return {
              message: "Key Code must be no more than 10 characters long",
            };
          }
          return null;
        })()}
      />

      <TextInput
        label="Location"
        placeholder="e.g. Front Door, Safe"
        icon={GrLocationPin}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={(() => {
          if (!submitted) return null;
          const value = form.name?.trim() || "";
          if (!value) {
            return { message: "Location is required" };
          }
          if (value.length < 2) {
            return { message: "Location must be at least 2 characters long" };
          }
          if (value.length > 20) {
            return {
              message: "Location must be no more than 20 characters long",
            };
          }
          return null;
        })()}
      />

      <ToggleButton
        icon={form.is_private ? SlLock : SlLockOpen}
        label="Private"
        checked={form.is_private}
        onChange={(checked) => setForm({ ...form, is_private: checked })}
        trueLabel="Private"
        falseLabel="Public"
      />

      <div className="flex gap-2 pt-2">
        <CTAButton
          width="w-full"
          type="cancel"
          text="Cancel"
          callbackFn={onCancel}
        />
        <CTAButton
          width="w-full"
          type="success"
          text={defaultValues ? "Update" : "Add"}
          callbackFn={handleSubmit}
        />
      </div>
    </form>
  );
};

export default KeyCodeForm;
