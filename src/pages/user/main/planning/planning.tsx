import { NavLink, Outlet } from "react-router-dom";

export default function Planning() {
  const base =
    "px-3 py-2 border rounded-md text-sm font-medium transition-colors";
  const active = "bg-gray-700 text-white border-gray-700";
  const inactive = "bg-white text-gray-800 hover:bg-gray-50";

  return (
    <>
      <div className="p-4 flex items-center gap-2">
        <NavLink
          to="/user/planning"
          end
          className={({ isActive }) =>
            `${base} ${isActive ? active : inactive}`
          }
        >
          semaine
        </NavLink>

        <NavLink
          to="/user/planning/month"
          className={({ isActive }) =>
            `${base} ${isActive ? active : inactive}`
          }
        >
          mois
        </NavLink>
      </div>
      <Outlet />
    </>
  );
}
