import ToggleButton from "@components/ui/ToggleButton";
import { Controller } from "react-hook-form";

const categories = [
  { id: 1, name: "Super King Sheets", value: "super_king_sheets", icon: "bed" },
  {
    id: 2,
    name: "Super King Duvet Covers",
    value: "super_king_duvet_covers",
    icon: "bed",
  },
  {
    id: 3,
    name: "Super King Protectors",
    value: "super_king_protectors",
    icon: "shield",
  },
  { id: 4, name: "Super King Duvets", value: "super_king_duvets", icon: "bed" },

  { id: 5, name: "Single Sheets", value: "single_sheets", icon: "bed" },
  {
    id: 6,
    name: "Single Duvet Covers",
    value: "single_duvet_covers",
    icon: "bed",
  },
  {
    id: 7,
    name: "Single Protectors",
    value: "single_protectors",
    icon: "shield",
  },
  { id: 8, name: "Single Duvets", value: "single_duvets", icon: "bed" },

  { id: 9, name: "Bath Mats", value: "bath_mats", icon: "bath" },
  { id: 10, name: "Bathrobes", value: "bathrobes", icon: "shirt" },
  { id: 11, name: "Face Cloths", value: "face_cloths", icon: "towel" },

  { id: 12, name: "King Sheets", value: "king_sheets", icon: "bed" },
  {
    id: 13,
    name: "King Duvet Covers",
    value: "king_duvet_covers",
    icon: "bed",
  },
  { id: 14, name: "King Protectors", value: "king_protectors", icon: "shield" },
  { id: 15, name: "King Duvets", value: "king_duvets", icon: "bed" },

  { id: 16, name: "Pillowcases", value: "pillowcases", icon: "pillow" },
  { id: 17, name: "Pillows", value: "pillows", icon: "pillow" },
  {
    id: 18,
    name: "Pillow Protectors",
    value: "pillow_protectors",
    icon: "shield",
  },

  { id: 19, name: "Cushion Covers", value: "cushion_covers", icon: "cushion" },
  { id: 20, name: "Oven Gloves", value: "oven_gloves", icon: "glove" },
  {
    id: 21,
    name: "Large Table Cloths",
    value: "large_table_cloths",
    icon: "table",
  },
  {
    id: 22,
    name: "Small Table Cloths",
    value: "small_table_cloths",
    icon: "table",
  },

  { id: 23, name: "Double Sheets", value: "double_sheets", icon: "bed" },
  {
    id: 24,
    name: "Double Duvet Covers",
    value: "double_duvet_covers",
    icon: "bed",
  },
  {
    id: 25,
    name: "Double Protectors",
    value: "double_protectors",
    icon: "shield",
  },
  { id: 26, name: "Double Duvets", value: "double_duvets", icon: "bed" },

  { id: 27, name: "Hand Towels", value: "hand_towels", icon: "towel" },
  { id: 28, name: "Bath Towels", value: "bath_towels", icon: "towel" },
  { id: 29, name: "Bath Sheets", value: "bath_sheets", icon: "towel" },
  { id: 30, name: "Tea Towels", value: "tea_towels", icon: "towel" },

  { id: 31, name: "Rugs", value: "rugs", icon: "rug" },
  { id: 32, name: "Large Throws", value: "large_throws", icon: "blanket" },
  { id: 33, name: "Small Throws", value: "small_throws", icon: "blanket" },
];

const hiredLaundryItems = [
  { id: 1, name: "Superking Set", value: "superking_set", icon: "bed" },
  { id: 2, name: "King Set", value: "king_set", icon: "bed" },
  { id: 3, name: "Double Set", value: "double_set", icon: "bed" },
  { id: 4, name: "Single Set", value: "single_set", icon: "bed" },

  { id: 5, name: "Hand Towels", value: "hand_towels", icon: "towel" },
  { id: 6, name: "Tea Towels", value: "tea_towels", icon: "towel" },
  { id: 7, name: "Bath Mats", value: "bath_mats", icon: "bath" },

  { id: 8, name: "Oven Gloves", value: "oven_gloves", icon: "glove" },
  { id: 9, name: "Bathrobes", value: "bathrobes", icon: "robe" },
];

const LaundryInfoForm = ({ control, hiredLaundry, laundry }) => {
  return (
    <div className="flex flex-row p-3 gap-5 max-h-[75vh]">
      {/* Categories Column */}
      {laundry && (
        <div className="flex-1 bg-secondary-bg pl-3 pt-3 rounded-2xl shadow-s min-w-[400px] flex flex-col gap-2">
          <h2 className="font-semibold text-primary-text mb-2">
            Laundry Items
          </h2>
          <div className="flex-1 flex flex-col gap-3 pr-2 overflow-y-auto">
            <Controller
              name="laundry_items"
              control={control}
              render={({ field }) => {
                const selected = field.value || [];

                const toggleItem = (value) => {
                  if (selected.includes(value)) {
                    field.onChange(selected.filter((v) => v !== value));
                  } else {
                    field.onChange([...selected, value]);
                  }
                };

                return categories.map((category) => (
                  <ToggleButton
                    key={category.id}
                    label={category.name}
                    checked={selected.includes(category.value)}
                    onChange={() => toggleItem(category.value)}
                    trueLabel="Included"
                    falseLabel="Not Included"
                  />
                ));
              }}
            />
          </div>
        </div>
      )}
      {/* Hired Laundry Items Column */}
      {hiredLaundry && (
        <div className="flex-1 bg-secondary-bg pl-3 pt-3 rounded-2xl shadow-s min-w-[400px] flex flex-col gap-2">
          <h2 className="font-semibold text-primary-text mb-2">
            Hired Laundry Items
          </h2>
          <div className="flex-1 flex flex-col gap-3 pr-2 overflow-y-auto">
            <Controller
              name="hired_laundry_items"
              control={control}
              render={({ field }) => {
                const selected = field.value || [];

                const toggleItem = (value) => {
                  if (selected.includes(value)) {
                    field.onChange(selected.filter((v) => v !== value));
                  } else {
                    field.onChange([...selected, value]);
                  }
                };

                return hiredLaundryItems.map((item) => (
                  <ToggleButton
                    key={item.id}
                    label={item.name}
                    checked={selected.includes(item.value)}
                    onChange={() => toggleItem(item.value)}
                    trueLabel="Included"
                    falseLabel="Not Included"
                  />
                ));
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LaundryInfoForm;
