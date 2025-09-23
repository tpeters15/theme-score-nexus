import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, ExternalLink, BarChart3 } from "lucide-react";

export function MarketInsightsCard() {
  const insights = [
    {
      id: "1",
      title: "Renewable Energy Outlook",
      description: "IEA report suggests accelerated growth in renewable capacity through 2024",
      impact: "+3 themes",
      impactType: "positive" as const,
      urgency: "high" as const
    },
    {
      id: "2",
      title: "Carbon Credit Pricing",
      description: "EU ETS prices hitting record highs, affecting investment attractiveness",
      impact: "+5 themes",
      impactType: "positive" as const,
      urgency: "medium" as const
    },
    {
      id: "3",
      title: "Supply Chain Resilience",
      description: "Critical minerals availability affecting clean energy deployment",
      impact: "+2 themes",
      impactType: "neutral" as const,
      urgency: "low" as const
    }
  ];

  const getImpactColor = (type: string) => {
    switch (type) {
      case 'positive': return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case 'negative': return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getUrgencyIndicator = (urgency: string) => {
    switch (urgency) {
      case 'high': return "bg-red-500";
      case 'medium': return "bg-amber-500";
      default: return "bg-green-500";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-lg bg-emerald-500/10">
            <BarChart3 className="h-4 w-4 text-emerald-600" />
          </div>
          Market Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="relative p-3 rounded-lg border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${getUrgencyIndicator(insight.urgency)}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm mb-1 leading-snug">{insight.title}</div>
                <div className="text-xs text-muted-foreground mb-2 leading-relaxed">
                  {insight.description}
                </div>
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-0.5 h-auto ${getImpactColor(insight.impactType)}`}
                  >
                    Impact: {insight.impact}
                  </Badge>
                  <TrendingUp className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <Button variant="ghost" size="sm" className="w-full text-xs mt-3 h-8">
          View All Insights
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}