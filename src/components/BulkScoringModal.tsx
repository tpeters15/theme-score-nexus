import { useState, useEffect } from "react";
import { TrendingUp, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useFramework } from "@/hooks/useFramework";
import { ThemeWithDetailedScores, FrameworkCriteria } from "@/types/framework";

interface BulkScoringModalProps {
  theme: ThemeWithDetailedScores;
  isOpen: boolean;
  onClose: () => void;
  onScoringComplete: () => void;
}

interface CriteriaScore {
  criteriaId: string;
  score: string;
  confidence: string;
  notes: string;
}

const CONFIDENCE_OPTIONS = [
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

export function BulkScoringModal({ theme, isOpen, onClose, onScoringComplete }: BulkScoringModalProps) {
  const { toast } = useToast();
  const { updateDetailedScore } = useFramework();
  const [scores, setScores] = useState<Record<string, CriteriaScore>>({});
  const [saving, setSaving] = useState(false);
  const [globalConfidence, setGlobalConfidence] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Initialize scores from existing data
  useEffect(() => {
    if (!theme) return;

    const initialScores: Record<string, CriteriaScore> = {};
    
    theme.categories.forEach(category => {
      category.criteria.forEach(criteria => {
        const existingScore = theme.detailed_scores.find(s => s.criteria_id === criteria.id);
        initialScores[criteria.id] = {
          criteriaId: criteria.id,
          score: existingScore?.score?.toString() || "",
          confidence: existingScore?.confidence || "",
          notes: existingScore?.notes || "",
        };
      });
    });

    setScores(initialScores);
  }, [theme]);

  const updateScore = (criteriaId: string, field: keyof CriteriaScore, value: string) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        [field]: value,
      }
    }));
  };

  const applyGlobalConfidence = () => {
    if (!globalConfidence) return;
    
    setScores(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(criteriaId => {
        if (updated[criteriaId].score) { // Only apply to scored criteria
          updated[criteriaId].confidence = globalConfidence;
        }
      });
      return updated;
    });

    toast({
      title: "Confidence applied",
      description: `Applied ${globalConfidence} confidence to all scored criteria`,
    });
  };

  const handleSaveAll = async () => {
    const scoresToSave = Object.values(scores).filter(score => 
      score.score && !isNaN(parseFloat(score.score))
    );

    if (scoresToSave.length === 0) {
      toast({
        title: "No scores to save",
        description: "Please enter at least one score",
        variant: "destructive",
      });
      return;
    }

    // Validate scores
    const invalidScores = scoresToSave.filter(score => {
      const scoreNum = parseFloat(score.score);
      return scoreNum < 1 || scoreNum > 5;
    });

    if (invalidScores.length > 0) {
      toast({
        title: "Invalid scores",
        description: "All scores must be between 1 and 5",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    let savedCount = 0;

    try {
      for (const scoreData of scoresToSave) {
        await updateDetailedScore(theme.id, scoreData.criteriaId, {
          score: parseFloat(scoreData.score),
          confidence: scoreData.confidence || null,
          notes: scoreData.notes || null,
          updated_at: new Date().toISOString(),
          update_source: 'bulk_manual'
        });
        savedCount++;
      }

      toast({
        title: "Bulk scoring complete",
        description: `Successfully saved ${savedCount} scores`,
      });

      onScoringComplete();
      onClose();
    } catch (error) {
      console.error("Error saving bulk scores:", error);
      toast({
        title: "Save failed",
        description: `Saved ${savedCount} of ${scoresToSave.length} scores. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getFilteredCriteria = () => {
    if (selectedCategory === "all") {
      return theme.categories.flatMap(cat => 
        cat.criteria.map(criteria => ({ ...criteria, categoryName: cat.name }))
      );
    }
    
    const category = theme.categories.find(cat => cat.id === selectedCategory);
    return category ? category.criteria.map(criteria => ({ ...criteria, categoryName: category.name })) : [];
  };

  const getScoringProgress = () => {
    const totalCriteria = theme.categories.reduce((sum, cat) => sum + cat.criteria.length, 0);
    const scoredCriteria = Object.values(scores).filter(score => score.score).length;
    return { scored: scoredCriteria, total: totalCriteria, percentage: (scoredCriteria / totalCriteria) * 100 };
  };

  const progress = getScoringProgress();
  const filteredCriteria = getFilteredCriteria();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Bulk Scoring - {theme.name}
          </DialogTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Scoring Progress</span>
              <span>{progress.scored} of {progress.total} criteria</span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Controls */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Category:</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {theme.categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Global Confidence:</label>
              <Select value={globalConfidence} onValueChange={setGlobalConfidence}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {CONFIDENCE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={applyGlobalConfidence}
                disabled={!globalConfidence}
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Criteria Scoring */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {filteredCriteria.map((criteria) => {
              const score = scores[criteria.id];
              return (
                <div key={criteria.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {criteria.code}
                        </Badge>
                        <span className="font-medium">{criteria.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {criteria.description}
                      </p>
                      {selectedCategory === "all" && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {criteria.categoryName}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Score (1-5)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={score?.score || ""}
                        onChange={(e) => updateScore(criteria.id, "score", e.target.value)}
                        placeholder="1-5"
                        className="h-8"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Confidence
                      </label>
                      <Select 
                        value={score?.confidence || ""} 
                        onValueChange={(value) => updateScore(criteria.id, "confidence", value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {CONFIDENCE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Notes
                      </label>
                      <Input
                        value={score?.notes || ""}
                        onChange={(e) => updateScore(criteria.id, "notes", e.target.value)}
                        placeholder="Optional notes..."
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-4 border-t bg-background">
            <div className="text-sm text-muted-foreground">
              {progress.scored} of {progress.total} criteria scored
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSaveAll} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? "Saving..." : `Save ${progress.scored} Scores`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}