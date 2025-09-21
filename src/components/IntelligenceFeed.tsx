import { ThemeWithScores } from "@/types/themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  ExternalLink,
  Bell,
  Activity,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IntelligenceFeedProps {
  themes: ThemeWithScores[];
}

export function IntelligenceFeed({ themes }: IntelligenceFeedProps) {
  // Generate recent activity timeline
  const recentActivity = [
    {
      id: "1",
      type: "research_complete",
      title: "Research completed for Energy Storage",
      description: "AI analysis identified 3 new market signals",
      timestamp: "2 hours ago",
      theme: themes.find(t => t.name.includes("Energy Storage")) || themes[0],
      icon: FileText,
      color: "text-green-600"
    },
    {
      id: "2", 
      type: "score_update",
      title: "Carbon Capture score updated",
      description: "Market Attractiveness increased from 65 to 72",
      timestamp: "4 hours ago",
      theme: themes.find(t => t.name.includes("Carbon")) || themes[1],
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      id: "3",
      type: "alert",
      title: "New regulatory developments",
      description: "EU taxonomy updates affecting 5 themes",
      timestamp: "6 hours ago",
      theme: null,
      icon: Bell,
      color: "text-amber-600"
    }
  ];

  // Identify themes requiring attention
  const flaggedThemes = themes
    .filter(theme => 
      theme.overall_confidence === 'Low' || 
      theme.weighted_total_score < 40 ||
      theme.scores.some(score => score.confidence === 'Low')
    )
    .slice(0, 5);

  // Get top performers for quick access
  const topPerformers = themes
    .filter(theme => theme.weighted_total_score >= 70)
    .sort((a, b) => b.weighted_total_score - a.weighted_total_score)
    .slice(0, 5);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Intelligence Feed</h2>
        <p className="text-muted-foreground">Real-time insights, alerts, and portfolio intelligence</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={cn("p-2 rounded-full bg-background", activity.color)}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{activity.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{activity.description}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    {activity.theme && (
                      <Badge variant="outline" className="text-xs">
                        {activity.theme.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="ghost" className="w-full text-sm">
              View All Activity
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Flagged Themes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Requires Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {flaggedThemes.length > 0 ? (
              flaggedThemes.map((theme) => (
                <div key={theme.id} className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{theme.name}</div>
                    <div className="text-xs text-muted-foreground">{theme.sector}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Score: {Math.round(theme.weighted_total_score)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {theme.overall_confidence} Confidence
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">All themes performing well</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="font-medium text-sm mb-1">Renewable Energy Outlook</div>
              <div className="text-xs text-muted-foreground mb-2">
                IEA report suggests accelerated growth in renewable capacity through 2024
              </div>
              <Badge variant="secondary" className="text-xs">Impact: +3 themes</Badge>
            </div>
            
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="font-medium text-sm mb-1">Carbon Credit Pricing</div>
              <div className="text-xs text-muted-foreground mb-2">
                EU ETS prices hitting record highs, affecting investment attractiveness
              </div>
              <Badge variant="secondary" className="text-xs">Impact: +5 themes</Badge>
            </div>
            
            <Button variant="ghost" className="w-full text-sm">
              View All Insights
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Quick Access - Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-score-high" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((theme, index) => (
                <div key={theme.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-score-high text-score-high-foreground text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{theme.name}</div>
                      <div className="text-xs text-muted-foreground">{theme.sector}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-score-high">{Math.round(theme.weighted_total_score)}</div>
                    <Badge variant="outline" className="text-xs">
                      {theme.overall_confidence}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No high performers yet</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}