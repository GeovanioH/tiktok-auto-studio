import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { StudioPage } from "./pages/StudioPage";
import { SimulatorPage } from "./pages/SimulatorPage";
import { CalendarPage } from "./pages/CalendarPage";
import { PostsPage } from "./pages/PostsPage";
import { AccountsPage } from "./pages/AccountsPage";
import { ApiKeysPage } from "./pages/ApiKeysPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function App() {
  // Global ReactBits Spotlight tracking for any .spotlight-card
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const card = target?.closest<HTMLElement>(".spotlight-card");
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      }
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/api-keys" element={<ApiKeysPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
