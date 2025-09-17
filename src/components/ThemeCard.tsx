import { Badge } from "@/components/ui/badge";
import { ThemeWithScores, SCORE_THRESHOLDS, PILLAR_COLORS } from "@/types/themes";
import { TrendingUp, TrendingDown, Minus, BarChart3, Users, Clock } from "lucide-react";
import { PinContainer } from "@/components/ui/3d-pin";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface ThemeCardProps {
  theme: ThemeWithScores;
  onClick: () => void;
}

export function ThemeCard({ theme, onClick }: ThemeCardProps) {
  const navigate = useNavigate();
  const getScoreColor = (score: number) => {
    if (score >= SCORE_THRESHOLDS.HIGH) return 'text-emerald-400';
    if (score >= SCORE_THRESHOLDS.MEDIUM) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreIcon = (score: number) => {
    if (score >= SCORE_THRESHOLDS.HIGH) return <TrendingUp className="h-4 w-4" />;
    if (score >= SCORE_THRESHOLDS.MEDIUM) return <Minus className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const getPillarColor = (pillar: string) => {
    return PILLAR_COLORS[pillar as keyof typeof PILLAR_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return 'text-emerald-400';
      case 'Medium': return 'text-amber-400';
      case 'Low': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const scorePercentage = (theme.weighted_total_score / 100) * 100;

  const handleCardClick = () => {
    navigate(`/theme/${theme.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <PinContainer
      title={`Explore ${theme.name}`}
      onClick={handleCardClick}
      containerClassName="w-96 h-80"
    >
      <div className="flex flex-col p-6 tracking-tight text-foreground w-[20rem] h-[20rem] bg-gradient-to-b from-background/90 to-background/50 backdrop-blur-sm border border-border rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${scorePercentage >= 70 ? 'bg-emerald-500' : scorePercentage >= 40 ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} />
            <div className="text-xs text-muted-foreground">Live Analysis</div>
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs px-2 py-1 ${getPillarColor(theme.pillar)}`}
          >
            {theme.pillar}
          </Badge>
        </div>

        {/* Theme Name */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-foreground leading-tight mb-1">
            {theme.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {theme.sector}
          </p>
        </div>

        {/* Score Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <div className={`text-2xl font-bold ${getScoreColor(theme.weighted_total_score)} flex items-center gap-1`}>
              {getScoreIcon(theme.weighted_total_score)}
              {Math.round(theme.weighted_total_score)}
            </div>
            <div className="text-xs text-muted-foreground">Total Score</div>
          </div>
          <div className="space-y-1">
            <div className={`text-2xl font-bold ${getConfidenceColor(theme.overall_confidence)}`}>
              {theme.overall_confidence}
            </div>
            <div className="text-xs text-muted-foreground">Confidence</div>
          </div>
        </div>

        {/* Animated Score Bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-4">
          <motion.div
            className={`h-full rounded-full ${scorePercentage >= 70 ? 'bg-emerald-500' : scorePercentage >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${scorePercentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <motion.div
            className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-white/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Footer Stats */}
        <div className="flex justify-between items-center mt-auto">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              6 Attributes
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated recently
            </div>
          </div>
          <button 
            onClick={handleEditClick}
            className="text-primary text-sm font-medium hover:text-primary/80 transition-colors"
          >
            Edit Scores
          </button>
        </div>
      </div>
    </PinContainer>
  );
}