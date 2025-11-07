import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import CTAButton from "../CTAButton";

const PropertyNavigation = ({ onPrev, onNext, currentIndex, total }) => {
  const isPrevDisabled = total === 0 || currentIndex <= 1;
  const isNextDisabled = total === 0 || currentIndex >= total;

  const baseButtonClasses =
    "rounded-lg flex justify-center items-center w-8 h-8 border border-border-color transition";
  const activeClasses =
    "cursor-pointer bg-brand-primary hover:bg-brand-primary/80";
  const disabledClasses = "cursor-not-allowed bg-border-color opacity-50";

  return (
    <div className="flex items-center p-2 flex-row justify-between rounded-2xl border border-border-color bg-tertiary-bg">
      {/* Prev Button */}
      <CTAButton
        type="main"
        icon={IoChevronBack}
        callbackFn={onPrev}
        disabled={isPrevDisabled}
      />

      {/* Counter */}
      <div className="flex-1 text-center">
        <p className="text-primary-text text-lg font-medium">
          {total > 0
            ? `Property ${currentIndex} of ${total}`
            : "No properties assigned"}
        </p>
      </div>

      <CTAButton
        type="main"
        icon={IoChevronForward}
        callbackFn={onNext}
        disabled={isNextDisabled}
      />
    </div>
  );
};

export default PropertyNavigation;
