import { useState, useEffect } from "react";
import { Check, X, Edit, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useFramework } from "@/hooks/useFramework";

interface InlineScoreEditorProps {
  themeId: string;
  criteriaId: string;
  criteria?: any; // Full criteria object with scoring rubric
  currentScore?: number | null;
  currentConfidence?: string | null;
  currentNotes?: string;
  onScoreUpdate: () => void;
  className?: string;
}

const CONFIDENCE_OPTIONS = [
  { 
    value: "High", 
    label: "High Confidence", 
    color: "bg-score-high text-score-high-foreground",
    description: "Based on strong evidence, multiple reliable sources, or clear market data"
  },
  { 
    value: "Medium", 
    label: "Medium Confidence", 
    color: "bg-score-medium text-score-medium-foreground",
    description: "Based on moderate evidence, some assumptions, or limited data points"
  },
  { 
    value: "Low", 
    label: "Low Confidence", 
    color: "bg-score-low text-score-low-foreground",
    description: "Based on limited evidence, significant assumptions, or requires more research"
  },
];

export function InlineScoreEditor({
  themeId,
  criteriaId,
  criteria,
  currentScore,
  currentConfidence,
  currentNotes,
  onScoreUpdate,
  className = ""
}: InlineScoreEditorProps) {
  const { toast } = useToast();
  const { updateDetailedScore } = useFramework();
  const [isEditing, setIsEditing] = useState(false);
  const [score, setScore] = useState<string>(currentScore?.toString() || "");
  const [confidence, setConfidence] = useState<string>(currentConfidence || "");
  const [notes, setNotes] = useState<string>(currentNotes || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setScore(currentScore?.toString() || "");
    setConfidence(currentConfidence || "");
    setNotes(currentNotes || "");
  }, [currentScore, currentConfidence, currentNotes]);

  const handleSave = async () => {
    const scoreNum = parseFloat(score);
    
    if (score && (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 5)) {
      toast({
        title: "Invalid score",
        description: "Score must be between 1 and 5",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await updateDetailedScore(themeId, criteriaId, {
        score: score ? scoreNum : null,
        confidence: confidence || null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
        update_source: 'manual'
      });

      toast({
        title: "Score updated",
        description: "The score has been saved successfully",
      });

      setIsEditing(false);
      onScoreUpdate();
    } catch (error) {
      console.error("Error updating score:", error);
      toast({
        title: "Update failed",
        description: "Could not save the score. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setScore(currentScore?.toString() || "");
    setConfidence(currentConfidence || "");
    setNotes(currentNotes || "");
    setIsEditing(false);
  };

  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 4) return "text-score-high";
    if (scoreValue >= 3) return "text-score-medium";
    return "text-score-low";
  };

  const parseScoringRubric = (rubric: any) => {
    try {
      if (typeof rubric === 'string') {
        return JSON.parse(rubric);
      }
      if (typeof rubric === 'object' && rubric !== null && !Array.isArray(rubric)) {
        return rubric;
      }
      return null;
    } catch {
      return null;
    }
  };

  const scoringRubric = criteria?.scoring_rubric ? parseScoringRubric(criteria.scoring_rubric) : null;
  
  const getScoreOptions = () => {
    if (!scoringRubric) {
      return [
        { value: "1", label: "1 - Poor", description: "Below expectations" },
        { value: "3", label: "3 - Average", description: "Meets expectations" },
        { value: "5", label: "5 - Excellent", description: "Exceeds expectations" }
      ];
    }
    
    return [
      { 
        value: "1", 
        label: `1 - ${scoringRubric[1]?.label || 'Poor'}`, 
        description: scoringRubric[1]?.description || "Below expectations"
      },
      { 
        value: "3", 
        label: `3 - ${scoringRubric[3]?.label || 'Average'}`, 
        description: scoringRubric[3]?.description || "Meets expectations"
      },
      { 
        value: "5", 
        label: `5 - ${scoringRubric[5]?.label || 'Excellent'}`, 
        description: scoringRubric[5]?.description || "Exceeds expectations"
      }
    ];
  };

  const getConfidenceBadge = (conf: string) => {
    const option = CONFIDENCE_OPTIONS.find(opt => opt.value === conf);
    return option ? (
      <Badge className={option.color} variant="secondary">
        {option.label}
      </Badge>
    ) : null;
  };

  if (isEditing) {
    const scoreOptions = getScoreOptions();
    
    return (
      <div className={`space-y-4 p-4 border rounded-lg bg-card ${className}`}>
        <div className="grid grid-cols-1 gap-4">
          {/* Score Selection with Enhanced Dropdown */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Score (1-5)
            </label>
            <Select value={score} onValueChange={setScore}>
              <SelectTrigger className="h-auto min-h-[40px] bg-background">
                <SelectValue placeholder="Select a score" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {scoreOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="cursor-pointer hover:bg-accent focus:bg-accent"
                  >
                    <div className="py-2">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground mt-1 max-w-[300px]">
                        {option.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Confidence Selection with Enhanced Dropdown */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Confidence Level
            </label>
            <Select value={confidence} onValueChange={setConfidence}>
              <SelectTrigger className="h-auto min-h-[40px] bg-background">
                <SelectValue placeholder="Select confidence level" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {CONFIDENCE_OPTIONS.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="cursor-pointer hover:bg-accent focus:bg-accent"
                  >
                    <div className="py-2">
                      <div className="font-medium flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${option.color.includes('high') ? 'bg-green-500' : option.color.includes('medium') ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                        {option.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 max-w-[300px]">
                        {option.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Rationale & Evidence
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Provide detailed rationale for this score, including specific evidence, data sources, market research, or analysis that supports your assessment..."
            className="min-h-[100px] text-sm bg-background"
            rows={4}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Check className="h-3 w-3 mr-1" />
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          {currentScore ? (
            <>
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold ${getScoreColor(currentScore)}`}>
                  {currentScore}/5
                </span>
                {currentConfidence && getConfidenceBadge(currentConfidence)}
              </div>
              
              {/* Show scoring rubric description for current score */}
              {scoringRubric && scoringRubric[currentScore as keyof typeof scoringRubric] && (
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <div className="text-sm font-medium text-foreground">
                    {currentScore} - {scoringRubric[currentScore as keyof typeof scoringRubric]?.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {scoringRubric[currentScore as keyof typeof scoringRubric]?.description}
                  </div>
                </div>
              )}
              
              {/* Show rationale/notes if they exist */}
              {currentNotes && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs font-medium text-blue-800 mb-1">Rationale & Evidence:</div>
                  <div className="text-xs text-blue-700 whitespace-pre-wrap">{currentNotes}</div>
                </div>
              )}
            </>
          ) : (
            <div className="p-3 bg-muted/30 rounded-lg border border-dashed">
              <span className="text-sm text-muted-foreground">Not scored</span>
              <div className="text-xs text-muted-foreground mt-1">Click to add score and rationale</div>
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        >
          {currentScore ? (
            <Edit className="h-4 w-4" />
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-1" />
              Score
            </>
          )}
        </Button>
      </div>
    </div>
  );
}