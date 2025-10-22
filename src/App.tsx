import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "@/components/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Themes from "./pages/Themes";
import Signals from "./pages/Signals";
import Research from "./pages/Research";
import RegulatoryTracker from "./pages/RegulatoryTracker";
import SourceMonitors from "./pages/SourceMonitors";
import Classifier from "./pages/Classifier";
import Auth from "./pages/Auth";
import ThemeProfile from "./pages/ThemeProfile";
import SourceProfile from "./pages/SourceProfile";
import TaxonomyManagement from "./pages/TaxonomyManagement";
import ScraperManagement from "./pages/ScraperManagement";
import ThemePopulator from "./pages/ThemePopulator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="/" element={<Index />} />
                <Route path="/themes" element={<Themes />} />
                <Route path="/regulatory-tracker" element={<RegulatoryTracker />} />
                <Route path="/signals" element={<Signals />} />
                <Route path="/research" element={<Research />} />
                <Route path="/source-monitors" element={<SourceMonitors />} />
                <Route path="/source/:sourceId" element={<SourceProfile />} />
                <Route path="/classifier" element={<Classifier />} />
                <Route path="/taxonomy" element={<TaxonomyManagement />} />
                <Route path="/scraper-management" element={<ScraperManagement />} />
                <Route path="/admin/theme-populator" element={<ThemePopulator />} />
                <Route path="/theme/:themeId" element={<ThemeProfile />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
