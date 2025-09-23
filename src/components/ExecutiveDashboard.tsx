import { TopThemesOverview } from "./TopThemesOverview";
import { RecentActivityCard } from "./RecentActivityCard";
import { SignalHighlightsCard } from "./MarketInsightsCard";
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
    <div className="container mx-auto px-6 pt-6 space-y-6">
      {/* Hero Section - Top Themes Overview */}
      <TopThemesOverview themes={themes} />
      
      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <RecentActivityCard themes={themes} />
        
        {/* Market Insights */}
        <SignalHighlightsCard />
      </div>
      
      {/* Regulatory Alerts - Full Width */}
      <RegulatoryImpactAlerts />
    </div>
  );
}