import { useState } from "react";
import { BsHouses, BsHouseAdd } from "react-icons/bs";
import { HiOutlineHomeModern } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import CTAButton from "./CTAButton";
import ToggleButton from "./ui/ToggleButton";

const PropertyList = ({ onSelectProperty, selectedProperty, properties }) => {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState("Active");

  const handleNewEntry = () => {
    navigate(`/Client-Management/Properties/New-Property`);
  };

  const getPackageStyles = (packageName) => {
    if (!packageName) return "";

    const name = packageName.toLowerCase();

    if (name.includes("gold"))
      return "bg-yellow-500/15 text-yellow-500 border border-yellow-500/30";
    if (name.includes("silver"))
      return "bg-gray-400/15 text-gray-400 border border-gray-400/30";
    if (name.includes("bronze"))
      return "bg-amber-700/15 text-amber-700 border border-amber-700/30";

    // fallback for any other package
    return "bg-brand-primary/10 text-brand-primary border border-brand-primary/30";
  };

  return (
    <div className="bg-secondary-bg w-full lg:w-1/2 rounded-2xl shadow-m flex flex-col lg:h-full lg:overflow-hidden shrink-0">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center px-4 py-4 border-b border-border-color">
        <BsHouses className="w-7 h-7 text-primary-text shrink-0" />
        <h2 className="text-xl flex-1 min-w-fit text-primary-text font-semibold">
          Property List
        </h2>
        <div className="w-36">
          <ToggleButton
            checked={activeStatus === "Active"}
            onChange={(isActive) =>
              setActiveStatus(isActive ? "Active" : "All")
            }
            trueLabel="Active"
            falseLabel="All"
            verticalPadding={"py-1.5"}
          />
        </div>
        <CTAButton
          callbackFn={handleNewEntry}
          type="main"
          text="Add New Property"
          icon={BsHouseAdd}
        />
      </div>

      {/* Scrollable List */}
      <div className="lg:flex-1 lg:overflow-y-auto">
        <ul>
          {properties
            .sort((a, b) => a.name.localeCompare(b.name))
            .filter((property) => {
              if (activeStatus === "All") return true;
              // Ensure is_active is truthy for active filter
              return property.is_active === true;
            })
            .map((property) => (
              <li
                key={property.id}
                className={`flex flex-col sm:flex-row border-b p-3 sm:p-2 sm:pr-5 border-border-color items-stretch sm:items-center cursor-pointer transition-colors ${
                  selectedProperty?.id === property.id
                    ? "bg-brand-primary/10"
                    : "hover:bg-brand-primary/5"
                }`}
                onClick={() => onSelectProperty(property)}
                onDoubleClick={() =>
                  navigate(`/Client-Management/Properties/${property.name}`)
                }>
                {/* Property Image */}
                {property.avatar ? (
                  <img
                    src={property.avatar}
                    alt={property?.name}
                    className="w-full sm:w-auto aspect-video sm:h-36 rounded-xl sm:border-r border-b sm:border-b-0 border-border-color object-cover mb-3 sm:mb-0 sm:mr-4"
                  />
                ) : (
                  <div
                    className={`w-full sm:w-auto aspect-video sm:h-36 rounded-xl flex flex-col items-center justify-center sm:border-r border-b sm:border-b-0 border-border-color mb-3 sm:mb-0 sm:mr-4 bg-primary-bg`}>
                    <HiOutlineHomeModern className="w-12 h-12 text-secondary-text mb-2" />
                    <span className="text-secondary-text">No Image</span>
                  </div>
                )}

                {/* Property Details */}
                <div className="flex flex-col flex-1 min-w-0 sm:py-4 gap-2">
                  <p className={`text-primary-text font-semibold text-lg truncate`}>
                    {property.name}
                  </p>
                  <p className={`text-sm text-secondary-text`}>
                    {[
                      property?.line_1,
                      property?.line_2,
                      property?.town,
                      property?.county,
                      property?.postcode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <div className="flex flex-row flex-wrap gap-2 items-center">
                    {property?.Packages && (
                      <div
                        className={`w-fit text-xs font-medium px-2 py-1 rounded-lg ${getPackageStyles(
                          property.Packages.name
                        )}`}>
                        {property.Packages.name}
                      </div>
                    )}
                    <div
                      className={`w-fit text-xs font-medium px-2 py-1 rounded-lg ${
                        property.is_active
                          ? "bg-green-400/20 text-green-500 border-green-600 border"
                          : "bg-red-400/20 text-red-500 border-red-600 border"
                      }`}>
                      {property.is_active ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default PropertyList;
