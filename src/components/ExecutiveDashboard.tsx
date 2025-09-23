import { DashboardHeader } from "./DashboardHeader";
import { ThemeDashboard } from "./ThemeDashboard";
import { useThemes } from "@/hooks/useThemes";
import { Skeleton } from "@/components/ui/skeleton";

export function ExecutiveDashboard() {
  const { themes, loading } = useThemes();

  return (
    <div className="p-6">
      <ThemeDashboard />
    </div>
  );
}