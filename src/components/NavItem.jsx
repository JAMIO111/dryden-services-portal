import { NavLink, useLocation } from "react-router-dom";
import { HiOutlineChevronDown } from "react-icons/hi";

const NavItem = ({
  label,
  icon: Icon,
  path,
  isExpanded,
  hasSubMenu,
  onToggleSubMenu,
  isSubMenuOpen,
  closeMenu,
}) => {
  const location = useLocation();

  // Check if current path starts with this path (parent + any child)
  const match = location.pathname.startsWith(path);

  return (
    <div className="nav-item flex pr-3 items-center">
      {/* Left indicator */}
      <div
        className={`w-1 h-9 rounded-r-md ${
          match ? "bg-cta-color" : "bg-transparent"
        }`}></div>

      <NavLink
        title={label}
        to={path}
        onClick={closeMenu}
        className={`flex gap-3 w-full rounded-lg ml-2 p-2 h-9 items-center border border-transparent
          ${
            match
              ? "text-white border-cta-color bg-cta-color/80 hover:bg-cta-color/50 shadow-s"
              : "text-primary-text hover:border-cta-color/20 hover:bg-cta-color/10"
          }
        `}>
        {Icon && <Icon className="h-6 w-6" />}
        {isExpanded && <span className="text-sm flex-1">{label}</span>}

        {isExpanded && hasSubMenu && (
          <HiOutlineChevronDown
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSubMenu();
            }}
            className={`hover:bg-cta-color/20 rounded p-1.5 h-6 w-6 transition-transform ${
              isSubMenuOpen === label ? "rotate-180" : ""
            }`}
          />
        )}
      </NavLink>
    </div>
  );
};

export default NavItem;
