import { Controller } from "react-hook-form";
import TextInput from "../ui/TextInput";
import { IoLocation } from "react-icons/io5";
import { BsFillBuildingsFill, BsMailbox2Flag } from "react-icons/bs";
import { FaTreeCity } from "react-icons/fa6";
import { PiNumberThreeFill } from "react-icons/pi";

const PropertyAddressForm = ({ control }) => {
  return (
    <div className="flex flex-col gap-3 w-[600px]">
      {/*Property Name */}
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <TextInput
            {...field}
            required
            label="Property Name"
            icon={BsFillBuildingsFill}
            error={fieldState.error}
            textTransform="capitalize"
          />
        )}
      />

      {/* Line 1 */}
      <Controller
        name="line_1"
        control={control}
        render={({ field, fieldState }) => (
          <TextInput
            {...field}
            required
            label="Line 1"
            icon={IoLocation}
            error={fieldState.error}
            textTransform="capitalize"
          />
        )}
      />

      {/* Line 2 */}
      <Controller
        name="line_2"
        control={control}
        render={({ field, fieldState }) => (
          <TextInput
            {...field}
            label="Line 2"
            icon={IoLocation}
            error={fieldState.error}
            textTransform="capitalize"
          />
        )}
      />

      {/* Town */}
      <Controller
        name="town"
        control={control}
        render={({ field, fieldState }) => (
          <TextInput
            {...field}
            required
            label="Town"
            icon={BsFillBuildingsFill}
            error={fieldState.error}
            textTransform="capitalize"
          />
        )}
      />

      {/* County + Postcode side by side */}
      <div className="flex gap-3">
        <div className="w-1/2">
          <Controller
            name="county"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                required
                label="County"
                icon={FaTreeCity}
                error={fieldState.error}
                textTransform="capitalize"
              />
            )}
          />
        </div>

        <div className="w-1/2">
          <Controller
            name="postcode"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                required
                label="Postcode"
                icon={BsMailbox2Flag}
                error={fieldState.error}
                textTransform="uppercase"
              />
            )}
          />
        </div>
      </div>

      {/* What3Words */}
      <Controller
        name="what_3_words"
        control={control}
        render={({ field, fieldState }) => (
          <TextInput
            {...field}
            required
            label="What 3 Words"
            icon={PiNumberThreeFill}
            error={fieldState.error}
            textTransform="lowercase"
          />
        )}
      />
    </div>
  );
};

export default PropertyAddressForm;
