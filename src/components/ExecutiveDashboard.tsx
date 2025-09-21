import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "./DashboardHeader";
import { PortfolioMetrics } from "./PortfolioMetrics";
import { PillarNavigation } from "./PillarNavigation";
import { IntelligenceFeed } from "./IntelligenceFeed";
import { ThemeDashboard } from "./ThemeDashboard";
import { useThemes } from "@/hooks/useThemes";
import { Skeleton } from "@/components/ui/skeleton";

export function ExecutiveDashboard() {
  const { themes, loading } = useThemes();
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const navigate = useNavigate();

  // If a pillar is selected, show the filtered theme grid
  if (selectedPillar) {
    return (
      <ThemeDashboard
        initialPillarFilter={selectedPillar}
        onBackToOverview={() => setSelectedPillar(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Metrics skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          
          {/* Pillar cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
          
          {/* Intelligence feed skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Portfolio Overview Metrics */}
        <PortfolioMetrics themes={themes} />
        
        {/* Strategic Pillar Navigation */}
        <PillarNavigation 
          themes={themes} 
          onPillarSelect={setSelectedPillar}
        />
        
        {/* Intelligence Feed */}
        <IntelligenceFeed themes={themes} />
      </div>
    </div>
  );
}