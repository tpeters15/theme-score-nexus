import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeMomentum } from "@/hooks/useThemeMomentum";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PILLAR_COLORS } from "@/types/themes";

interface MomentumLeaderboardProps {
  themes: ThemeMomentum[];
}

export function MomentumLeaderboard({ themes }: MomentumLeaderboardProps) {
  const navigate = useNavigate();

  const getMomentumColor = (score: number) => {
    if (score >= 75) return "text-red-600 dark:text-red-400";
    if (score >= 50) return "text-amber-600 dark:text-amber-400";
    if (score >= 25) return "text-blue-600 dark:text-blue-400";
    return "text-muted-foreground";
  };

  const getMomentumBadge = (score: number) => {
    if (score >= 75) return { label: "🔥 Hot", variant: "destructive" as const };
    if (score >= 50) return { label: "📈 Rising", variant: "default" as const };
    if (score >= 25) return { label: "⚡ Moderate", variant: "secondary" as const };
    return { label: "💤 Low", variant: "outline" as const };
  };

  const getTrendIcon = (direction: string) => {
    if (direction === 'accelerating') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (direction === 'decelerating') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getPillarColor = (pillar: string) => {
    return PILLAR_COLORS[pillar as keyof typeof PILLAR_COLORS] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Momentum Leaders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {themes.map((theme, index) => {
          const momentumBadge = getMomentumBadge(theme.momentum_score);
          
          return (
            <div
              key={theme.theme_id}
              onClick={() => navigate(`/theme/${theme.theme_id}`)}
              className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                {index + 1}
              </div>

              {/* Theme Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{theme.theme_name}</h3>
                  {getTrendIcon(theme.trend_direction)}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={getPillarColor(theme.pillar)}>
                    {theme.pillar}
                  </Badge>
                  <Badge variant={momentumBadge.variant}>
                    {momentumBadge.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {theme.signal_velocity_30d.toFixed(1)} signals/day
                  </span>
                  {theme.deal_count > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {theme.deal_count} deals
                    </span>
                  )}
                </div>
              </div>

              {/* Momentum Score */}
              <div className="flex-shrink-0 text-right">
                <div className={`text-2xl font-bold ${getMomentumColor(theme.momentum_score)}`}>
                  {theme.momentum_score.toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">momentum</div>
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
