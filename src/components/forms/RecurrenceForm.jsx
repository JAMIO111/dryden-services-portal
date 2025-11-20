import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import CTAButton from "../CTAButton";
import RHFComboBox from "../ui/RHFComboBox";
import { BsCalendar2Week } from "react-icons/bs";
import { FaHourglassEnd } from "react-icons/fa";
import NumericInputGroup from "../NumericInputGroup";
import { IoRepeat, IoTodayOutline } from "react-icons/io5";
import DatePicker from "../ui/DatePicker";
import SlidingSelector from "../ui/SlidingSelectorGeneric";
import { useGenerateRecurrences } from "../../hooks/useGenerateRecurrences";

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

const RecurrenceForm = ({ startDate }) => {
  const [monthlyType, setMonthlyType] = useState("Day of Month");
  const [recurrences, setRecurrences] = useState([]);
  const { generateRecurrences } = useGenerateRecurrences();
  const { control, watch, handleSubmit } = useForm({
    defaultValues: {
      frequency: "weekly",
      interval: 1,
      daysOfWeek: [],
      monthlyType: "DayofMonth",
      dayOfMonth: 1,
      monthlyOrdinal: { ordinal: "First", weekday: "Monday" },
      endCondition: null,
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
          <label className="block text-primary-text mb-1 pl-1">
            Monthly Options
          </label>
          <div className="mb-4">
            <SlidingSelector
              options={["Day of Month", "Ordinal Pattern"]}
              value={monthlyType}
              onChange={(value) => {
                setMonthlyType(value);
                setValue("monthlyType", value); // <-- important
              }}
            />
          </div>
          {monthlyType === "Day of Month" && (
            <div className="my-5">
              <Controller
                name="dayOfMonth"
                control={control}
                render={({ field }) => (
                  <NumericInputGroup
                    {...field}
                    label="Day of Month"
                    min={1}
                    max={31}
                    icon={IoTodayOutline}
                  />
                )}
              />
            </div>
          )}
          {monthlyType === "Ordinal Pattern" && (
            <div>
              <span className="text-sm text-secondary-text">
                Ordinal pattern:
              </span>
              <div className="flex gap-2 mt-1">
                <Controller
                  name="monthlyOrdinal.ordinal"
                  control={control}
                  render={({ field }) => (
                    <RHFComboBox
                      options={ordinals.map((ord) => ({ id: ord, name: ord }))}
                      placeholder="Select Ordinal"
                      {...field}
                    />
                  )}
                />
                <Controller
                  name="monthlyOrdinal.weekday"
                  control={control}
                  render={({ field }) => (
                    <RHFComboBox
                      options={weekdays.map((day) => ({ id: day, name: day }))}
                      placeholder="Select Weekday"
                      {...field}
                    />
                  )}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: End Conditions */}
      <div className="mt-6">
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
        <CTAButton
          type="main"
          text="Preview Recurrences"
          callbackFn={() => {
            const recurrences = generateRecurrences(startDate, watch());
            setRecurrences(recurrences);
          }}
        />
      </div>

      <div className="flex flex-col gap-2 mt-6">
        {recurrences?.length > 0 ? (
          recurrences.map((date, index) => (
            <div
              key={index}
              className="flex items-center text-secondary-text gap-3">
              {index + 1}.
              <div className="text-sm text-primary-text">
                {date.toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-secondary-text">
            No recurrences to display.
          </div>
        )}
      </div>
    </form>
  );
};

export default RecurrenceForm;
