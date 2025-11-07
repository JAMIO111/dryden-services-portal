import React from "react";
import { useLocation, Link } from "react-router-dom";
import { BiHome } from "react-icons/bi";
import { IoFolderOpenOutline, IoReceiptOutline } from "react-icons/io5";
import { BsBoxes, BsGear, BsPeople, BsBuildingGear } from "react-icons/bs";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdOutlineHolidayVillage } from "react-icons/md";
import { FiUsers } from "react-icons/fi";

const iconMap = {
  Dashboard: <LuLayoutDashboard />,
  Bookings: <IoReceiptOutline />,
  Inventory: <BsBoxes />,
  "Human-Resources": <BsPeople />,
  Settings: <BsGear />,
  Properties: <MdOutlineHolidayVillage />,
  Owners: <FiUsers />,
  "Client-Management": <BsBuildingGear />,
};

// Utility: format normal route segments only
function formatSegment(segment) {
  // If it contains digits or looks like a booking ID, skip formatting
  if (/\d/.test(segment) || /^BKG-\d{2}-\d+$/i.test(segment)) {
    return segment; // leave as is
  }

  return segment
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function splitPath(pathname) {
  return pathname.split("/").filter(Boolean);
}

const Breadcrumb = () => {
  const location = useLocation();
  const segments = splitPath(location.pathname);

  return (
    <nav className="flex items-center gap-1 text-sm text-secondary-text font-semibold">
      <BiHome />
      <Link to="/Dashboard" className="hover:underline">
        Home
      </Link>
      {segments.map((segment, index) => {
        const path = "/" + segments.slice(0, index + 1).join("/");
        return (
          <React.Fragment key={segment}>
            <span className="mx-1">/</span>
            {iconMap[segment] || <IoFolderOpenOutline />}
            <Link to={path} className="hover:underline capitalize">
              {formatSegment(decodeURIComponent(segment))}
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
