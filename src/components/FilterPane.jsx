import { useEffect, useState, useRef } from "react";
import { CgClose } from "react-icons/cg";
import { useBookingsFilters } from "../hooks/useBookingsFilters";
import { useSearchParams } from "react-router-dom";
import CTAButton from "./CTAButton";
import {
  usePackageOptions,
  usePropertyOptions,
} from "@/hooks/useCategoryOptions";

const FilterPane = ({ onClose }) => {
  const paneRef = useRef(null);
  const [searchParams] = useSearchParams();
  const propertyUrl = searchParams.get("property") || "";
  const managementPackageUrl = searchParams.get("managementPackage") || "";
  const { search, property, managementPackage, updateFilters } =
    useBookingsFilters();
  const [localProperty, setLocalProperty] = useState(propertyUrl);
  const [localPackage, setLocalPackage] = useState(managementPackageUrl);

  useEffect(() => {
    function handleClickOutside(e) {
      if (paneRef.current && !paneRef.current.contains(e.target)) {
        onClose?.();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    setLocalProperty(property);
  }, [property]);

  useEffect(() => {
    setLocalPackage(managementPackage);
  }, [managementPackage]);

  const onPropertyChange = (e) => setLocalProperty(e.target.value);
  const onPackageChange = (e) => setLocalPackage(e.target.value);

  const resetAll = () => {
    setLocalProperty("");
    setLocalPackage("");

    updateFilters({
      search,
      property: "",
      managementPackage: "",
    });

    if (onClose) onClose();
  };

  const applyFilters = () => {
    updateFilters({
      search,
      property: localProperty,
      managementPackage: localPackage,
    });

    if (onClose) onClose();
  };

  const {
    data: packageOptions,
    error: packageError,
    isLoading: isPackageLoading,
  } = usePackageOptions();

  const {
    data: propertyOptions,
    error: propertyError,
    isLoading: isPropertyLoading,
  } = usePropertyOptions();

  return (
    <div
      ref={paneRef}
      className="border absolute bg-primary-bg text-primary-text z-1000 top-32 rounded-2xl border-border-color shadow-lg shadow-shadow-color w-80 h-fit">
      <div className="flex px-4 py-1 bg-secondary-bg border-b border-border-color flex-row justify-between items-center rounded-t-2xl ">
        <h3 className="text-xl">Filter</h3>
        <button
          className="hover:bg-primary-bg rounded-md cursor-pointer hover:text-error-color p-1"
          onClick={onClose}>
          <CgClose />
        </button>
      </div>
      <div className="flex flex-col justify-start items-center">
        <div className="filter-item flex px-4 py-3 border-b border-border-color w-full flex-col justify-start items-center">
          <div className="w-full flex flex-row justify-between items-center">
            <h4>Property</h4>
            <button
              onClick={() => setLocalProperty("")}
              className="text-brand-primary hover:text-error-color text-sm cursor-pointer pl-2 text-right">
              Reset
            </button>
          </div>
          <div className="w-full">
            <select
              value={localProperty}
              onChange={onPropertyChange}
              className="w-full h-8 bg-text-input-color border border-border-color rounded-md px-2 mt-2">
              <option defaultValue value="">
                All
              </option>
              {propertyOptions?.map((option) => (
                <option key={option.id} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-item flex px-4 py-3 border-b border-border-color w-full flex-col justify-start items-center">
          <div className="w-full flex flex-row justify-between items-center">
            <h4>Management Package</h4>
            <button
              onClick={() => setLocalPackage("")}
              className="text-brand-primary hover:text-error-color text-sm cursor-pointer pl-2 text-right">
              Reset
            </button>
          </div>
          <div className="w-full">
            <select
              value={localPackage}
              onChange={onPackageChange}
              className="w-full h-8 border bg-text-input-color border-border-color rounded-md px-2 mt-2">
              <option defaultValue value="">
                All
              </option>
              {packageOptions?.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.tier} - {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="w-full p-4 flex flex-row justify-between items-center">
          <CTAButton text="Reset All" type="cancel" callbackFn={resetAll} />
          <CTAButton text="Apply Now" type="main" callbackFn={applyFilters} />
        </div>
      </div>
    </div>
  );
};

export default FilterPane;
