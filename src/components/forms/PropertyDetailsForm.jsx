import { Controller } from "react-hook-form";
import { FaBed, FaBath } from "react-icons/fa6";
import { IoIosMan } from "react-icons/io";
import { BiBuildingHouse } from "react-icons/bi";
import { LuUser } from "react-icons/lu";
import DatePicker from "../ui/DatePicker";
import { FaRegNoteSticky } from "react-icons/fa6";
import RHFTextAreaInput from "../ui/RHFTextArea";
import NumericInputGroup from "../NumericInputGroup";
import TextInput from "../ui/TextInput";

const PropertyDetailsForm = ({ control }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-12">
        <div className="flex flex-1 gap-1 flex-col">
          <Controller
            name="bedrooms"
            control={control}
            render={({ field, fieldState }) => (
              <NumericInputGroup
                label="Bedrooms"
                icon={FaBed}
                {...field}
                error={fieldState.error}
              />
            )}
          />

          <Controller
            name="sleeps"
            control={control}
            render={({ field, fieldState }) => (
              <NumericInputGroup
                label="Sleeps"
                icon={IoIosMan}
                {...field}
                error={fieldState.error}
              />
            )}
          />

          <Controller
            name="bathrooms"
            control={control}
            render={({ field, fieldState }) => (
              <NumericInputGroup
                label="Bathrooms"
                icon={FaBath}
                {...field}
                error={fieldState.error}
              />
            )}
          />
        </div>
        <div className="flex gap-3 justify-end pb-2 flex-1 flex-col">
          <Controller
            name="property_ref"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="Property Reference"
                placeholder="Enter property reference..."
                icon={BiBuildingHouse}
                {...field}
                error={fieldState.error}
              />
            )}
          />

          <Controller
            name="owner_ref"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="Owner Reference"
                placeholder="Enter owner reference..."
                icon={LuUser}
                {...field}
                error={fieldState.error}
              />
            )}
          />
        </div>
      </div>
      <div className="flex gap-12">
        <div className="flex flex-1 gap-3 justify-between flex-col">
          <Controller
            name="check_in"
            control={control}
            render={({ field: { value, onChange } }) => (
              <DatePicker
                label="Check In Time"
                currentDate={value}
                onChange={onChange}
                displayMode="time"
              />
            )}
          />
          <Controller
            name="check_out"
            control={control}
            render={({ field: { value, onChange } }) => (
              <DatePicker
                label="Check Out Time"
                currentDate={value}
                onChange={onChange}
                displayMode="time"
              />
            )}
          />
        </div>
        <div className="flex flex-1 gap-3 flex-col">
          <Controller
            name="notes"
            control={control}
            render={({ field, fieldState }) => (
              <RHFTextAreaInput
                rows={5}
                icon={FaRegNoteSticky}
                label="Notes"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsForm;
