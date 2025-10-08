import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link, Save, X } from "lucide-react";
import { toast } from "sonner";
import type { Regulation } from "@/types/regulatory";

interface Theme {
  id: string;
  name: string;
  pillar: string;
  sector: string;
}

interface ThemeLink {
  theme_id: string;
  relevance_score: number;
  impact_description: string;
  criteria_impacts: string[];
}

interface RegulationThemeLinkModalProps {
  regulation: Regulation;
  isOpen: boolean;
  onClose: () => void;
  onLinksUpdated: () => void;
}

export function RegulationThemeLinkModal({ 
  regulation, 
  isOpen, 
  onClose, 
  onLinksUpdated 
}: RegulationThemeLinkModalProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [existingLinks, setExistingLinks] = useState<ThemeLink[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [relevanceScores, setRelevanceScores] = useState<Record<string, number>>({});
  const [impactDescriptions, setImpactDescriptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchThemes();
      fetchExistingLinks();
    }
  }, [isOpen, regulation.id]);

  const fetchThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('taxonomy_themes')
        .select(`
          id,
          name,
          sector:taxonomy_sectors!inner(
            name,
            pillar:taxonomy_pillars!inner(name)
          )
        `)
        .order('name');

      if (error) throw error;
      
      const transformedThemes = (data || []).map(t => ({
        id: t.id,
        name: t.name,
        pillar: t.sector.pillar.name,
        sector: t.sector.name,
      }));
      
      setThemes(transformedThemes);
    } catch (error) {
      console.error('Error fetching themes:', error);
      toast.error('Failed to load themes');
    }
  };

  const fetchExistingLinks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('theme_regulations')
        .select('theme_id, relevance_score, impact_description, criteria_impacts')
        .eq('regulation_id', regulation.id);

      if (error) throw error;
      
      const links = data || [];
      setExistingLinks(links);
      setSelectedThemes(links.map(link => link.theme_id));
      
      const scores: Record<string, number> = {};
      const descriptions: Record<string, string> = {};
      
      links.forEach(link => {
        scores[link.theme_id] = link.relevance_score;
        descriptions[link.theme_id] = link.impact_description || '';
      });
      
      setRelevanceScores(scores);
      setImpactDescriptions(descriptions);
    } catch (error) {
      console.error('Error fetching existing links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeToggle = (themeId: string, checked: boolean) => {
    if (checked) {
      setSelectedThemes(prev => [...prev, themeId]);
      // Set default values for new selections
      if (!relevanceScores[themeId]) {
        setRelevanceScores(prev => ({ ...prev, [themeId]: 3 }));
      }
      if (!impactDescriptions[themeId]) {
        setImpactDescriptions(prev => ({ ...prev, [themeId]: '' }));
      }
    } else {
      setSelectedThemes(prev => prev.filter(id => id !== themeId));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Delete existing links
      await supabase
        .from('theme_regulations')
        .delete()
        .eq('regulation_id', regulation.id);

      // Insert new links
      if (selectedThemes.length > 0) {
        const linksToInsert = selectedThemes.map(themeId => ({
          theme_id: themeId,
          regulation_id: regulation.id,
          relevance_score: relevanceScores[themeId] || 3,
          impact_description: impactDescriptions[themeId] || '',
          criteria_impacts: ['regulatory_compliance', 'market_opportunity']
        }));

        const { error } = await supabase
          .from('theme_regulations')
          .insert(linksToInsert);

        if (error) throw error;
      }

      toast.success('Theme links updated successfully');
      onLinksUpdated();
      onClose();
    } catch (error) {
      console.error('Error saving theme links:', error);
      toast.error('Failed to update theme links');
    } finally {
      setSaving(false);
    }
  };

  const getThemeName = (themeId: string) => {
    return themes.find(t => t.id === themeId)?.name || 'Unknown Theme';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Link to Investment Themes
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            {regulation.title}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themes.map(theme => {
                const isSelected = selectedThemes.includes(theme.id);
                return (
                  <Card key={theme.id} className={isSelected ? "border-primary" : ""}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={theme.id}
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleThemeToggle(theme.id, checked as boolean)
                            }
                          />
                          <Label htmlFor={theme.id} className="font-medium cursor-pointer">
                            {theme.name}
                          </Label>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {theme.pillar}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {theme.sector}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {isSelected && (
                      <CardContent className="pt-0 space-y-3">
                        <div>
                          <Label className="text-xs font-medium">Relevance Score</Label>
                          <Select
                            value={relevanceScores[theme.id]?.toString() || "3"}
                            onValueChange={(value) => 
                              setRelevanceScores(prev => ({ 
                                ...prev, 
                                [theme.id]: parseInt(value) 
                              }))
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 - Low relevance</SelectItem>
                              <SelectItem value="2">2 - Minor relevance</SelectItem>
                              <SelectItem value="3">3 - Moderate relevance</SelectItem>
                              <SelectItem value="4">4 - High relevance</SelectItem>
                              <SelectItem value="5">5 - Critical relevance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-xs font-medium">Impact Description</Label>
                          <Textarea
                            placeholder="Describe how this regulation impacts this investment theme..."
                            value={impactDescriptions[theme.id] || ''}
                            onChange={(e) => 
                              setImpactDescriptions(prev => ({ 
                                ...prev, 
                                [theme.id]: e.target.value 
                              }))
                            }
                            className="h-20 text-xs"
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Links'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}