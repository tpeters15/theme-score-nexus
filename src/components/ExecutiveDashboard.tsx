import { DashboardHeader } from "./DashboardHeader";
import { TopThemesOverview } from "./TopThemesOverview";
import { IntelligenceFeed } from "./IntelligenceFeed";
import { RegulatoryImpactAlerts } from "./RegulatoryImpactAlerts";
import { useThemes } from "@/hooks/useThemes";
import { Skeleton } from "@/components/ui/skeleton";

export function ExecutiveDashboard() {
  const { themes, loading } = useThemes();

  if (loading) {
    return (
      <div className="space-y-6">
        <DashboardHeader />
        <div className="container mx-auto px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Skeleton className="h-[400px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-[500px] w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <div className="container mx-auto px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <TopThemesOverview themes={themes} />
            <RegulatoryImpactAlerts />
          </div>
          
          {/* Right Column */}
          <div>
            <IntelligenceFeed themes={themes} />
          </div>
        </div>
      </div>
    </div>
  );
}