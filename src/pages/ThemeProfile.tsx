import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText, TrendingUp, Users, Calendar, BarChart3, Upload, Settings, Shield, Target, AlertTriangle, CheckCircle, Hash, Edit, ChevronDown, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useFramework } from "@/hooks/useFramework";
import { ThemeWithDetailedScores, ResearchDocument } from "@/types/framework";
import { PILLAR_COLORS } from "@/types/themes";
import { ThemeFileUpload } from "@/components/ThemeFileUpload";
import { DocumentViewer } from "@/components/DocumentViewer";
import { DocumentIntelligence } from "@/components/DocumentIntelligence";
import { InlineScoreEditor } from "@/components/InlineScoreEditor";
import { RegulatoryTable, Regulation } from "@/components/RegulatoryTable";
import { RegulatoryDetailModal } from "@/components/RegulatoryDetailModal";
import { RegulatoryUpdatesCard } from "@/components/RegulatoryUpdatesCard";
import { FrameworkCategoryCard } from "@/components/FrameworkCategoryCard";
import { ThemeKeywords } from "@/components/ThemeKeywords";
import { ThemeDetailModal } from "@/components/ThemeDetailModal";
import { ThemeRecentSignals } from "@/components/ThemeRecentSignals";
import { useRegulations } from "@/hooks/useRegulations";
import { useThemes } from "@/hooks/useThemes";
import { BulkScoreUpdateButton } from "@/components/BulkScoreUpdateButton";
import { UploadResearchDocumentButton } from "@/components/UploadResearchDocumentButton";
import { QuickInsights } from "@/components/QuickInsights";



const ThemeProfile = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const { fetchThemeWithDetailedScores } = useFramework();
  const { regulations, loading: regulationsLoading } = useRegulations(themeId || '');
  const { updateThemeScores } = useThemes();
  const [theme, setTheme] = useState<ThemeWithDetailedScores | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<ResearchDocument | null>(null);
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null);
  const [showRegulationModal, setShowRegulationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const refreshTheme = async () => {
    if (!themeId) return;
    
    try {
      const themeData = await fetchThemeWithDetailedScores(themeId);
      setTheme(themeData);
    } catch (error) {
      console.error("Failed to refresh theme:", error);
    }
  };

  const handleSaveTheme = async (themeId: string, scoreUpdates: any[], keywords?: string[], description?: string, inScope?: string[], outOfScope?: string[]) => {
    try {
      await updateThemeScores(themeId, scoreUpdates, keywords, description, inScope, outOfScope);
      await refreshTheme(); // Refresh the theme data
      setShowEditModal(false);
    } catch (error) {
      console.error("Failed to save theme:", error);
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
    if (score >= 3.5) return "text-primary";
    if (score >= 2.5) return "text-warning";
    return "text-destructive";
  };

  const getPillarColor = (pillar: string) => {
    return PILLAR_COLORS[pillar as keyof typeof PILLAR_COLORS] || "bg-muted text-foreground border-muted";
  };

  const formatTAM = (value: number | null, currency: string = 'GBP') => {
    if (!value) return '--';
    const symbol = currency === 'GBP' ? '£' : '$';
    // Values are stored in billions, so just format directly
    return `${symbol}${Math.round(value)}Bn`;
  };

  const formatCAGR = (percentage: number | null) => {
    if (!percentage && percentage !== 0) return '--';
    return `${Number(percentage).toFixed(1)}%`;
  };

  // Calculate counts for tab badges
  const totalCriteria = theme.detailed_scores.length;
  const scoredCriteria = theme.detailed_scores.filter(s => s.score !== null).length;
  const documentCount = theme.research_documents?.length || 0;
  const regulationCount = regulations.length;

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
              <div className="flex items-center gap-3 flex-1">
                <h1 className="text-xl font-semibold">{theme.name}</h1>
                <Badge className={getPillarColor(theme.pillar)} variant="secondary">
                  {theme.pillar}
                </Badge>
                <Badge variant="outline">{theme.sector}</Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Theme
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    // Trigger bulk score update
                    const btn = document.querySelector('[data-bulk-trigger]') as HTMLButtonElement;
                    btn?.click();
                  }}>
                    <Upload className="h-4 w-4 mr-2" />
                    Load Predefined Scores
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    // Trigger file upload
                    const input = document.getElementById('file-upload') as HTMLInputElement;
                    input?.click();
                  }}>
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Research Document
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="hidden">
                <BulkScoreUpdateButton 
                  themeId={theme.id}
                  themeName={theme.name}
                  onComplete={refreshTheme}
                />
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
                    {theme.overall_score.toFixed(2)}
                  </span>
                  <span className="text-lg text-muted-foreground">/5</span>
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
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {formatTAM(theme.tam_value, theme.tam_currency || 'GBP')}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Addressable Market</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {formatCAGR(theme.cagr_percentage)}
                    </div>
                    <p className="text-sm text-muted-foreground">Growth Rate (CAGR)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {theme.market_maturity || '--'}
                    </div>
                    <p className="text-sm text-muted-foreground">Market Maturity</p>
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
              <Collapsible open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <p className={`text-muted-foreground leading-relaxed ${!isDescriptionOpen ? 'line-clamp-2' : ''}`}>
                      {theme.description}
                    </p>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 -ml-2"
                    >
                      <span className="text-sm">{isDescriptionOpen ? 'Show less' : 'Show more'}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDescriptionOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </Collapsible>
            </CardContent>
          </Card>
        )}

        {/* Recent Market Signals */}
        <ThemeRecentSignals themeId={theme.id} />

        {/* Main Content Sections */}
        <Tabs defaultValue="framework" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="framework" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Framework ({scoredCriteria}/{totalCriteria})
            </TabsTrigger>
            <TabsTrigger value="research" className="gap-2">
              <FileText className="h-4 w-4" />
              Research ({documentCount})
            </TabsTrigger>
            <TabsTrigger value="regulatory" className="gap-2">
              <Shield className="h-4 w-4" />
              Regulatory ({regulationCount})
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
                <div className="sticky top-6">
                  <QuickInsights 
                    regulations={regulations}
                    recentDocuments={theme.research_documents || []}
                  />
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
              <div className="lg:col-span-3">
                <RegulatoryTable 
                  regulations={regulations}
                  onRegulationClick={(regulation) => {
                    setSelectedRegulation(regulation);
                    setShowRegulationModal(true);
                  }}
                />
              </div>
              <div className="lg:col-span-1">
                <RegulatoryUpdatesCard regulations={regulations} />
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

      {/* Regulatory Detail Modal */}
      {showRegulationModal && selectedRegulation && (
        <RegulatoryDetailModal
          regulation={selectedRegulation}
          isOpen={showRegulationModal}
          onClose={() => {
            setShowRegulationModal(false);
            setSelectedRegulation(null);
          }}
        />
      )}

      {/* Theme Edit Modal */}
      {theme && (
        <ThemeDetailModal
          theme={{
            ...theme,
            // Convert to expected format for the modal
            scores: [], // The modal expects the old format but we'll handle this
            weighted_total_score: theme.overall_score,
            overall_confidence: theme.overall_confidence
          }}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveTheme}
        />
      )}
    </div>
  );
};

export default ThemeProfile;