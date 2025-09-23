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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentActivityCardProps {
  themes: ThemeWithScores[];
}

export function RecentActivityCard({ themes }: RecentActivityCardProps) {
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
      color: "text-emerald-600"
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
    },
    {
      id: "4",
      type: "research_complete",
      title: "Solar PV research completed",
      description: "Market analysis shows strong growth signals",
      timestamp: "1 day ago",
      theme: themes.find(t => t.name.includes("Solar")) || themes[2],
      icon: FileText,
      color: "text-emerald-600"
    }
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-lg bg-blue-500/10">
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentActivity.map((activity) => (
          <div key={activity.id} className="group">
            <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-all duration-200">
              <div className={cn("p-1.5 rounded-full bg-background shadow-sm", activity.color)}>
                <activity.icon className="h-3 w-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm leading-snug">{activity.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{activity.description}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                  </div>
                  {activity.theme && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                        {activity.theme.name}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <Button variant="ghost" size="sm" className="w-full text-xs mt-3 h-8">
          View All Activity
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}