import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ThemeWithScores, Score, Attribute } from "@/types/themes";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Save, History } from "lucide-react";

interface ThemeDetailModalProps {
  theme: ThemeWithScores | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (themeId: string, scores: Partial<Score>[]) => void;
}

export function ThemeDetailModal({ theme, isOpen, onClose, onSave }: ThemeDetailModalProps) {
  const [scores, setScores] = useState<Record<string, Partial<Score>>>({});
  const [isSaving, setIsSaving] = useState(false);

  if (!theme) return null;

  const handleScoreChange = (attributeId: string, field: keyof Score, value: any) => {
    setScores(prev => ({
      ...prev,
      [attributeId]: {
        ...prev[attributeId],
        [field]: value,
        attribute_id: attributeId,
        theme_id: theme.id,
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const scoreUpdates = Object.values(scores).filter(score => 
      score.score !== undefined || score.confidence || score.notes
    );
    
    await onSave(theme.id, scoreUpdates);
    setIsSaving(false);
    setScores({});
  };

  const getScoreValue = (attributeId: string, field: keyof Score) => {
    if (scores[attributeId]?.[field] !== undefined) {
      return scores[attributeId][field];
    }
    const existingScore = theme.scores.find(s => s.attribute_id === attributeId);
    return existingScore?.[field] || '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {theme.name}
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {theme.pillar}
            </Badge>
            <span>•</span>
            <span>{theme.sector}</span>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <h3 className="text-lg font-semibold text-foreground">Scoring Attributes</h3>
            
            {theme.scores.map((scoreData) => (
              <div key={scoreData.attribute_id} className="border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{scoreData.attribute.name}</h4>
                    <p className="text-sm text-muted-foreground">{scoreData.attribute.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Weight: {scoreData.attribute.weight}%
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`score-${scoreData.attribute_id}`}>Score (0-100)</Label>
                    <Input
                      id={`score-${scoreData.attribute_id}`}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={getScoreValue(scoreData.attribute_id, 'score')}
                      onChange={(e) => handleScoreChange(scoreData.attribute_id, 'score', parseFloat(e.target.value))}
                      placeholder="Enter score"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`confidence-${scoreData.attribute_id}`}>Confidence</Label>
                    <Select
                      value={getScoreValue(scoreData.attribute_id, 'confidence') as string}
                      onValueChange={(value) => handleScoreChange(scoreData.attribute_id, 'confidence', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select confidence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Current Score</Label>
                    <div className="h-10 flex items-center px-3 bg-muted rounded-md text-sm">
                      {scoreData.score ? scoreData.score.toFixed(1) : 'Not set'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`notes-${scoreData.attribute_id}`}>Research Notes</Label>
                  <Textarea
                    id={`notes-${scoreData.attribute_id}`}
                    value={getScoreValue(scoreData.attribute_id, 'notes') as string}
                    onChange={(e) => handleScoreChange(scoreData.attribute_id, 'notes', e.target.value)}
                    placeholder="Add research notes, rationale, or supporting evidence..."
                    rows={3}
                  />
                </div>

                {scoreData.updated_at && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last updated: {new Date(scoreData.updated_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      By: {scoreData.updated_by || 'System'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Weighted Total Score</h3>
              <div className="text-2xl font-bold text-primary">
                {theme.weighted_total_score.toFixed(1)}
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="w-full">
              <History className="h-4 w-4 mr-2" />
              View Score History
            </Button>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}