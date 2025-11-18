import { useState } from "react";
import { useForm, Controller } from "react-hook-form";

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
      endCondition: "never", // never | after | onDate
      occurrences: 1,
      endDate: "",
    },
  });

  const frequency = watch("frequency");
  const endCondition = watch("endCondition");

  const onSubmit = (data) => {
    console.log("Recurrence data:", data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 p-4 border rounded-md max-w-md">
      {/* Step 1: Frequency */}
      <div>
        <label className="block font-semibold mb-1">Frequency</label>
        <Controller
          name="frequency"
          control={control}
          render={({ field }) => (
            <select {...field} className="border p-1 rounded w-full">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          )}
        />
      </div>

      {/* Step 2: Interval */}
      <div>
        <label className="block font-semibold mb-1">
          Repeat every{" "}
          {frequency === "daily"
            ? "day(s)"
            : frequency === "weekly"
            ? "week(s)"
            : "month(s)"}
        </label>
        <Controller
          name="interval"
          control={control}
          render={({ field }) => (
            <input
              type="number"
              min={1}
              {...field}
              className="border p-1 rounded w-full"
            />
          )}
        />
      </div>

      {/* Step 3: Day Selection */}
      {frequency === "weekly" && (
        <div>
          <label className="block font-semibold mb-1">Days of the Week</label>
          <Controller
            name="daysOfWeek"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => (
                  <label key={day} className="flex items-center gap-1">
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
            <span className="text-sm text-gray-500">
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
                      <option key={day} value={day}>
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
        <label className="block font-semibold mb-1">End Condition</label>
        <Controller
          name="endCondition"
          control={control}
          render={({ field }) => (
            <select {...field} className="border p-1 rounded w-full">
              <option value="never">Never</option>
              <option value="after">After X Occurrences</option>
              <option value="onDate">On Date</option>
            </select>
          )}
        />
      </div>

      {endCondition === "after" && (
        <div>
          <Controller
            name="occurrences"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                min={1}
                {...field}
                className="border p-1 rounded w-full"
                placeholder="Number of occurrences"
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
              <input
                type="date"
                {...field}
                className="border p-1 rounded w-full"
              />
            )}
          />
        </div>
      )}

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
        Save Recurrence
      </button>
    </form>
  );
};

export default RecurrenceForm;
