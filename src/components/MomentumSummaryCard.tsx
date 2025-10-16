import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useThemeMomentum } from "@/hooks/useThemeMomentum";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, ArrowRight, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PILLAR_COLORS } from "@/types/themes";

export function MomentumSummaryCard() {
  const { data: momentumData, isLoading } = useThemeMomentum('30d');
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Theme Momentum
          </CardTitle>
          <CardDescription>Tracking emerging opportunities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const topThemes = momentumData?.slice(0, 3) || [];

  const getMomentumColor = (score: number) => {
    if (score >= 75) return "text-red-600 dark:text-red-400";
    if (score >= 50) return "text-amber-600 dark:text-amber-400";
    if (score >= 25) return "text-blue-600 dark:text-blue-400";
    return "text-muted-foreground";
  };

  const getPillarColor = (pillar: string) => {
    return PILLAR_COLORS[pillar as keyof typeof PILLAR_COLORS] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" />
              Theme Momentum
            </CardTitle>
            <CardDescription>Themes gaining traction this month</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/momentum')}
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {topThemes.map((theme, index) => (
          <div
            key={theme.theme_id}
            onClick={() => navigate(`/theme/${theme.theme_id}`)}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
          >
            {/* Rank Badge */}
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {index + 1}
            </div>

            {/* Theme Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{theme.theme_name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`text-xs ${getPillarColor(theme.pillar)}`}>
                  {theme.pillar}
                </Badge>
                {theme.trend_direction === 'accelerating' && (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                )}
                <span className="text-xs text-muted-foreground">
                  {theme.signal_velocity_30d.toFixed(1)} signals/day
                </span>
              </div>
            </div>

            {/* Momentum Score */}
            <div className="flex-shrink-0 text-right">
              <div className={`text-lg font-bold ${getMomentumColor(theme.momentum_score)}`}>
                {theme.momentum_score.toFixed(0)}
              </div>
            </div>
          </div>
        ))}

        {topThemes.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No momentum data available yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
