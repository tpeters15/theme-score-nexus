import { useState } from "react";
import { useThemeMomentum } from "@/hooks/useThemeMomentum";
import { MomentumChart } from "@/components/MomentumChart";
import { MomentumLeaderboard } from "@/components/MomentumLeaderboard";
import { MomentumMetrics } from "@/components/MomentumMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PILLAR_COLORS } from "@/types/themes";

const Momentum = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  
  const { data: momentumData, isLoading } = useThemeMomentum(timeRange);

  // Filter by pillar
  const filteredData = selectedPillar === 'all' 
    ? momentumData || []
    : (momentumData || []).filter(theme => theme.pillar === selectedPillar);

  // Get unique pillars
  const pillars = Array.from(new Set((momentumData || []).map(t => t.pillar)));

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Theme Momentum Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Tracking theme traction and emerging opportunities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPillar} onValueChange={setSelectedPillar}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Pillars" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pillars</SelectItem>
              {pillars.map(pillar => (
                <SelectItem key={pillar} value={pillar}>
                  {pillar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <TabsList>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Key Metrics */}
      <MomentumMetrics themes={filteredData} />

      {/* Chart */}
      <MomentumChart themes={filteredData} topN={7} />

      {/* Leaderboard */}
      <MomentumLeaderboard themes={filteredData} />
    </div>
  );
};

export default Momentum;
