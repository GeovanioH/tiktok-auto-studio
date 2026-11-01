import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function DashboardLayout() {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const getTitle = () => {
    switch (location.pathname) {
      case "/studio":
        return "Studio Créatif IA (3-Clic Synthesizer)";
      case "/calendar":
        return "Planification & Automatisation Hebdomadaire";
      case "/posts":
        return "Historique des Publications & Relances";
      case "/accounts":
        return "Comptes & Sécurité ByteDance v2";
      case "/api-keys":
        return "Clés API & Coffre Cryptographique";
      default:
        return "Tableau de Bord & Analytics";
    }
  };

  return (
    <div className="theme-layout flex h-screen w-screen overflow-hidden bg-surface text-on-surface font-sans bg-grain relative transition-colors duration-300">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${
          isSidebarCollapsed ? "pl-20" : "pl-72"
        }`}
      >
        <Navbar title={getTitle()} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
}