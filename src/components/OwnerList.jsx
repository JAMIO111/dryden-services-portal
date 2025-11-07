import { useState, useEffect, useRef } from "react";
import { MdPeopleOutline } from "react-icons/md";
import { AiOutlineUserAdd } from "react-icons/ai";
import CTAButton from "./CTAButton";
import { useNavigate } from "react-router-dom";

const OwnerList = ({ onSelectOwner, selectedOwner, owners }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [highlightStyle, setHighlightStyle] = useState({ top: 0, height: 0 });

  // Update highlight position when selection changes
  useEffect(() => {
    if (!selectedOwner || !containerRef.current) return;

    const index = owners.findIndex((o) => o.id === selectedOwner.id);
    const listItem = containerRef.current.querySelectorAll("li")[index];

    if (listItem) {
      const rect = listItem.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      setHighlightStyle({
        top: listItem.offsetTop + 10,
        height: rect.height,
      });
    }
  }, [selectedOwner, owners]);

  return (
    <div className="bg-secondary-bg w-1/4 rounded-2xl shadow-m flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-row gap-3 items-center px-4 py-4 border-b border-border-color">
        <MdPeopleOutline className="w-7 h-7 text-primary-text" />
        <h2 className="text-xl text-primary-text font-semibold">Owner List</h2>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 p-3 overflow-y-auto relative" ref={containerRef}>
        {/* Sliding Highlight */}
        {selectedOwner && (
          <div
            className="absolute left-0 right-0 bg-primary-bg rounded-2xl shadow-s transition-all duration-300"
            style={{
              top: highlightStyle.top,
              height: highlightStyle.height,
              width: "calc(100% - 24px)",
              left: 12,
              zIndex: 0,
            }}
          />
        )}

        <ul className="relative z-10">
          {owners.length === 0 ? (
            <div className="p-3 text-center">
              <div className="bg-text-input-color text-secondary-text text-sm rounded-lg p-4">
                No results found
              </div>
            </div>
          ) : (
            owners
              ?.sort((a, b) => a.first_name.localeCompare(b.first_name))
              .map((owner) => (
                <li
                  key={owner.id}
                  className="relative flex items-center p-3 cursor-pointer"
                  onClick={() => onSelectOwner(owner)}
                  onDoubleClick={() =>
                    navigate(`/Client-Management/Owners/${owner.id}`)
                  }>
                  {/* Owner Image */}
                  <div className="relative mr-4">
                    {owner.avatar ? (
                      <img
                        src={owner.avatar}
                        alt={owner.first_name}
                        className="w-12 h-12 rounded-lg border border-border-color object-cover"
                      />
                    ) : (
                      <div
                        className={`${
                          selectedOwner?.id === owner.id
                            ? "bg-tertiary-bg"
                            : "bg-primary-bg"
                        } w-12 h-12 flex items-center justify-center rounded-lg border border-border-color`}>
                        <span className="text-secondary-text">
                          {owner.first_name.charAt(0)}
                        </span>
                        <span className="text-secondary-text">
                          {owner.surname.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`absolute rounded-full w-3 h-3 ${
                        owner.is_active ? "bg-green-500" : "bg-red-500"
                      } -bottom-0.5 -right-0.5`}></div>
                  </div>

                  {/* Owner Details */}
                  <div>
                    <p className="text-primary-text font-semibold">
                      {owner.first_name} {owner.surname}
                    </p>
                    <p className="text-sm text-secondary-text">{owner.role}</p>
                  </div>
                </li>
              ))
          )}
        </ul>
      </div>

      {/* Add Owner Button */}
      <div className="p-3 border-t border-border-color">
        <CTAButton
          width="w-full"
          type="main"
          text="Add New Owner"
          icon={AiOutlineUserAdd}
          callbackFn={() => navigate("/Client-Management/Owners/New-Owner")}
        />
      </div>
    </div>
  );
};

export default OwnerList;
