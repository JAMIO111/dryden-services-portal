import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import CTAButton from "../CTAButton";
import RHFComboBox from "../ui/RHFComboBox";
import { BsCalendar2Week } from "react-icons/bs";
import { FaHourglassEnd } from "react-icons/fa";
import NumericInputGroup from "../NumericInputGroup";
import { IoRepeat } from "react-icons/io5";
import DatePicker from "../ui/DatePicker";

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const ordinals = ["First", "Second", "Third", "Fourth", "Last"];

const RecurrenceForm = () => {
  const { control, watch, handleSubmit } = useForm({
    defaultValues: {
      frequency: "weekly",
      interval: 1,
      daysOfWeek: [],
      dayOfMonth: 1,
      monthlyOrdinal: { ordinal: "First", weekday: "Monday" },
      endCondition: "after", // never | after | onDate
      occurrences: 1,
      endDate: "",
    },
  });

  const frequency = watch("frequency");
  const endCondition = watch("endCondition");
  const count = watch("interval");

  const unit =
    frequency === "daily" ? "day" : frequency === "weekly" ? "week" : "month";

  const onSubmit = (data) => {
    console.log("Recurrence data:", data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 p-4 flex-1 rounded-md max-w-md">
      {/* Step 1: Frequency */}
      <div>
        <Controller
          name="frequency"
          control={control}
          render={({ field, fieldState }) => (
            <RHFComboBox
              error={fieldState.error}
              {...field}
              name="frequency"
              control={control}
              label="Frequency"
              required
              options={[
                { id: "daily", name: "Daily" },
                { id: "weekly", name: "Weekly" },
                { id: "monthly", name: "Monthly" },
              ]}
              placeholder="Select a frequency..."
              icon={BsCalendar2Week}
            />
          )}
        />
      </div>

      {/* Step 2: Interval */}
      <div>
        <label className="block text-primary-text mb-1">
          Repeat every {count === 1 ? "" : count + " "}
          {unit}
          {count === 1 ? "" : "s"}
        </label>
        <Controller
          name="interval"
          control={control}
          render={({ field }) => (
            <NumericInputGroup
              {...field}
              label="Interval"
              min={1}
              max={52}
              icon={IoRepeat}
            />
          )}
        />
      </div>

      {/* Step 3: Day Selection */}
      {frequency === "weekly" && (
        <div>
          <label className="block text-primary-text mb-1">
            Days of the Week
          </label>
          <Controller
            name="daysOfWeek"
            control={control}
            render={({ field }) => (
              <div className="flex bg-tertiary-bg p-1 rounded-lg shadow-s pl-3 flex-wrap gap-3">
                {weekdays.map((day) => (
                  <label
                    key={day}
                    className="flex text-primary-text items-center gap-1">
                    <input
                      type="checkbox"
                      value={day}
                      checked={field.value.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          field.onChange([...field.value, day]);
                        } else {
                          field.onChange(field.value.filter((d) => d !== day));
                        }
                      }}
                    />
                    {day.slice(0, 3)}
                  </label>
                ))}
              </div>
            )}
          />
        </div>
      )}

      {frequency === "monthly" && (
        <div>
          <label className="block font-semibold mb-1">Monthly Options</label>
          <div className="mb-2">
            <Controller
              name="dayOfMonth"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  min={1}
                  max={31}
                  {...field}
                  className="border p-1 rounded w-full"
                  placeholder="Day of month"
                />
              )}
            />
          </div>
          <div>
            <span className="text-sm text-secondary-text">
              Or use ordinal pattern:
            </span>
            <div className="flex gap-2 mt-1">
              <Controller
                name="monthlyOrdinal.ordinal"
                control={control}
                render={({ field }) => (
                  <select {...field} className="border p-1 rounded flex-1">
                    {ordinals.map((ord) => (
                      <option key={ord} value={ord}>
                        {ord}
                      </option>
                    ))}
                  </select>
                )}
              />
              <Controller
                name="monthlyOrdinal.weekday"
                control={control}
                render={({ field }) => (
                  <select {...field} className="border p-1 rounded flex-1">
                    {weekdays.map((day) => (
                      <option
                        className="capitalize text-primary-text"
                        key={day}
                        value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: End Conditions */}
      <div>
        <Controller
          name="endCondition"
          control={control}
          render={({ field, fieldState }) => (
            <RHFComboBox
              error={fieldState.error}
              {...field}
              name="endCondition"
              control={control}
              label="End Condition"
              required
              options={[
                { id: "after", name: "After X Occurrences" },
                { id: "onDate", name: "On Date" },
              ]}
              placeholder="Select an end condition..."
              icon={FaHourglassEnd}
            />
          )}
        />
      </div>

      {endCondition === "after" && (
        <div>
          <Controller
            name="occurrences"
            control={control}
            render={({ field }) => (
              <NumericInputGroup
                {...field}
                label="Occurrences"
                min={1}
                max={52}
                icon={IoRepeat}
              />
            )}
          />
        </div>
      )}

      {endCondition === "onDate" && (
        <div>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                required={true}
                label="End Date"
                currentDate={field.value}
                onChange={field.onChange}
                displayMode="date"
              />
            )}
          />
        </div>
      )}
      <div className="pt-4">
        <CTAButton type="main" text="Save Recurrence" />
      </div>
    </form>
  );
};

export default RecurrenceForm;
