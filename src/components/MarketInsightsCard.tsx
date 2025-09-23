import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Signal, ExternalLink, BarChart3, Clock } from "lucide-react";
import { format } from "date-fns";

export function SignalHighlightsCard() {
  // Recent signals based on your actual data structure
  const recentSignals = [
    {
      id: "sig_1758626263287_0",
      title: "Collision Repair Market Activity",
      description: "PitchBook alert on collision repair sector developments affecting automotive sustainability themes",
      source: "PitchBook",
      timestamp: "2 hours ago",
      category: "Market Intelligence",
      relevantThemes: ["Automotive Tech", "Circular Economy"],
      urgency: "medium" as const
    },
    {
      id: "sig_1758621873680_0",
      title: "UN Climate Plans NDCs Update",
      description: "New national climate plans signal increased policy support for renewable energy investments",
      source: "Climate Change News",
      timestamp: "4 hours ago", 
      category: "Policy & Regulation",
      relevantThemes: ["Energy Transition", "Decarbonisation"],
      urgency: "high" as const
    },
    {
      id: "sig_1758625303264_0",
      title: "Hubject EV Charging Expansion",
      description: "Significant activity in EV charging infrastructure space indicating market acceleration",
      source: "PitchBook",
      timestamp: "6 hours ago",
      category: "Investment Activity", 
      relevantThemes: ["EV Infrastructure", "Energy Transition"],
      urgency: "high" as const
    },
    {
      id: "sig_1758621873680_2",
      title: "UK Net Zero Target Policy Shifts",
      description: "Lib Dems policy changes on 2045 net zero targets affecting UK climate investment landscape",
      source: "Politico EU",
      timestamp: "8 hours ago",
      category: "Policy & Regulation",
      relevantThemes: ["Policy Risk", "UK Climate"],
      urgency: "medium" as const
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Investment Activity': return "bg-blue-50 text-blue-700 border-blue-200";
      case 'Policy & Regulation': return "bg-purple-50 text-purple-700 border-purple-200";
      case 'Market Intelligence': return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'PitchBook': return "bg-orange-100 text-orange-800";
      case 'Bloomberg': return "bg-blue-100 text-blue-800";
      case 'Reuters': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
          <div className="p-1.5 rounded-lg bg-blue-500/10">
            <Signal className="h-4 w-4 text-blue-600" />
          </div>
          Signal Highlights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentSignals.map((signal) => (
          <div
            key={signal.id}
            className="relative p-3 rounded-lg border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${getUrgencyIndicator(signal.urgency)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-medium text-sm leading-snug">{signal.title}</div>
                </div>
                <div className="text-xs text-muted-foreground mb-2 leading-relaxed">
                  {signal.description}
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-0.5 h-auto ${getCategoryColor(signal.category)}`}
                    >
                      {signal.category}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs px-2 py-0.5 h-auto ${getSourceColor(signal.source)}`}
                    >
                      {signal.source}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{signal.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <Button variant="ghost" size="sm" className="w-full text-xs mt-3 h-8" asChild>
          <a href="/signals">
            View All Signals
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}