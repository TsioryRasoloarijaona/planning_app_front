import React, { useEffect, useState } from "react";

interface DashControls {
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  isSidebarOpen: boolean;
}

interface DashProps {
  /** Passe une fonction qui reçoit les contrôles pour afficher le bouton hamburger dans le header */
  header: (controls: DashControls) => React.ReactNode;
  sidebar: React.ReactNode;
  main: React.ReactNode;
}

/**
 * Layout responsive :
 * - Desktop (md+): sidebar fixe à gauche (16rem), main à droite
 * - Mobile: sidebar en drawer (slide-in), overlay cliquable pour fermer
 */
export default function Dash({ header, sidebar, main }: DashProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Fermer le drawer si on resize en desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const controls: DashControls = { toggleSidebar, openSidebar, closeSidebar, isSidebarOpen };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white">
      {/* Header */}
      <header className="h-[10vh] min-h-[56px] shrink-0 border-b flex items-center">
        {header(controls)}
      </header>

      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-[16rem_1fr] flex-1 overflow-hidden">
        <aside className="h-full overflow-auto border-r">{sidebar}</aside>
        <main className="h-full overflow-auto">{main}</main>
      </div>

      {/* Mobile layout: main plein écran + drawer */}
      <div className="md:hidden relative flex-1 overflow-hidden">
        <main className="h-full overflow-auto">{main}</main>

        {/* Drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85%] bg-white border-r shadow-lg transform transition-transform duration-200 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu latéral"
        >
          <div className="h-full overflow-auto">{sidebar}</div>
        </aside>

        {/* Overlay */}
        {isSidebarOpen && (
          <button
            aria-label="Fermer le menu"
            className="fixed inset-0 z-30 bg-black/40"
            onClick={closeSidebar}
          />
        )}
      </div>
    </div>
  );
}
