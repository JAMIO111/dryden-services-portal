import { RxDashboard } from "react-icons/rx";
import { BsPeople } from "react-icons/bs";
import { IoReceiptOutline } from "react-icons/io5";
import { BsBuildingGear } from "react-icons/bs";
import { HiOutlineWrenchScrewdriver } from "react-icons/hi2";
import { IoCalendarOutline } from "react-icons/io5";

export const menuStructure = [
  {
    name: "Dashboard",
    icon: RxDashboard,
    path: "/Dashboard",
    subMenu: [],
  },
  {
    name: "Bookings",
    icon: IoReceiptOutline,
    path: "/Bookings",
    subMenu: [
      {
        name: "New Booking",
        path: "/Bookings/New-Booking",
      },
      {
        name: "Existing Bookings",
        path: "/Bookings/View-Existing",
      },
    ],
  },
  {
    name: "Client Management",
    icon: BsBuildingGear,
    path: "/Client-Management",
    subMenu: [
      {
        name: "Properties",
        path: "/Client-Management/Properties",
      },
      {
        name: "Owners",
        path: "/Client-Management/Owners",
      },
    ],
  },
  {
    name: "Maintenance",
    icon: HiOutlineWrenchScrewdriver,
    path: "/Maintenance",
    subMenu: [],
  },
  {
    name: "Human Resources",
    icon: BsPeople,
    path: "/Human-Resources",
    subMenu: [
      {
        name: "Employees",
        path: "/Human-Resources/Employees",
      },
      {
        name: "Holidays",
        path: "/Human-Resources/Holidays",
      },
      {
        name: "Training",
        path: "/Human-Resources/Training",
      },
    ],
  },
  {
    name: "Calendar",
    icon: IoCalendarOutline,
    path: "/Calendar",
  },
];
