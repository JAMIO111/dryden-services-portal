import { BsBell, BsList } from "react-icons/bs";
import { GoMail } from "react-icons/go";
import HeaderIcon from "./HeaderIcon";
import SearchBar from "./ui/SearchBar";
import { useUser } from "../contexts/UserProvider";
import { useNotification } from "../contexts/NotificationProvider";
import { useNotifications } from "../hooks/useNotifications";
import Breadcrumb from "./Breadcrumb";

const Header = ({ onOpenMobileNav }) => {
  const { profile } = useUser();
  const userName = profile
    ? `${profile.first_name} ${profile.surname}`
    : "User";
  const jobTitle = profile ? profile.job_title : "Job Title";
  const { openPane } = useNotification();
  const { data: notifications } = useNotifications();

  const newNotifications = notifications
    ? notifications.filter((n) => !n.read).length
    : 0;

  return (
    <header className="flex justify-between items-center border-b-1 border-border-color bg-secondary-bg px-2 sm:px-4 gap-2 pt-[env(safe-area-inset-top)]">
      <button
        title="Open Menu"
        onClick={onOpenMobileNav}
        className="cursor-pointer p-2 -ml-2 md:hidden shrink-0">
        <BsList className="h-6 w-6 fill-icon-color hover:fill-primary-text" />
      </button>
      <div className="hidden sm:flex sm:w-40 md:w-1/3">
        <SearchBar />
      </div>
      <div className="flex-1 min-w-0 mx-1 sm:mx-3">
        <Breadcrumb />
      </div>

      <div className="flex justify-between items-center py-2 gap-1.5 sm:gap-3">
        <div className="hidden sm:block">
          <HeaderIcon icon={GoMail} top={7} right={3} />
        </div>
        <button onClick={() => openPane()}>
          <HeaderIcon
            showBadge={newNotifications > 0}
            icon={BsBell}
            top={8}
            right={8}
          />
        </button>
        <div className="hidden lg:flex flex-col ml-3">
          <span className="text-primary-text text-right font-semibold whitespace-nowrap">
            {userName}
          </span>
          <span className="text-right text-secondary-text">{jobTitle}</span>
        </div>
        {profile?.avatar ? (
          <img
            className="rounded-xl border-1 border-border-color w-10 h-10 sm:w-12 sm:h-12 object-cover shrink-0"
            src={profile.avatar}
            alt="Profile Pic"
          />
        ) : (
          <div className="rounded-xl border-1 border-border-color w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-primary-bg shrink-0">
            <span className="text-secondary-text">{`${profile.first_name.charAt(
              0
            )}${profile.surname.charAt(0)}`}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
