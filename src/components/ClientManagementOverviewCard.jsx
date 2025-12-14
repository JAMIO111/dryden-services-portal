import { useState, useRef, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Wallet,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClientManagementOverviewCard({
  owners = [],
  properties = [],
}) {
  const navigate = useNavigate();
  const [active, setActive] = useState("Owners");
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(0);

  const activeOwners = owners.filter((o) => o.is_active);
  const activeProperties = properties.filter((p) => p.is_active);

  const thisMonthsNewOwners = activeOwners.filter((o) => {
    const createdAt = new Date(o.created_at);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return createdAt >= startOfMonth;
  });

  const lastMonthsNewOwners = activeOwners.filter((o) => {
    const createdAt = new Date(o.created_at);
    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    startOfLastMonth.setDate(1);
    startOfLastMonth.setHours(0, 0, 0, 0);
    const endOfLastMonth = new Date();
    endOfLastMonth.setDate(1);
    endOfLastMonth.setHours(0, 0, 0, 0);
    endOfLastMonth.setMonth(endOfLastMonth.getMonth());
    return createdAt >= startOfLastMonth && createdAt < endOfLastMonth;
  });

  const thisMonthsNewProperties = activeProperties.filter((p) => {
    const createdAt = new Date(p.created_at);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return createdAt >= startOfMonth;
  });

  const lastMonthsNewProperties = activeProperties.filter((p) => {
    const createdAt = new Date(p.created_at);
    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    startOfLastMonth.setDate(1);
    startOfLastMonth.setHours(0, 0, 0, 0);
    const endOfLastMonth = new Date();
    endOfLastMonth.setDate(1);
    endOfLastMonth.setHours(0, 0, 0, 0);
    endOfLastMonth.setMonth(endOfLastMonth.getMonth());
    return createdAt >= startOfLastMonth && createdAt < endOfLastMonth;
  });

  const monthlyNewOwnersChangePercentage =
    ((thisMonthsNewOwners.length - lastMonthsNewOwners.length) /
      lastMonthsNewOwners.length) *
    100;

  const monthlyNewPropertiesChangePercentage =
    ((thisMonthsNewProperties.length - lastMonthsNewProperties.length) /
      lastMonthsNewProperties.length) *
    100;

  const getChangeDisplay = (current, previous) => {
    if (previous === 0)
      return {
        color: "text-gray-500",
        bg: "bg-gray-400/20",
        Icon: null,
        text: "–",
      };
    const percentChange = ((current - previous) / previous) * 100;
    if (percentChange > 0)
      return {
        color: "text-green-500",
        bg: "bg-green-500/20",
        Icon: ArrowUpRight,
        text: percentChange.toFixed(1) + "%",
      };
    if (percentChange < 0)
      return {
        color: "text-red-500",
        bg: "bg-red-500/20",
        Icon: ArrowDownRight,
        text: Math.abs(percentChange).toFixed(1) + "%",
      };
    return {
      color: "text-gray-400",
      bg: "bg-gray-400/10",
      Icon: null,
      text: "No change",
    };
  };

  const ownersChange = getChangeDisplay(
    thisMonthsNewOwners.length,
    lastMonthsNewOwners.length
  );
  const propertiesChange = getChangeDisplay(
    thisMonthsNewProperties.length,
    lastMonthsNewProperties.length
  );

  useEffect(() => {
    const updateVisibleCount = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const avatarWidth = 56; // w-14 = 56px
      const gap = 36; // gap-6 = 24px
      const totalPerAvatar = avatarWidth + gap;

      // Add a small buffer so rounding doesn’t undercount
      const count = Math.floor((containerWidth + gap / 2) / totalPerAvatar) - 1;
      setVisibleCount(Math.max(count, 1));
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const activeList = active === "Owners" ? activeOwners : activeProperties;

  const overflowCount = Math.max(activeList.length - visibleCount, 0);

  return (
    <div className="bg-secondary-bg shadow-m text-primary-text p-5 rounded-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-primary-text font-semibold">Overview</h2>
      </div>

      {/* Stats Section */}
      <div className="relative flex flex-col md:flex-row bg-primary-bg p-2 shadow-s rounded-3xl gap-6 overflow-hidden">
        {/* Animated background indicator */}
        <div
          className={`absolute top-2 bottom-2 left-2 w-[calc(50%-0.75rem)] rounded-2xl bg-tertiary-bg transition-transform duration-500 ease-out ${
            active === "Properties"
              ? "translate-x-[calc(100%+0.5rem)]"
              : "translate-x-0"
          }`}
          style={{ zIndex: 0 }}></div>

        {/* Owners */}
        <div
          onClick={() => setActive("Owners")}
          className={`flex-1 relative cursor-pointer p-4 rounded-2xl flex flex-col justify-center gap-3 "text-black"
          `}
          style={{ zIndex: 1 }}>
          <div className="flex items-center gap-2 mb-2">
            <Users size={22} />
            <span>Owners</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-5xl font-bold">{activeOwners.length}</span>
            <span
              className={`flex items-center gap-1 ${ownersChange.color} ${ownersChange.bg} px-2 py-1 rounded-lg text-xs`}>
              {ownersChange.Icon && <ownersChange.Icon size={14} />}
              {ownersChange.text} vs last month
            </span>
          </div>
        </div>

        {/* Properties */}
        <div
          onClick={() => setActive("Properties")}
          className={`flex-1 relative cursor-pointer p-4 rounded-2xl flex flex-col justify-center gap-3 text-primary-text`}
          style={{ zIndex: 1 }}>
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={22} />
            <span>Properties</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-5xl font-bold">
              {activeProperties.length}
            </span>
            <span
              className={`flex items-center gap-1 ${propertiesChange.color} ${propertiesChange.bg} px-2 py-1 rounded-lg text-xs`}>
              {propertiesChange.Icon && <propertiesChange.Icon size={14} />}
              {propertiesChange.text} vs last month
            </span>
          </div>
        </div>
      </div>

      {/* New Customers */}
      <div className="mt-3">
        <p className="text-lg text-primary-text font-medium">
          {active === "Owners"
            ? thisMonthsNewOwners.length
            : thisMonthsNewProperties.length}{" "}
          new{" "}
          {active === "Owners" && thisMonthsNewOwners.length === 1
            ? "owner"
            : active === "Properties" && thisMonthsNewProperties.length === 1
            ? "property"
            : active === "Properties"
            ? "properties"
            : "owners"}{" "}
          this month.
        </p>
        <p className="text-sm text-secondary-text mb-6">
          Make sure all their details are up to date.
        </p>

        <div className="flex gap-3 items-center justify-between">
          <div
            ref={containerRef}
            className="flex gap-3 pl-2 overflow-hidden flex-nowrap flex-grow">
            {active === "Owners"
              ? activeOwners
                  .sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                  )
                  .slice(0, visibleCount)
                  .map((owner, i) => (
                    <button
                      title={`${owner.first_name || ""} ${owner.surname || ""}`}
                      onClick={() =>
                        navigate(`/Client-Management/Owners/${owner.id}`)
                      }
                      key={i}
                      className="flex flex-col cursor-pointer items-center flex-shrink-0">
                      {owner.avatar ? (
                        <img
                          src={
                            owner.avatar ||
                            `https://i.pravatar.cc/100?u=${owner.id || i}`
                          }
                          alt={owner.first_name || owner.surname}
                          className="w-14 h-14 object-cover rounded-xl border border-border-color"
                        />
                      ) : (
                        <div className="w-14 hover:shadow-s h-14 flex items-center justify-center rounded-xl border border-border-color bg-primary-bg">
                          <p className="text-lg font-semibold text-primary-text">
                            {(owner.first_name?.[0] || "").toUpperCase()}
                            {(owner.surname?.[0] || "").toUpperCase()}
                          </p>
                        </div>
                      )}
                      <span className="text-xs text-secondary-text mt-2 truncate max-w-[4rem]">
                        {owner.first_name || owner.surname}
                      </span>
                    </button>
                  ))
              : activeProperties
                  .sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                  )
                  .slice(0, visibleCount)
                  .map((property, i) => (
                    <button
                      title={property.name}
                      onClick={() =>
                        navigate(
                          `/Client-Management/Properties/${property.name}`
                        )
                      }
                      key={i}
                      className="flex flex-col cursor-pointer items-center flex-shrink-0">
                      {property.image ? (
                        <img
                          src={property.image || `No Image`}
                          alt={"No Image"}
                          className="w-20 h-14 hover:shadow-s object-cover rounded-xl border border-border-color"
                        />
                      ) : (
                        <div className="w-20 h-14 hover:shadow-s flex items-center justify-center rounded-xl border border-border-color bg-primary-bg">
                          <Building2 className="w-6 h-6 text-secondary-text" />
                        </div>
                      )}
                      <span className="text-xs text-secondary-text mt-2 truncate max-w-[4rem]">
                        {property.name}
                      </span>
                    </button>
                  ))}

            {overflowCount > 0 && (
              <div className="flex flex-col items-center justify-start">
                <div className="w-14 h-14 flex items-center pr-1 text-lg justify-center rounded-xl bg-neutral-700 text-white">
                  +{overflowCount}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() =>
              active === "Owners"
                ? navigate("/Client-Management/Owners")
                : navigate("/Client-Management/Properties")
            }
            className="bg-neutral-800 shadow-s mb-7 text-white flex gap-3 p-3.5 rounded-xl hover:bg-neutral-700 transition">
            <ArrowUpRight /> View All {active}
          </button>
        </div>
      </div>
    </div>
  );
}
