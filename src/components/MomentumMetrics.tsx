import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeMomentum } from "@/hooks/useThemeMomentum";
import { Flame, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MomentumMetricsProps {
  themes: ThemeMomentum[];
}

export function MomentumMetrics({ themes }: MomentumMetricsProps) {
  const navigate = useNavigate();

  // Find key themes
  const hottestTheme = themes.reduce((max, theme) => 
    theme.momentum_score > max.momentum_score ? theme : max, themes[0]
  );

  const risingStar = themes.reduce((max, theme) => 
    theme.signal_acceleration > max.signal_acceleration ? theme : max, themes[0]
  );

  const coolingDown = themes
    .filter(t => t.trend_direction === 'decelerating' && t.momentum_score >= 50)
    .sort((a, b) => b.momentum_score - a.momentum_score)[0];

  const emerging = themes
    .filter(t => t.momentum_score >= 30 && t.momentum_score < 50 && t.trend_direction === 'accelerating')
    .sort((a, b) => b.signal_acceleration - a.signal_acceleration)[0];

  const metrics = [
    {
      title: "Hottest Theme",
      theme: hottestTheme,
      icon: Flame,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-950",
      value: hottestTheme?.momentum_score.toFixed(0),
      label: "momentum score",
    },
    {
      title: "Rising Star",
      theme: risingStar,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-950",
      value: risingStar?.signal_acceleration >= 0 ? `+${risingStar?.signal_acceleration.toFixed(2)}` : risingStar?.signal_acceleration.toFixed(2),
      label: "acceleration",
    },
    {
      title: "Cooling Down",
      theme: coolingDown,
      icon: TrendingDown,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-950",
      value: coolingDown?.momentum_score.toFixed(0) || "N/A",
      label: coolingDown ? "momentum score" : "none detected",
    },
    {
      title: "Emerging",
      theme: emerging,
      icon: Sparkles,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-950",
      value: emerging?.signal_velocity_7d.toFixed(1) || "N/A",
      label: emerging ? "signals/day" : "none detected",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card
            key={metric.title}
            className={metric.theme ? "cursor-pointer hover:bg-accent/50 transition-colors" : ""}
            onClick={() => metric.theme && navigate(`/theme/${metric.theme.theme_id}`)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.label}
              </p>
              {metric.theme && (
                <p className="text-sm font-medium mt-2 truncate">
                  {metric.theme.theme_name}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
