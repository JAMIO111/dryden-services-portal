import { useState } from "react";
import { Link, Outlet, useResolvedPath, useMatch } from "react-router-dom";
import SettingMenuStructure from "../../SettingMenuStructure";
import { GoDatabase } from "react-icons/go";

const Settings = ({ onClose }) => {
  const [expandedItem, setExpandedItem] = useState(null);

  const toggleExpand = (index) => {
    setExpandedItem((prev) => (prev === index ? null : index));
  };

  return (
    <div className="flex flex-row p-2 gap-3 w-full grow bg-primary-bg overflow-y-hidden">
      <div className="flex flex-col bg-secondary-bg rounded-2xl shadow-s w-65 min-w-65">
        <h1 className="text-primary-text text-2xl pl-3 py-2 border-b border-border-color font-semibold">
          Settings
        </h1>
        <div className="flex flex-col p-2">
          {SettingMenuStructure.map((item, index) => {
            const resolvedPath = useResolvedPath(item.path);
            const match = useMatch({ path: resolvedPath.pathname, end: false });
            console.log(item.path);
            return (
              <Link to={item.path} key={index}>
                <div
                  key={index}
                  className={`${
                    match &&
                    "bg-gradient-to-r from-cta-color to-transparent hover:from-cta-color/80"
                  } hover:bg-gradient-to-r hover:from-border-color hover:to-transparent flex flex-col gap-1 mt-2 rounded-l-xl`}
                  onClick={() => toggleExpand(index)}>
                  <div className="flex flex-row cursor-pointer justify-between items-center px-4 py-2 gap-2  rounded-xl">
                    <div className="flex flex-row items-center justify-start gap-2">
                      {item.icon ? (
                        <item.icon
                          className={`${
                            match ? "text-white" : "text-primary-text"
                          } h-6 w-6 `}
                        />
                      ) : (
                        <GoDatabase
                          className={`${
                            match ? "text-white" : "text-primary-text"
                          } h-6 w-6 `}
                        />
                      )}
                      <h2
                        className={`${
                          match ? "text-white" : "text-primary-text"
                        } text-left`}>
                        {item.name}
                      </h2>
                    </div>
                    {item.subMenu.length > 0 && (
                      <div
                        className={`${
                          expandedItem === index ? "rotate-180" : ""
                        } transition-transform duration-200`}>
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
                    )}
                  </div>
                  {expandedItem === index && item.subMenu.length > 0 && (
                    <div className="flex flex-col gap-2 pl-4">
                      {item.subMenu.map((subItem, subIndex) => (
                        <div key={subIndex} className="text-secondary-text">
                          {subItem}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex-grow p-3 shadow-s bg-secondary-bg rounded-2xl flex flex-col overflow-y-scroll">
        <Outlet />
      </div>
    </div>
  );
};

export default Settings;
