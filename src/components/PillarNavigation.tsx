import { ThemeWithScores, PILLAR_COLORS } from "@/types/themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface PillarNavigationProps {
  themes: ThemeWithScores[];
  onPillarSelect: (pillar: string) => void;
}

export function PillarNavigation({ themes, onPillarSelect }: PillarNavigationProps) {
  // Group themes by pillar
  const pillarData = themes.reduce((acc, theme) => {
    if (!acc[theme.pillar]) {
      acc[theme.pillar] = [];
    }
    acc[theme.pillar].push(theme);
    return acc;
  }, {} as Record<string, ThemeWithScores[]>);

  // Sort pillars by theme count (descending)
  const sortedPillars = Object.entries(pillarData).sort((a, b) => b[1].length - a[1].length);

  const getPillarStats = (themes: ThemeWithScores[]) => {
    const totalThemes = themes.length;
    const avgScore = themes.reduce((sum, theme) => sum + theme.weighted_total_score, 0) / totalThemes;
    const topThemes = themes
      .filter(theme => theme.weighted_total_score >= 70)
      .sort((a, b) => b.weighted_total_score - a.weighted_total_score)
      .slice(0, 3);
    
    const sectors = [...new Set(themes.map(theme => theme.sector))];
    
    return { totalThemes, avgScore, topThemes, sectors };
  };

  const getPillarCardSize = (index: number, total: number) => {
    if (total === 1) return "md:col-span-3";
    if (total === 2) return "md:col-span-3 lg:col-span-1.5";
    if (index === 0) return "md:col-span-2"; // Largest pillar gets bigger card
    return "md:col-span-1";
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Strategic Pillars</h2>
        <p className="text-muted-foreground">Navigate your investment universe by strategic focus area</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedPillars.map(([pillar, pillarThemes], index) => {
          const stats = getPillarStats(pillarThemes);
          const pillarColor = PILLAR_COLORS[pillar as keyof typeof PILLAR_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
          
          return (
            <Card 
              key={pillar} 
              className={cn(
                "hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden",
                getPillarCardSize(index, sortedPillars.length)
              )}
              onClick={() => onPillarSelect(pillar)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className={cn("text-xs font-medium", pillarColor)}>
                    {pillar}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Target className="h-4 w-4 mr-1" />
                    {stats.totalThemes}
                  </div>
                </div>
                
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {pillar} Portfolio
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Average Score */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg. Score</span>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-16 rounded-full",
                      stats.avgScore >= 70 ? "bg-score-high" :
                      stats.avgScore >= 40 ? "bg-score-medium" : "bg-score-low"
                    )} />
                    <span className="text-sm font-medium">{Math.round(stats.avgScore)}</span>
                  </div>
                </div>

                {/* Top Themes Preview */}
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Top Opportunities
                  </div>
                  <div className="space-y-1">
                    {stats.topThemes.slice(0, 2).map((theme) => (
                      <div key={theme.id} className="text-xs text-muted-foreground flex justify-between">
                        <span className="truncate mr-2">{theme.name}</span>
                        <span className="font-medium">{Math.round(theme.weighted_total_score)}</span>
                      </div>
                    ))}
                    {stats.topThemes.length === 0 && (
                      <div className="text-xs text-muted-foreground italic">No high-scoring themes yet</div>
                    )}
                  </div>
                </div>

                {/* Sectors */}
                <div>
                  <div className="text-sm font-medium mb-2">Sectors ({stats.sectors.length})</div>
                  <div className="flex flex-wrap gap-1">
                    {stats.sectors.slice(0, 3).map((sector) => (
                      <Badge key={sector} variant="outline" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
                    {stats.sectors.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{stats.sectors.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Explore Button */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPillarSelect(pillar);
                  }}
                >
                  Explore {pillar}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>

              {/* Hover overlay effect */}
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Card>
          );
        })}
      </div>
    </section>
  );
}