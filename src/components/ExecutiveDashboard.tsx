import { TopThemesOverview } from "./TopThemesOverview";
import { IntelligenceFeed } from "./IntelligenceFeed";
import { RegulatoryImpactAlerts } from "./RegulatoryImpactAlerts";
import { useThemes } from "@/hooks/useThemes";
import { Skeleton } from "@/components/ui/skeleton";

export function ExecutiveDashboard() {
  const { themes, loading } = useThemes();

  if (loading) {
    return (
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
    );
  }

  return (
    <div className="container mx-auto px-6 space-y-8">
      {/* Hero Section - Top Themes Overview */}
      <div className="w-full">
        <TopThemesOverview themes={themes} />
      </div>
      
      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Intelligence Feed - Takes 2 columns */}
        <div className="lg:col-span-2">
          <IntelligenceFeed themes={themes} />
        </div>
        
        {/* Regulatory Alerts - Takes 1 column */}
        <div className="lg:col-span-1">
          <RegulatoryImpactAlerts />
        </div>
      </div>
    </div>
  );
}