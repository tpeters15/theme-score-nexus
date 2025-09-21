import { DashboardHeader } from "./DashboardHeader";
import { ThemeDashboard } from "./ThemeDashboard";
import { useThemes } from "@/hooks/useThemes";
import { Skeleton } from "@/components/ui/skeleton";

export function ExecutiveDashboard() {
  const { themes, loading } = useThemes();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <ThemeDashboard />
      </div>
    </div>
  );
}