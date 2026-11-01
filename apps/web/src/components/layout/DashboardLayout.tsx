import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function DashboardLayout() {
  const location = useLocation();

  const getTitle = () => {
    switch (location.pathname) {
      case "/studio":
        return "Studio IA Multimodal (3 Clics)";
      case "/calendar":
        return "Calendrier Éditorial & Horaires Optimales";
      case "/posts":
        return "Historique des Publications & Relance";
      case "/accounts":
        return "Comptes TikTok & Conformité ByteDance";
      case "/api-keys":
        return "Clés API & Configuration Système";
      default:
        return "Vue d'ensemble du Studio";
    }
  };

  return (
    <div className="theme-layout flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans bg-grain relative transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title={getTitle()} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
