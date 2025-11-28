import React, { useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { BiHome } from "react-icons/bi";
import {
  IoFolderOpenOutline,
  IoReceiptOutline,
  IoCalendarOutline,
} from "react-icons/io5";
import {
  BsBoxes,
  BsGear,
  BsPeople,
  BsBuildingGear,
  BsHouseAdd,
} from "react-icons/bs";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdOutlineHolidayVillage } from "react-icons/md";
import { FiUsers } from "react-icons/fi";
import { IoPersonAddOutline } from "react-icons/io5";

const iconMap = {
  Dashboard: <LuLayoutDashboard />,
  Jobs: <IoReceiptOutline />,
  Inventory: <BsBoxes />,
  "Human-Resources": <BsPeople />,
  Settings: <BsGear />,
  Properties: <MdOutlineHolidayVillage />,
  Owners: <FiUsers />,
  "Client-Management": <BsBuildingGear />,
  Calendar: <IoCalendarOutline />,
  "New-Owner": <IoPersonAddOutline />,
  "New-Property": <BsHouseAdd />,
};

function formatSegment(segment) {
  if (/\d/.test(segment) || /^BKG-\d{2}-\d+$/i.test(segment)) {
    return segment;
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
  const segments = splitPath(location.pathname).filter(
    (seg) => seg.toLowerCase() !== "leads"
  );

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  }, [location.pathname]);

  return (
    <nav
      ref={scrollRef}
      className="flex items-center gap-1 text-sm text-secondary-text font-semibold overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden">
      <BiHome />
      <Link to="/Dashboard" className="hover:underline">
        Home
      </Link>

      {segments.map((segment, index) => {
        const path = "/" + segments.slice(0, index + 1).join("/");
        return (
          <React.Fragment key={path}>
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
