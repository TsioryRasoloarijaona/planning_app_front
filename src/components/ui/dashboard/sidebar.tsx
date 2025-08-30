import React, { useState } from "react";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type PropsType = {
  label: string;
  icon: React.ReactNode;
  path: string | null;
};

type SidebarProps = {
  items: PropsType[];
};

const LOGOUT_ENDPOINT = "/auth/logout";
const baseUrl = import.meta.env.VITE_BASE_URL;

export default function Sidebar({ items }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      const res = await fetch(`${baseUrl}${LOGOUT_ENDPOINT}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Logout failed with status ${res.status}`);
      }

      toast.success("Déconnexion réussie");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la déconnexion");
    } finally {
      queryClient.clear();
      navigate("/", { replace: true });
      setLoggingOut(false);
    }
  };

  return (
    <div className="p-4 w-full">
      <ul className="space-y-1 text-sm font-medium text-gray-700">
        <li className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer mb-5">
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </li>

        {items.map((el, idx) => {
          const isActive = location.pathname === el.path;

          return (
            <button
              key={idx}
              onClick={() => el.path && navigate(el.path)}
              className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 ${
                isActive ? "bg-gray-200 font-bold " : ""
              }`}
            >
              <div className="flex items-center gap-2">
                {el.icon}
                {el.label}
              </div>
            </button>
          );
        })}

        <li
          className={`mt-5 flex items-center justify-between px-3 py-2 rounded-lg font-semibold text-gray-900 cursor-pointer ${
            loggingOut ? "opacity-60 cursor-not-allowed" : ""
          }`}
          onClick={handleLogout}
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            {loggingOut ? "Déconnexion..." : "Déconnexion"}
          </div>
        </li>
      </ul>
    </div>
  );
}
