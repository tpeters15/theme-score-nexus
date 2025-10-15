import { ExecutiveDashboard } from "@/components/ExecutiveDashboard";
import { populateDashboardThemeSignals } from "@/utils/populateDashboardThemeSignals";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Populate signals on mount
    populateDashboardThemeSignals().catch(console.error);
  }, []);

  return <ExecutiveDashboard />;
};

export default Index;
