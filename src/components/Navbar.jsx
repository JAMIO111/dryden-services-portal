import { useState } from "react";
import Logo from "../assets/dryden-logo-square.png";
import { GoSidebarExpand } from "react-icons/go";
import { BsGear, BsQuestionCircle } from "react-icons/bs";
import NavItem from "./NavItem";
import Logout from "./Logout";
import { menuStructure } from "../MenuStructure";
import SubMenuItem from "./SubMenuItem";
import ThemeToggle from "./ThemeToggle";
import { useUser } from "../contexts/UserProvider";

const Navbar = ({ isMobileOpen = false, onCloseMobile }) => {
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(null);
  const { profile } = useUser();

  // On mobile the nav renders as a full-width drawer, so the collapsed
  // icon-only state (desktop-only) shouldn't apply there.
  const showExpandedContent = isMenuExpanded || isMobileOpen;

  const toggleMenu = () => {
    setIsSubMenuOpen(null);
    setIsMenuExpanded((prev) => !prev);
  };

  const closeMenu = () => {
    setIsSubMenuOpen(null);
    setIsMenuExpanded(false);
    onCloseMobile?.();
  };

  const toggleSubMenu = (name) => {
    setIsSubMenuOpen((prev) => (prev === name ? null : name));
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onCloseMobile}
        />
      )}
      <div
        className={`flex bg-secondary-bg fixed inset-y-0 right-0 z-50 transition-transform duration-300 md:static md:z-auto md:translate-x-0 md:transition-none ${
          isMobileOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        <nav
          className={`flex flex-col border-l md:border-r ${
            !isMenuExpanded ? "md:transition-all md:duration-500" : null
          } min-w-fit border-border-color h-full w-68 ${
            isMenuExpanded ? "md:w-68" : "md:w-14"
          }`}>
          <div
            className={`flex justify-start items-center py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] border-b-1 border-border-color ${
              showExpandedContent ? "flex-row mx-3" : "md:flex-col md:gap-3"
            }`}>
            <div className="flex bg-primary-bg border border-primary-text rounded-xl p-0.5 items-center justify-start gap-3">
              <div className="flex justify-center items-center bg-white rounded-[10px] p-1">
                <img className="w-6 h-6" src={Logo} alt="Logo" />
              </div>
            </div>
            {showExpandedContent && (
              <div className="flex flex-col justify-between items-start flex-1">
                <h1 className="ml-3 flex-1 text-sm text-primary-text">
                  Dryden Services Ltd
                </h1>
                <p className="ml-3 flex-1 text-xs text-secondary-text">
                  Business Portal
                </p>
              </div>
            )}
            <button
              title={isMenuExpanded ? "Hide Menu" : "Expand Menu"}
              onClick={toggleMenu}
              className="cursor-pointer hidden md:block">
              <GoSidebarExpand
                className={`h-6 w-6 fill-icon-color hover:fill-primary-text ${
                  !isMenuExpanded && "rotate-180"
                }`}
              />
            </button>
            <button
              title="Close Menu"
              onClick={onCloseMobile}
              style={{
                rotate: !isMenuExpanded ? "180deg" : "0deg",
              }}
              className="cursor-pointer md:hidden">
              <GoSidebarExpand className="h-6 w-6 fill-icon-color hover:fill-primary-text" />
            </button>
          </div>
          <div className="flex flex-col h-full overflow-y-auto justify-between">
            <ul className="gap-1 flex-1 flex flex-col pt-3">
              {menuStructure.map((item) => (
                <li key={item.name}>
                  <NavItem
                    title={item.name}
                    label={item.name}
                    icon={item.icon}
                    path={item.path}
                    isExpanded={showExpandedContent}
                    closeMenu={closeMenu}
                    hasSubMenu={
                      Array.isArray(item.subMenu) && item.subMenu.length > 0
                    }
                    onToggleSubMenu={() => toggleSubMenu(item.name)}
                    isSubMenuOpen={isSubMenuOpen}
                  />
                  {item.subMenu && isSubMenuOpen === item.name && (
                    <ul className="ml-4 flex flex-col">
                      {item.subMenu?.map((subItem, index) => (
                        <li key={subItem.name}>
                          <SubMenuItem
                            title={subItem.name}
                            label={subItem.name}
                            path={subItem.path}
                            isFirst={index === 0}
                            isLast={index === item.subMenu?.length - 1}
                            closeMenu={closeMenu}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <div className="border-t-1 mt-2 border-border-color"></div>
            <ul className="gap-2 flex my-2 flex-col pb-[env(safe-area-inset-bottom)]">
              <NavItem
                label="Settings"
                icon={BsGear}
                isExpanded={showExpandedContent}
                onClick={() => {}}
                path="/Settings"
                closeMenu={closeMenu}
              />
              <NavItem
                label="Help Centre"
                icon={BsQuestionCircle}
                isExpanded={showExpandedContent}
                path="/Help"
                closeMenu={closeMenu}
              />
              <div className="border-t-1 mx-3 border-border-color md:hidden"></div>
              <div className="flex items-center gap-3 px-3 py-2 md:hidden">
                {profile?.avatar ? (
                  <img
                    className="rounded-xl border border-border-color w-11 h-11 object-cover shrink-0"
                    src={profile.avatar}
                    alt="Profile"
                  />
                ) : (
                  <div className="rounded-xl border border-border-color w-11 h-11 flex items-center justify-center bg-primary-bg shrink-0">
                    <span className="text-secondary-text text-sm">
                      {profile?.first_name?.charAt(0)}
                      {profile?.surname?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-primary-text font-semibold truncate">
                    {profile
                      ? `${profile.first_name} ${profile.surname}`
                      : "User"}
                  </span>
                  <span className="text-sm text-secondary-text truncate">
                    {profile?.job_title || ""}
                  </span>
                </div>
              </div>
              <div className="border-t-1 mx-3 border-border-color"></div>
              <div className="flex flex-col pl-3 justify-between items-start gap-4 py-2">
                <ThemeToggle menuExpanded={showExpandedContent} />
                <Logout isExpanded={showExpandedContent} />
              </div>
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
