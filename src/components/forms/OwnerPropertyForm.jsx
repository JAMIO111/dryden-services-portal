import { useState, useEffect, useMemo } from "react";
import CTAButton from "../CTAButton";
import RHFComboBox from "../ui/RHFComboBox";
import { IoTrashOutline } from "react-icons/io5";
import { useProperties } from "@/hooks/useProperties";
import { FaUser } from "react-icons/fa6";
import { useModal } from "@/contexts/ModalContext";
import { useUpsertOwner } from "@/hooks/useUpsertOwner";
import { useToast } from "../../contexts/ToastProvider";

const normalize = (p) => ({
  id: p?.property?.id ?? p.id,
  name: p?.property?.name ?? p.name,
  avatar: p?.property?.avatar ?? p.avatar ?? null,
});

const OwnerPropertyForm = ({ owner, defaultProperties = [], onSave }) => {
  const { closeModal } = useModal();
  const { showToast } = useToast();
  const { data: properties, isLoading: propertiesLoading } = useProperties();
  const upsertOwner = useUpsertOwner();
  console.log("owner:", owner);

  // Normalise defaults immediately
  const [currentProperties, setCurrentProperties] = useState(
    defaultProperties.map(normalize)
  );

  const [selectedId, setSelectedId] = useState(null);

  console.log("defaultProperties:", defaultProperties);
  console.log("currentProperties:", currentProperties);
  // Keep defaults synced
  useEffect(() => {
    setCurrentProperties(defaultProperties.map(normalize));
  }, [defaultProperties]);

  // Hydrate with full property objects once they load
  useEffect(() => {
    if (!properties) return;

    const normalizedProps = properties.map(normalize);

    setCurrentProperties((prev) =>
      prev.map((item) => {
        const match = normalizedProps.find(
          (p) => String(p.id) === String(item.id)
        );
        return match || normalize(item);
      })
    );
  }, [properties]);

  // Build available properties list
  const filteredProperties = useMemo(() => {
    if (!properties) return [];

    const usedIds = new Set(currentProperties.map((p) => String(p.id)));

    return properties
      .map(normalize)
      .filter((p) => !usedIds.has(String(p.id)))
      .map((p) => ({
        id: p.id,
        name: p.name,
      }));
  }, [properties, currentProperties]);

  const handleAddProperty = (id) => {
    if (!id || !properties) return;

    const normalizedProps = properties.map(normalize);
    const match = normalizedProps.find((p) => String(p.id) === String(id));
    if (!match) return;

    const exists = currentProperties.some(
      (p) => String(p.id) === String(match.id)
    );
    if (exists) return;

    setCurrentProperties((prev) => [...prev, match]);
    setSelectedId(null);
  };

  const handleRemoveProperty = (id) => {
    setCurrentProperties((prev) =>
      prev.filter((p) => String(p.id) !== String(id))
    );
  };

  const handleSubmit = () => {
    upsertOwner.mutate(
      {
        ownerData: owner,
        propertiesForm: currentProperties,
      },
      {
        onSuccess: () => {
          closeModal();
          showToast({
            type: "success",
            title: "Owner Properties Updated",
            message: "The owner's properties have been successfully updated.",
          });
        },
        onError: (err) => {
          console.error(err);
          showToast({
            type: "error",
            title: "Error Updating Owner Properties",
            message: "Something went wrong saving the owner.",
          });
        },
      }
    );
  };

  return (
    <div className="flex flex-col min-h-[50vh] min-w-[30vw] gap-4 p-4">
      <RHFComboBox
        label="Select Property"
        icon={FaUser}
        options={filteredProperties}
        value={selectedId}
        onChange={(id) => handleAddProperty(id)}
        placeholder={
          propertiesLoading
            ? "Loading properties…"
            : "Select a property to add..."
        }
      />

      <ul className="flex flex-1 flex-col p-1 gap-2 max-h-60 overflow-y-auto">
        {currentProperties.length === 0 && (
          <li className="text-sm text-primary-text">
            No properties added yet.
          </li>
        )}

        {currentProperties.map((property) => (
          <li
            key={property.id}
            className="flex justify-between items-center p-2 bg-tertiary-bg rounded-lg gap-3 shadow-s">
            {property.avatar ? (
              <img
                src={property.avatar}
                alt={property.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="flex items-center justify-center shadow-s w-10 h-10 rounded-lg bg-primary-bg">
                <p className="text-lg font-semibold text-primary-text">
                  {(property.name || "").substring(0, 2).toUpperCase()}
                </p>
              </div>
            )}

            <span className="font-medium flex-1 text-left text-primary-text">
              {property.name}
            </span>

            <button
              onClick={() => handleRemoveProperty(property.id)}
              className="p-2 cursor-pointer hover:shadow-s rounded-lg text-icon-color hover:text-error-color mr-1.5">
              <IoTrashOutline className="h-5 w-5" />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 pt-2">
        <CTAButton
          width="w-full"
          type="cancel"
          text="Cancel"
          callbackFn={closeModal}
        />
        <CTAButton
          width="w-full"
          type="success"
          text="Save"
          callbackFn={handleSubmit}
        />
      </div>
    </div>
  );
};

export default OwnerPropertyForm;
