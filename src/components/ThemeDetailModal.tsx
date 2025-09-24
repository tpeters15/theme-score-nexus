import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ThemeWithScores, Score, Attribute } from "@/types/themes";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Save, History, Plus, X, Hash, FileText, CheckCircle, AlertTriangle } from "lucide-react";

interface ThemeDetailModalProps {
  theme: ThemeWithScores | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (themeId: string, scores: Partial<Score>[], keywords?: string[], description?: string, inScope?: string[], outOfScope?: string[]) => void;
}

export function ThemeDetailModal({ theme, isOpen, onClose, onSave }: ThemeDetailModalProps) {
  const [scores, setScores] = useState<Record<string, Partial<Score>>>({});
  const [keywords, setKeywords] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [inScope, setInScope] = useState<string[]>([]);
  const [outOfScope, setOutOfScope] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newInScope, setNewInScope] = useState("");
  const [newOutOfScope, setNewOutOfScope] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize all fields when theme changes
  useEffect(() => {
    if (theme) {
      setKeywords(theme.keywords ? [...theme.keywords] : []);
      setDescription(theme.description || "");
      setInScope(theme.in_scope ? [...theme.in_scope] : []);
      setOutOfScope(theme.out_of_scope ? [...theme.out_of_scope] : []);
    } else {
      setKeywords([]);
      setDescription("");
      setInScope([]);
      setOutOfScope([]);
    }
  }, [theme]);

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
    
    await onSave(theme.id, scoreUpdates, keywords, description, inScope, outOfScope);
    setIsSaving(false);
    setScores({});
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const addInScope = () => {
    if (newInScope.trim() && !inScope.includes(newInScope.trim())) {
      setInScope([...inScope, newInScope.trim()]);
      setNewInScope("");
    }
  };

  const removeInScope = (index: number) => {
    setInScope(inScope.filter((_, i) => i !== index));
  };

  const addOutOfScope = () => {
    if (newOutOfScope.trim() && !outOfScope.includes(newOutOfScope.trim())) {
      setOutOfScope([...outOfScope, newOutOfScope.trim()]);
      setNewOutOfScope("");
    }
  };

  const removeOutOfScope = (index: number) => {
    setOutOfScope(outOfScope.filter((_, i) => i !== index));
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleInScopeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInScope();
    }
  };

  const handleOutOfScopeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOutOfScope();
    }
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

          <Separator />

          {/* Keywords Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Research Keywords</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Add keywords for searching platforms like PitchBook, Crunchbase, etc.
            </p>
            
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={handleKeywordKeyPress}
                placeholder="Enter keyword or phrase..."
                className="flex-1"
              />
              <Button 
                onClick={addKeyword}
                size="sm"
                disabled={!newKeyword.trim() || keywords.includes(newKeyword.trim())}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {keywords.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      {keyword}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeKeyword(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {keywords.length} keyword{keywords.length !== 1 ? 's' : ''} • Click × to remove
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Description Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Description</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Provide a detailed description of this investment theme.
            </p>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter theme description..."
              rows={4}
            />
          </div>

          <Separator />

          {/* In Scope Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-foreground">In Scope</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Define what is included in this investment theme.
            </p>
            
            <div className="flex gap-2">
              <Input
                value={newInScope}
                onChange={(e) => setNewInScope(e.target.value)}
                onKeyPress={handleInScopeKeyPress}
                placeholder="Enter scope item..."
                className="flex-1"
              />
              <Button 
                onClick={addInScope}
                size="sm"
                disabled={!newInScope.trim() || inScope.includes(newInScope.trim())}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {inScope.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {inScope.map((item, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1 bg-green-100 text-green-800 border-green-200"
                    >
                      {item}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeInScope(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {inScope.length} item{inScope.length !== 1 ? 's' : ''} in scope • Click × to remove
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Out of Scope Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-foreground">Out of Scope</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Define what is excluded from this investment theme.
            </p>
            
            <div className="flex gap-2">
              <Input
                value={newOutOfScope}
                onChange={(e) => setNewOutOfScope(e.target.value)}
                onKeyPress={handleOutOfScopeKeyPress}
                placeholder="Enter exclusion item..."
                className="flex-1"
              />
              <Button 
                onClick={addOutOfScope}
                size="sm"
                disabled={!newOutOfScope.trim() || outOfScope.includes(newOutOfScope.trim())}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {outOfScope.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {outOfScope.map((item, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1 bg-red-100 text-red-800 border-red-200"
                    >
                      {item}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeOutOfScope(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {outOfScope.length} item{outOfScope.length !== 1 ? 's' : ''} out of scope • Click × to remove
                </p>
              </div>
            )}
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