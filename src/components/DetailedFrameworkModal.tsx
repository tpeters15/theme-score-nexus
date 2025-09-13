import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { useFramework } from '@/hooks/useFramework';
import { ThemeWithDetailedScores, DetailedScore, Json, ScoringRubric } from '@/types/framework';
import { Theme } from '@/types/themes';
import { Play, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DetailedFrameworkModalProps {
  theme: Theme | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DetailedFrameworkModal: React.FC<DetailedFrameworkModalProps> = ({
  theme,
  isOpen,
  onClose,
}) => {
  const [detailedTheme, setDetailedTheme] = useState<ThemeWithDetailedScores | null>(null);
  const [loading, setLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedCriteriaForResearch, setSelectedCriteriaForResearch] = useState<string[]>([]);
  const [localScores, setLocalScores] = useState<{ [criteriaId: string]: Partial<DetailedScore> }>({});
  
  const { fetchThemeWithDetailedScores, updateDetailedScore, startN8nResearch, userRole } = useFramework();
  const { toast } = useToast();

  useEffect(() => {
    if (theme && isOpen) {
      loadDetailedTheme();
    }
  }, [theme, isOpen]);

  const loadDetailedTheme = async () => {
    if (!theme) return;
    
    setLoading(true);
    try {
      const detailed = await fetchThemeWithDetailedScores(theme.id);
      setDetailedTheme(detailed);
      
      // Initialize local scores
      const scores: { [criteriaId: string]: Partial<DetailedScore> } = {};
      detailed?.detailed_scores.forEach(score => {
        scores[score.criteria_id] = score;
      });
      setLocalScores(scores);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load detailed theme data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScoreUpdate = async (criteriaId: string, updates: Partial<DetailedScore>) => {
    if (!theme) return;
    
    try {
      await updateDetailedScore(theme.id, criteriaId, updates);
      
      // Update local state
      setLocalScores(prev => ({
        ...prev,
        [criteriaId]: { ...prev[criteriaId], ...updates }
      }));
      
      toast({
        title: "Success",
        description: "Score updated successfully",
      });
      
      // Reload detailed theme to get updated overall score
      await loadDetailedTheme();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update score",
        variant: "destructive",
      });
    }
  };

  const handleStartResearch = async () => {
    if (!theme || !webhookUrl || selectedCriteriaForResearch.length === 0) {
      toast({
        title: "Error",
        description: "Please provide webhook URL and select criteria",
        variant: "destructive",
      });
      return;
    }

    try {
      await startN8nResearch(theme.id, selectedCriteriaForResearch, webhookUrl);
      
      toast({
        title: "Success",
        description: "Research started successfully",
      });
      
      setWebhookUrl('');
      setSelectedCriteriaForResearch([]);
      await loadDetailedTheme();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start research",
        variant: "destructive",
      });
    }
  };

  const parseScoringRubric = (rubric: Json): ScoringRubric | null => {
    try {
      if (typeof rubric === 'string') {
        return JSON.parse(rubric) as ScoringRubric;
      }
      if (typeof rubric === 'object' && rubric !== null && !Array.isArray(rubric)) {
        return rubric as unknown as ScoringRubric;
      }
      return null;
    } catch {
      return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!detailedTheme) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Loading Framework Data...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{detailedTheme.name} - Detailed Framework</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Score: {detailedTheme.overall_score}/100</Badge>
              <Badge variant={detailedTheme.overall_confidence === 'High' ? 'default' : 
                            detailedTheme.overall_confidence === 'Medium' ? 'secondary' : 'destructive'}>
                {detailedTheme.overall_confidence} Confidence
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="framework" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="framework">Framework Scoring</TabsTrigger>
            <TabsTrigger value="research">Research Management</TabsTrigger>
            <TabsTrigger value="documents">Research Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="framework" className="space-y-4">
            <ScrollArea className="h-[600px] pr-4">
              {detailedTheme.categories.map((category) => (
                <Card key={category.id} className="mb-4">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{category.code}: {category.name}</span>
                      <Badge variant="outline">{category.weight}% weight</Badge>
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {category.criteria.map((criteria) => {
                      const score = localScores[criteria.id];
                      const rubric = parseScoringRubric(criteria.scoring_rubric);
                      
                      return (
                        <div key={criteria.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{criteria.code}: {criteria.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{criteria.objective}</p>
                            </div>
                            <Badge variant="outline">{criteria.weight}%</Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div>
                              <Label htmlFor={`score-${criteria.id}`}>Score</Label>
                              <Select
                                value={score?.score?.toString() || ''}
                                onValueChange={(value) => {
                                  const numValue = value ? parseInt(value) : null;
                                  handleScoreUpdate(criteria.id, { score: numValue });
                                }}
                                disabled={userRole !== 'admin' && userRole !== 'analyst'}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select score" />
                                </SelectTrigger>
                                <SelectContent>
                                  {rubric && Object.entries(rubric).map(([scoreValue, rubricData]) => (
                                    <SelectItem key={scoreValue} value={scoreValue}>
                                      {scoreValue} - {rubricData.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor={`confidence-${criteria.id}`}>Confidence</Label>
                              <Select
                                value={score?.confidence || ''}
                                onValueChange={(value) => {
                                  handleScoreUpdate(criteria.id, { confidence: value });
                                }}
                                disabled={userRole !== 'admin' && userRole !== 'analyst'}
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

                            <div className="md:col-span-2 lg:col-span-1">
                              <Label>Source</Label>
                              <Badge variant="outline" className="ml-2">
                                {score?.update_source || 'Manual'}
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`notes-${criteria.id}`}>Notes</Label>
                            <Textarea
                              id={`notes-${criteria.id}`}
                              value={score?.notes || ''}
                              onChange={(e) => {
                                setLocalScores(prev => ({
                                  ...prev,
                                  [criteria.id]: { ...prev[criteria.id], notes: e.target.value }
                                }));
                              }}
                              onBlur={() => {
                                if (score?.notes !== localScores[criteria.id]?.notes) {
                                  handleScoreUpdate(criteria.id, { notes: localScores[criteria.id]?.notes });
                                }
                              }}
                              placeholder="Add notes about this score..."
                              disabled={userRole !== 'admin' && userRole !== 'analyst'}
                              rows={2}
                            />
                          </div>

                          {rubric && (
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p><strong>Scoring Guide:</strong></p>
                              {Object.entries(rubric).map(([scoreValue, rubricData]) => (
                                <p key={scoreValue}>
                                  <strong>{scoreValue} ({rubricData.label}):</strong> {rubricData.description}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="research" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Start New Research</CardTitle>
                <CardDescription>
                  Trigger n8n research agents to automatically gather data for selected criteria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="webhook-url">n8n Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-n8n-instance.com/webhook/research"
                    disabled={userRole !== 'admin' && userRole !== 'analyst'}
                  />
                </div>

                <div>
                  <Label>Select Criteria for Research</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                    {detailedTheme.categories.flatMap(category =>
                      category.criteria.map(criteria => (
                        <label key={criteria.id} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedCriteriaForResearch.includes(criteria.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCriteriaForResearch(prev => [...prev, criteria.id]);
                              } else {
                                setSelectedCriteriaForResearch(prev => prev.filter(id => id !== criteria.id));
                              }
                            }}
                            disabled={userRole !== 'admin' && userRole !== 'analyst'}
                          />
                          <span>{criteria.code}: {criteria.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleStartResearch}
                  disabled={!webhookUrl || selectedCriteriaForResearch.length === 0 || 
                           (userRole !== 'admin' && userRole !== 'analyst')}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Research
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Research History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {detailedTheme.research_runs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No research runs yet</p>
                  ) : (
                    <div className="space-y-2">
                      {detailedTheme.research_runs.map((run) => (
                        <div key={run.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(run.status)}
                            <div>
                              <p className="text-sm font-medium">
                                {run.criteria_ids.length} criteria researched
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Started: {new Date(run.started_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {run.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <ScrollArea className="h-[600px] pr-4">
              {detailedTheme.research_documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No research documents yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {detailedTheme.research_documents.map((doc) => (
                    <Card key={doc.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{doc.title}</h4>
                            {doc.description && (
                              <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{doc.document_type}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(doc.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            {doc.file_size && (
                              <span className="text-xs text-muted-foreground">
                                {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            )}
                            {doc.file_path && (
                              <Button variant="outline" size="sm" className="mt-2">
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};