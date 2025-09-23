import { TrendingUp, Star, Activity, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { ThemeWithScores } from "@/types/themes";

interface TopThemesOverviewProps {
  themes: ThemeWithScores[];
}

export function TopThemesOverview({ themes }: TopThemesOverviewProps) {
  const navigate = useNavigate();
  
  // Get top 5 themes by weighted total score
  const topThemes = themes
    .filter(theme => theme.weighted_total_score > 0)
    .sort((a, b) => b.weighted_total_score - a.weighted_total_score)
    .slice(0, 5);

  const handleThemeClick = (themeId: string) => {
    navigate(`/theme/${themeId}`);
  };

  const handleViewAllThemes = () => {
    navigate('/themes');
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return "bg-green-100 text-green-800 border-green-200";
      case 'Medium': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'Low': return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'Decarbonisation': return "bg-green-100 text-green-800 border-green-200";
      case 'Energy Transition': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'Resource Sustainability': return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (topThemes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            High Priority Themes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No scored themes available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            High Priority Themes
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleViewAllThemes}>
            View All Themes
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {topThemes.map((theme, index) => (
          <div
            key={theme.id}
            onClick={() => handleThemeClick(theme.id)}
            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                    {theme.name}
                  </h4>
                  <Badge variant="outline" className={cn("text-xs", getPillarColor(theme.pillar))}>
                    {theme.pillar}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{theme.sector}</p>
                
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Score:</span>
                    <span className={cn("font-semibold text-sm", getScoreColor(theme.weighted_total_score))}>
                      {Math.round(theme.weighted_total_score)}%
                    </span>
                  </div>
                  
                  <Badge variant="outline" className={cn("text-xs", getConfidenceColor(theme.overall_confidence))}>
                    {theme.overall_confidence} Confidence
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-24">
                <Progress 
                  value={theme.weighted_total_score} 
                  className="h-2"
                />
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        ))}
        
        {topThemes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No themes with scores available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}