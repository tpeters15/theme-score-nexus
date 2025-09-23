import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText, TrendingUp, Users, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useFramework } from "@/hooks/useFramework";
import { ThemeWithDetailedScores, ResearchDocument, N8nResearchRun } from "@/types/framework";
import { PILLAR_COLORS } from "@/types/themes";
import { DetailedFrameworkModal } from "@/components/DetailedFrameworkModal";
import { ThemeFileUpload } from "@/components/ThemeFileUpload";
import { DocumentViewer } from "@/components/DocumentViewer";
import { DocumentIntelligence } from "@/components/DocumentIntelligence";
import { InlineScoreEditor } from "@/components/InlineScoreEditor";
import { BulkScoringModal } from "@/components/BulkScoringModal";
import { ScoreProgressIndicator } from "@/components/ScoreProgressIndicator";
import { RegulatoryTable } from "@/components/RegulatoryTable";
import { RegulatorySummaryCard } from "@/components/RegulatorySummaryCard";
import { useRegulations } from "@/hooks/useRegulations";

const ThemeProfile = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const { fetchThemeWithDetailedScores } = useFramework();
  const { regulations, loading: regulationsLoading } = useRegulations(themeId || '');
  const [theme, setTheme] = useState<ThemeWithDetailedScores | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFrameworkModal, setShowFrameworkModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ResearchDocument | null>(null);
  const [showBulkScoring, setShowBulkScoring] = useState(false);

  const refreshTheme = async () => {
    if (!themeId) return;
    
    try {
      const themeData = await fetchThemeWithDetailedScores(themeId);
      setTheme(themeData);
    } catch (error) {
      console.error("Failed to refresh theme:", error);
    }
  };

  useEffect(() => {
  const loadTheme = async () => {
      if (!themeId) return;
      
      console.log("Loading theme:", themeId);
      setLoading(true);
      try {
        const themeData = await fetchThemeWithDetailedScores(themeId);
        console.log("Theme data loaded:", themeData);
        setTheme(themeData);
      } catch (error) {
        console.error("Failed to load theme:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, [themeId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-24 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-muted-foreground">Theme not found</h1>
          <p className="text-muted-foreground mt-2">The requested theme could not be loaded.</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getPillarColor = (pillar: string) => {
    return PILLAR_COLORS[pillar as keyof typeof PILLAR_COLORS] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowFrameworkModal(true)}
            variant="outline"
          >
            View Framework Analysis
          </Button>
          <Button
            onClick={() => setShowBulkScoring(true)}
          >
            Bulk Scoring
          </Button>
        </div>
      </div>

      {/* Theme Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">{theme.name}</h1>
          <Badge className={getPillarColor(theme.pillar)}>
            {theme.pillar}
          </Badge>
          <Badge variant="outline">{theme.sector}</Badge>
        </div>
        
        {theme.description && (
          <p className="text-lg text-muted-foreground">{theme.description}</p>
        )}

        {/* Framework Score Analysis - Main Hero Content */}
        <div className="grid gap-6">
          {/* Overview Metrics and Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold">
                      <span className={getScoreColor(theme.overall_score)}>
                        {theme.overall_score}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
                    <Badge 
                      variant={theme.overall_confidence === 'High' ? 'default' : 
                               theme.overall_confidence === 'Medium' ? 'secondary' : 'destructive'}
                      className="mt-2"
                    >
                      {theme.overall_confidence} Confidence
                    </Badge>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary">
                      {theme.categories.length}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Categories</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary">
                      {theme.detailed_scores.filter(s => s.score !== null).length}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Scored Criteria</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary">
                      {theme.research_documents.length}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Research Docs</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Score Progress */}
            <div className="lg:col-span-1">
              <ScoreProgressIndicator theme={theme} />
            </div>
          </div>

          {/* Framework Categories with Scores */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Framework Analysis</h2>
            <div className="grid gap-4">
              {theme.categories.map((category) => {
                const categoryScores = theme.detailed_scores.filter(s => 
                  category.criteria.some(c => c.id === s.criteria_id)
                );
                const avgScore = categoryScores.length > 0 
                  ? categoryScores.reduce((sum, s) => sum + (s.score || 0), 0) / categoryScores.length 
                  : 0;
                
                return (
                  <Card key={category.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{category.name} ({category.code})</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            <span className={getScoreColor(avgScore * 20)}>
                              {avgScore.toFixed(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">/5</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Category Average</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid gap-3">
                        {category.criteria.map((criteria) => {
                          const score = theme.detailed_scores.find(s => s.criteria_id === criteria.id);
                          return (
                            <div key={criteria.id} className="p-3 bg-muted/20 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-sm">{criteria.code}</h4>
                                    <span className="text-sm">{criteria.name}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{criteria.description}</p>
                                </div>
                              </div>
                              <InlineScoreEditor
                                themeId={theme.id}
                                criteriaId={criteria.id}
                                currentScore={score?.score}
                                currentConfidence={score?.confidence}
                                currentNotes={score?.notes}
                                onScoreUpdate={refreshTheme}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Information - Accessible but not center-stage */}
      <Tabs defaultValue="research" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
          <TabsTrigger value="scope">Theme Details</TabsTrigger>
        </TabsList>

        <TabsContent value="research" className="space-y-6">
          <ThemeFileUpload themeId={themeId!} onUploadComplete={refreshTheme} />
          
          <DocumentIntelligence 
            documents={theme.research_documents}
            onDocumentSelect={setSelectedDocument}
          />
        </TabsContent>

        <TabsContent value="regulatory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <RegulatorySummaryCard regulations={regulations} />
            </div>
            <div className="lg:col-span-3">
              <RegulatoryTable 
                regulations={regulations}
                onRegulationClick={(regulation) => {
                  // Future: Open regulation detail modal
                  console.log('Selected regulation:', regulation);
                }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scope" className="space-y-6">
          {(theme.in_scope?.length || theme.out_of_scope?.length) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {theme.in_scope?.length && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-score-high">In Scope</CardTitle>
                    <CardDescription>Areas included in this investment theme</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {theme.in_scope.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-score-high rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              {theme.out_of_scope?.length && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-score-low">Out of Scope</CardTitle>
                    <CardDescription>Areas explicitly excluded from this theme</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {theme.out_of_scope.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-score-low rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No scope definition available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

      </Tabs>

      {/* Framework Modal */}
      {showFrameworkModal && (
        <DetailedFrameworkModal
          theme={theme}
          isOpen={showFrameworkModal}
          onClose={() => setShowFrameworkModal(false)}
        />
      )}

      {showBulkScoring && (
        <BulkScoringModal
          theme={theme}
          isOpen={showBulkScoring}
          onClose={() => setShowBulkScoring(false)}
          onScoringComplete={refreshTheme}
        />
      )}

      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
};

export default ThemeProfile;