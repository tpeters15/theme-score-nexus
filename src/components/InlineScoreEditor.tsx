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
  currentScore?: number | null;
  currentConfidence?: string | null;
  currentNotes?: string;
  onScoreUpdate: () => void;
  className?: string;
}

const CONFIDENCE_OPTIONS = [
  { value: "High", label: "High", color: "bg-score-high text-score-high-foreground" },
  { value: "Medium", label: "Medium", color: "bg-score-medium text-score-medium-foreground" },
  { value: "Low", label: "Low", color: "bg-score-low text-score-low-foreground" },
];

export function InlineScoreEditor({
  themeId,
  criteriaId,
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

  const getConfidenceBadge = (conf: string) => {
    const option = CONFIDENCE_OPTIONS.find(opt => opt.value === conf);
    return option ? (
      <Badge className={option.color} variant="secondary">
        {option.label}
      </Badge>
    ) : null;
  };

  if (isEditing) {
    return (
      <div className={`space-y-3 p-3 border rounded-lg bg-card ${className}`}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Score (1-5)
            </label>
            <Input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="1-5"
              className="h-8"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Confidence
            </label>
            <Select value={confidence} onValueChange={setConfidence}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select confidence" />
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
        </div>
        
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Notes (optional)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this score..."
            className="min-h-[60px] text-sm"
            rows={2}
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
    <div className={`group flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        {currentScore ? (
          <>
            <span className={`text-lg font-bold ${getScoreColor(currentScore)}`}>
              {currentScore}/5
            </span>
            {currentConfidence && getConfidenceBadge(currentConfidence)}
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Not scored</span>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
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
  );
}