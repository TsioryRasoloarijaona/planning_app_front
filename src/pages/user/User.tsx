import { type Account } from "@/interfaces/LoginRes";
import { get } from "@/hooks/fecthing/get";
import { useQuery } from "@tanstack/react-query";
import Dash from "@/components/ui/dashboard/dash";
import Sidebar from "@/components/ui/dashboard/sidebar";
import { Bell, Calendar, Umbrella, Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import Pwd from "@/components/Pwd";

export default function User() {
  const fetchUser = async () => {
    return await get<Account>("account/me");
  };

  const { data: account } = useQuery<Account>({
    queryKey: ["user"],
    queryFn: fetchUser,
  });

  const sidebarContent = [
    { label: "Congés", icon: <Umbrella />, path: "/user" },
    { label: "Planning", icon: <Calendar />, path: "/user/planning" },
  ];

  // Header désormais une fonction qui reçoit les contrôles du layout
  const header = (controls: { toggleSidebar: () => void }) => (
    <div className="w-full h-full px-3 sm:px-4 md:px-6 flex items-center justify-between gap-3">
      {/* Gauche : hamburger (mobile) + logo */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Ouvrir le menu"
          onClick={controls.toggleSidebar}
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="overflow-hidden w-[120px] sm:w-[150px]">
          <img
            src="/logo1.png"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Droite : actions + profil */}
      <div className="flex items-center gap-3 sm:gap-6">
        <ul className="flex items-center gap-3 sm:gap-4">
          <li>
            <button
              type="button"
              aria-label="Notifications"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
            >
              <Bell size={18} />
            </button>
          </li>
          <li>
            <Pwd />
          </li>
        </ul>

        <div className="flex items-center gap-3">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm sm:text-lg">
            {(account?.name?.[0] ?? "U").toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight">{account?.name ?? "Utilisateur"}</p>
            <p className="text-xs text-gray-500 leading-tight">{account?.email ?? "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const sidebar: React.ReactNode = <Sidebar items={sidebarContent} />;

  return <Dash header={header} sidebar={sidebar} main={<Outlet />} />;
}
