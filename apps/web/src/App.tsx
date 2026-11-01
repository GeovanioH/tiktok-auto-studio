import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { StudioPage } from "./pages/StudioPage";
import { CalendarPage } from "./pages/CalendarPage";
import { PostsPage } from "./pages/PostsPage";
import { AccountsPage } from "./pages/AccountsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
