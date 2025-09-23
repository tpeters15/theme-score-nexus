import { TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeWithDetailedScores } from "@/types/framework";

interface ScoreProgressIndicatorProps {
  theme: ThemeWithDetailedScores;
  className?: string;
}

export function ScoreProgressIndicator({ theme, className = "" }: ScoreProgressIndicatorProps) {
  const calculateCategoryProgress = (categoryId: string) => {
    const category = theme.categories.find(cat => cat.id === categoryId);
    if (!category) return { completed: 0, total: 0, percentage: 0 };

    const criteriaIds = category.criteria.map(c => c.id);
    const scored = theme.detailed_scores.filter(score => 
      criteriaIds.includes(score.criteria_id) && score.score !== null
    ).length;
    
    return {
      completed: scored,
      total: category.criteria.length,
      percentage: category.criteria.length > 0 ? (scored / category.criteria.length) * 100 : 0
    };
  };

  const getOverallProgress = () => {
    // Only count categories A, B, C for scoring progress
    const scoringCategories = theme.categories.filter(cat => ['A', 'B', 'C'].includes(cat.code));
    const totalCriteria = scoringCategories.reduce((sum, cat) => sum + cat.criteria.length, 0);
    
    const scoringCriteriaIds = new Set(
      scoringCategories.flatMap(cat => cat.criteria.map(c => c.id))
    );
    
    const scoredCriteria = theme.detailed_scores.filter(score => 
      score.score !== null && scoringCriteriaIds.has(score.criteria_id)
    ).length;
    
    return {
      completed: scoredCriteria,
      total: totalCriteria,
      percentage: totalCriteria > 0 ? (scoredCriteria / totalCriteria) * 100 : 0
    };
  };

  const getConfidenceDistribution = () => {
    // Only count scored items from scoring categories (A, B, C)
    const scoringCategories = theme.categories.filter(cat => ['A', 'B', 'C'].includes(cat.code));
    const scoringCriteriaIds = new Set(
      scoringCategories.flatMap(cat => cat.criteria.map(c => c.id))
    );
    
    const scoredItems = theme.detailed_scores.filter(score => 
      score.score !== null && scoringCriteriaIds.has(score.criteria_id)
    );
    
    const distribution = { High: 0, Medium: 0, Low: 0, Unknown: 0 };
    
    scoredItems.forEach(score => {
      if (score.confidence && distribution.hasOwnProperty(score.confidence)) {
        distribution[score.confidence as keyof typeof distribution]++;
      } else {
        distribution.Unknown++;
      }
    });
    
    return distribution;
  };

  const getScoreDistribution = () => {
    // Only count scored items from scoring categories (A, B, C)
    const scoringCategories = theme.categories.filter(cat => ['A', 'B', 'C'].includes(cat.code));
    const scoringCriteriaIds = new Set(
      scoringCategories.flatMap(cat => cat.criteria.map(c => c.id))
    );
    
    const scoredItems = theme.detailed_scores.filter(score => 
      score.score !== null && scoringCriteriaIds.has(score.criteria_id)
    );
    
    const distribution = { high: 0, medium: 0, low: 0 };
    
    scoredItems.forEach(score => {
      if (score.score) {
        if (score.score >= 4) distribution.high++;
        else if (score.score >= 3) distribution.medium++;
        else distribution.low++;
      }
    });
    
    return distribution;
  };

  const overall = getOverallProgress();
  const confidence = getConfidenceDistribution();
  const scoreDistribution = getScoreDistribution();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Scoring Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Completion</span>
              <span className="font-medium">
                {overall.completed} of {overall.total} criteria
              </span>
            </div>
            <Progress value={overall.percentage} className="h-3" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{overall.percentage.toFixed(1)}% complete</span>
              {overall.percentage === 100 ? (
                <div className="flex items-center gap-1 text-score-high">
                  <CheckCircle className="h-3 w-3" />
                  Complete
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {overall.total - overall.completed} remaining
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">By Category</h4>
            {theme.categories.map(category => {
              const progress = calculateCategoryProgress(category.id);
              return (
                <div key={category.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{category.code}</Badge>
                      <span>{category.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {progress.completed}/{progress.total}
                    </span>
                  </div>
                  <Progress value={progress.percentage} className="h-1.5" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Score Quality Indicators */}
      {overall.completed > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Confidence Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Confidence Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(confidence).map(([level, count]) => {
                if (count === 0) return null;
                const percentage = overall.completed > 0 ? (count / overall.completed) * 100 : 0;
                const colorClass = level === 'High' ? 'bg-score-high' : 
                                 level === 'Medium' ? 'bg-score-medium' : 
                                 level === 'Low' ? 'bg-score-low' : 'bg-muted';
                
                return (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                      <span className="text-sm">{level}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count}</span>
                      <span className="text-xs text-muted-foreground">
                        ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Score Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Score Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-score-high" />
                  <span className="text-sm">High (4-5)</span>
                </div>
                <span className="text-sm font-medium">{scoreDistribution.high}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-score-medium" />
                  <span className="text-sm">Medium (3-4)</span>
                </div>
                <span className="text-sm font-medium">{scoreDistribution.medium}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-score-low" />
                  <span className="text-sm">Low (1-3)</span>
                </div>
                <span className="text-sm font-medium">{scoreDistribution.low}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}