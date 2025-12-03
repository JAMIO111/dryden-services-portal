import { useState } from "react";
import { Link, Outlet, useResolvedPath, useMatch } from "react-router-dom";
import SettingMenuStructure from "../../SettingMenuStructure";
import { GoDatabase } from "react-icons/go";

const Settings = () => {
  const [expandedItem, setExpandedItem] = useState(null);

  const toggleExpand = (index, hasSub) => {
    if (hasSub) setExpandedItem((prev) => (prev === index ? null : index));
  };

  return (
    <div className="flex flex-row p-2 gap-3 w-full h-full grow bg-primary-bg min-h-0">
      {/* Sidebar */}
      <div className="flex flex-col bg-secondary-bg rounded-2xl shadow-s w-65 min-w-65 min-h-0">
        <h1 className="text-primary-text text-2xl pl-3 py-2 border-b border-border-color font-semibold">
          Settings
        </h1>

        <div className="flex flex-col p-2 overflow-y-auto min-h-0">
          {SettingMenuStructure.map((item, index) => {
            const resolvedPath = useResolvedPath(item.path);
            const match = useMatch({ path: resolvedPath.pathname, end: false });
            const isExpanded = expandedItem === index;

            const rowClasses = `flex flex-row cursor-pointer justify-between items-center px-4 py-2 gap-2 rounded-xl ${
              match
                ? "bg-gradient-to-r from-cta-color to-transparent text-white"
                : "hover:bg-gradient-to-r hover:from-border-color/50 hover:to-transparent text-primary-text"
            }`;

            return (
              <div
                key={index}
                className="flex flex-col gap-1 mt-2 rounded-l-xl">
                {/* PARENT ROW */}
                {item.subMenu.length === 0 ? (
                  // No submenu: wrap entire row in Link
                  <Link to={item.path} className={rowClasses}>
                    <div className="flex flex-row items-center gap-2">
                      {item.icon ? (
                        <item.icon className="h-6 w-6" />
                      ) : (
                        <GoDatabase className="h-6 w-6" />
                      )}
                      <span>{item.name}</span>
                    </div>
                  </Link>
                ) : (
                  // Has submenu: toggle expand on click
                  <div
                    className={rowClasses}
                    onClick={() => toggleExpand(index, true)}>
                    <div className="flex flex-row items-center gap-2">
                      {item.icon ? (
                        <item.icon className="h-6 w-6" />
                      ) : (
                        <GoDatabase className="h-6 w-6" />
                      )}
                      <span>{item.name}</span>
                    </div>
                    <div
                      className={`transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-secondary-text"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {/* SUBMENU */}
                {isExpanded && item.subMenu.length > 0 && (
                  <div className="flex flex-col ml-8 mt-1 gap-2">
                    {item.subMenu.map((sub, idx) => (
                      <Link
                        key={idx}
                        to={sub.path}
                        className="cursor-pointer px-2 py-1 text-secondary-text hover:bg-border-color/30 rounded">
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-grow p-3 shadow-s h-full bg-secondary-bg rounded-2xl flex flex-col min-h-0">
        <Outlet />
      </div>
    </div>
  );
};

export default Settings;
