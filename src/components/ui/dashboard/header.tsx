
import { Bell, Menu } from "lucide-react";
import Pwd from "@/components/Pwd";

type Account = {
  name: string;
  email: string;
};

type HeaderProps = {
  account: Account | null | undefined;
  onToggleSidebar: () => void;
};

export default function Header({ account, onToggleSidebar }: HeaderProps) {
  const initial = account?.name?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="w-full h-full px-3 sm:px-4 md:px-6 flex items-center justify-between gap-3">
      {/* Bloc gauche: Hamburger (mobile) + logo */}
      <div className="flex items-center gap-2">
        {/* Hamburger visible uniquement sur mobile */}
        <button
          type="button"
          aria-label="Ouvrir le menu"
          onClick={onToggleSidebar}
          className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="overflow-hidden w-[120px] sm:w-[150px]">
          <img
            src="/logo1.png"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Bloc droit: actions + profil (adapté aux tailles) */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Icônes */}
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

        {/* Avatar + infos (sur xs on n'affiche que l'avatar) */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm sm:text-lg">
            {initial}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight">
              {account?.name ?? "Utilisateur"}
            </p>
            <p className="text-xs text-gray-500 leading-tight">
              {account?.email ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
