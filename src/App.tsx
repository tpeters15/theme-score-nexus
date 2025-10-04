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
import BatchClassifier from "./pages/BatchClassifier";
import Auth from "./pages/Auth";
import ThemeProfile from "./pages/ThemeProfile";
import TaxonomyManagement from "./pages/TaxonomyManagement";
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
              <Route path="/*" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/themes" element={<Themes />} />
                      <Route path="/regulatory-tracker" element={<RegulatoryTracker />} />
                      <Route path="/signals" element={<Signals />} />
                      <Route path="/research" element={<Research />} />
                      <Route path="/source-monitors" element={<SourceMonitors />} />
                      <Route path="/batch-classifier" element={<BatchClassifier />} />
                      <Route path="/taxonomy" element={<TaxonomyManagement />} />
                      <Route path="/theme/:themeId" element={<ThemeProfile />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
