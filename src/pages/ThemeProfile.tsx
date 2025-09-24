import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText, TrendingUp, Users, Calendar, BarChart3, Upload, Settings, Shield, Target, AlertTriangle, CheckCircle, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useFramework } from "@/hooks/useFramework";
import { ThemeWithDetailedScores, ResearchDocument, N8nResearchRun } from "@/types/framework";
import { PILLAR_COLORS } from "@/types/themes";
import { ThemeFileUpload } from "@/components/ThemeFileUpload";
import { DocumentViewer } from "@/components/DocumentViewer";
import { DocumentIntelligence } from "@/components/DocumentIntelligence";
import { InlineScoreEditor } from "@/components/InlineScoreEditor";
import { ScoreProgressIndicator } from "@/components/ScoreProgressIndicator";
import { RegulatoryTable } from "@/components/RegulatoryTable";
import { RegulatorySummaryCard } from "@/components/RegulatorySummaryCard";
import { FrameworkCategoryCard } from "@/components/FrameworkCategoryCard";
import { ThemeKeywords } from "@/components/ThemeKeywords";
import { useRegulations } from "@/hooks/useRegulations";

const ThemeProfile = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const { fetchThemeWithDetailedScores } = useFramework();
  const { regulations, loading: regulationsLoading } = useRegulations(themeId || '');
  const [theme, setTheme] = useState<ThemeWithDetailedScores | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<ResearchDocument | null>(null);

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

  // Calculate completion percentages for better UX
  const totalCriteria = theme.detailed_scores.length;
  const scoredCriteria = theme.detailed_scores.filter(s => s.score !== null).length;
  const completionRate = totalCriteria > 0 ? Math.round((scoredCriteria / totalCriteria) * 100) : 0;

  return (
    <div className="bg-background">
      {/* Page Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/themes")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Themes
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">{theme.name}</h1>
                <Badge className={getPillarColor(theme.pillar)} variant="secondary">
                  {theme.pillar}
                </Badge>
                <Badge variant="outline">{theme.sector}</Badge>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-8">
        {/* Investment Summary Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Primary Investment Score */}
          <Card className="lg:col-span-1 border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Investment Score</span>
                </div>
                <div className="text-4xl font-bold">
                  <span className={getScoreColor(theme.overall_score)}>
                    {theme.overall_score}
                  </span>
                  <span className="text-lg text-muted-foreground">/100</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span>{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Grid */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{scoredCriteria}<span className="text-sm text-muted-foreground">/{totalCriteria}</span></div>
                    <p className="text-sm text-muted-foreground">Criteria Evaluated</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{theme.research_documents.length}</div>
                    <p className="text-sm text-muted-foreground">Research Documents</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{regulations.length}</div>
                    <p className="text-sm text-muted-foreground">Regulatory Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Theme Description */}
        {theme.description && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed">{theme.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Main Content Sections */}
        <Tabs defaultValue="framework" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="framework" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Framework
            </TabsTrigger>
            <TabsTrigger value="research" className="gap-2">
              <FileText className="h-4 w-4" />
              Research
            </TabsTrigger>
            <TabsTrigger value="regulatory" className="gap-2">
              <Shield className="h-4 w-4" />
              Regulatory
            </TabsTrigger>
            <TabsTrigger value="keywords" className="gap-2">
              <Hash className="h-4 w-4" />
              Keywords
            </TabsTrigger>
            <TabsTrigger value="scope" className="gap-2">
              <Target className="h-4 w-4" />
              Scope
            </TabsTrigger>
          </TabsList>

          {/* Framework Analysis - Primary Tab */}
          <TabsContent value="framework" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="space-y-4">
                  {theme.categories.map((category) => (
                    <FrameworkCategoryCard
                      key={category.id}
                      category={category}
                      scores={theme.detailed_scores}
                      themeId={theme.id}
                      onScoreUpdate={refreshTheme}
                    />
                  ))}
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-4">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Analysis Progress</CardTitle>
                      <CardDescription>
                        Scoring across {theme.categories.length} categories
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScoreProgressIndicator theme={theme} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Research Materials */}
          <TabsContent value="research" className="space-y-6">
            <div className="space-y-6">
              {/* Clean Document Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Research Documents
                  </CardTitle>
                  <CardDescription>
                    {theme.research_documents.length} document{theme.research_documents.length !== 1 ? 's' : ''} available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentIntelligence 
                    documents={theme.research_documents}
                    onDocumentSelect={setSelectedDocument}
                  />
                </CardContent>
              </Card>
              
              {/* Minimal File Upload */}
              <Card>
                <CardContent className="pt-6">
                  <ThemeFileUpload themeId={themeId!} onUploadComplete={refreshTheme} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Regulatory Analysis */}
          <TabsContent value="regulatory" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <RegulatorySummaryCard regulations={regulations} />
              </div>
              <div className="lg:col-span-3">
                <RegulatoryTable 
                  regulations={regulations}
                  onRegulationClick={(regulation) => {
                    console.log('Selected regulation:', regulation);
                  }}
                />
              </div>
            </div>
          </TabsContent>

          {/* Keywords Tab */}
          <TabsContent value="keywords" className="space-y-6">
            <ThemeKeywords 
              keywords={theme.keywords || []} 
              themeName={theme.name}
            />
          </TabsContent>

          {/* Investment Scope */}
          <TabsContent value="scope" className="space-y-6">
            {(theme.in_scope?.length || theme.out_of_scope?.length) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {theme.in_scope?.length && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-700 dark:text-green-400 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        In Scope
                      </CardTitle>
                      <CardDescription>Investment areas and opportunities included</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {theme.in_scope.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
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
                      <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Out of Scope
                      </CardTitle>
                      <CardDescription>Areas explicitly excluded from investment</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {theme.out_of_scope.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
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
                <CardContent className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Scope Defined</h3>
                  <p className="text-muted-foreground">Investment scope and boundaries have not been defined for this theme.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>


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