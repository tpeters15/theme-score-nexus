import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ThemeWithScores, SCORE_THRESHOLDS } from "@/types/themes";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ThemeCardProps {
  theme: ThemeWithScores;
  onClick: () => void;
}

export function ThemeCard({ theme, onClick }: ThemeCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= SCORE_THRESHOLDS.HIGH) return 'bg-score-high text-score-high-foreground';
    if (score >= SCORE_THRESHOLDS.MEDIUM) return 'bg-score-medium text-score-medium-foreground';
    return 'bg-score-low text-score-low-foreground';
  };

  const getScoreIcon = (score: number) => {
    if (score >= SCORE_THRESHOLDS.HIGH) return <TrendingUp className="h-3 w-3" />;
    if (score >= SCORE_THRESHOLDS.MEDIUM) return <Minus className="h-3 w-3" />;
    return <TrendingDown className="h-3 w-3" />;
  };

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'FinTech Revolution': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Sustainable Future': return 'bg-green-100 text-green-800 border-green-200';
      case 'Digital Transformation': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card 
      className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border border-border hover:border-primary/20 bg-card"
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-sm text-card-foreground line-clamp-2 leading-tight">
            {theme.name}
          </h3>
          <div className={`rounded-full px-2 py-1 flex items-center gap-1 text-xs font-medium ${getScoreColor(theme.weighted_total_score)}`}>
            {getScoreIcon(theme.weighted_total_score)}
            {Math.round(theme.weighted_total_score)}
          </div>
        </div>
        
        <Badge 
          variant="outline" 
          className={`text-xs px-2 py-1 ${getPillarColor(theme.pillar)}`}
        >
          {theme.pillar}
        </Badge>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{theme.sector}</span>
          <span className="font-medium">
            Confidence: {theme.overall_confidence}
          </span>
        </div>
      </div>
    </Card>
  );
}