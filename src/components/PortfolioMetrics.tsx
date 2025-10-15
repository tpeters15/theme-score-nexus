import { ThemeWithScores } from "@/types/themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, AlertCircle, Play, Download, FileText } from "lucide-react";

interface PortfolioMetricsProps {
  themes: ThemeWithScores[];
}

export function PortfolioMetrics({ themes }: PortfolioMetricsProps) {
  const totalThemes = themes.length;
  
  // Calculate completion percentage (themes with scores)
  const themesWithScores = themes.filter(theme => theme.scores.length > 0);
  const completionPercentage = Math.round((themesWithScores.length / totalThemes) * 100);
  
  // Find top opportunities (high scoring themes)
  const topOpportunities = themes
    .filter(theme => theme.weighted_total_score >= 3.5)
    .length;
  
  // Find themes requiring attention (low confidence or low scores)
  const requiresAttention = themes
    .filter(theme => theme.overall_confidence === 'Low' || theme.weighted_total_score < 2.5)
    .length;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Portfolio Overview</h1>
          <p className="text-muted-foreground">Strategic investment intelligence dashboard</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Start Research Run
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Portfolio
          </Button>
          <Button variant="default" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate IC Summary
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Themes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalThemes}</div>
            <p className="text-xs text-muted-foreground">
              Across {new Set(themes.map(t => t.pillar)).size} strategic pillars
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Research Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {themesWithScores.length} of {totalThemes} themes analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Opportunities</CardTitle>
            <div className="h-3 w-3 bg-score-high rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-score-high">{topOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              High-scoring themes (70+ score)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requires Attention</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{requiresAttention}</div>
            <p className="text-xs text-muted-foreground">
              Low confidence or poor performance
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}