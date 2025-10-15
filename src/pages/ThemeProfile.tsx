import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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
import { ThemeWithDetailedScores, ResearchDocument, N8nResearchRun } from "@/types/framework";
import { PILLAR_COLORS } from "@/types/themes";
import { ThemeFileUpload } from "@/components/ThemeFileUpload";
import { DocumentViewer } from "@/components/DocumentViewer";
import { DocumentIntelligence } from "@/components/DocumentIntelligence";
import { InlineScoreEditor } from "@/components/InlineScoreEditor";
import { RegulatoryTable } from "@/components/RegulatoryTable";
import { RegulatorySummaryCard } from "@/components/RegulatorySummaryCard";
import { FrameworkCategoryCard } from "@/components/FrameworkCategoryCard";
import { ThemeKeywords } from "@/components/ThemeKeywords";
import { ThemeDetailModal } from "@/components/ThemeDetailModal";
import { useRegulations } from "@/hooks/useRegulations";
import { useThemes } from "@/hooks/useThemes";
import { BulkScoreUpdateButton } from "@/components/BulkScoreUpdateButton";
import { UploadResearchDocumentButton } from "@/components/UploadResearchDocumentButton";
import { QuickInsights } from "@/components/QuickInsights";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const ThemeProfile = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const { fetchThemeWithDetailedScores } = useFramework();
  const { regulations, loading: regulationsLoading } = useRegulations(themeId || '');
  const { updateThemeScores } = useThemes();
  const [theme, setTheme] = useState<ThemeWithDetailedScores | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<ResearchDocument | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const { toast } = useToast();
  const populatingRef = useRef(false);

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

  // Auto-populate EV Charging Infrastructure data once when the theme is loaded
  useEffect(() => {
    if (!theme || populatingRef.current) return;
    if (theme.name !== 'EV Charging Infrastructure') return;

    const run = async () => {
      try {
        populatingRef.current = true;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({ title: 'Sign in required', description: 'Please log in to save data', variant: 'destructive' });
          return;
        }

        // 1) Update theme TAM/CAGR/Maturity
        await supabase
          .from('taxonomy_themes')
          .update({
            tam_value: 80000000000, // £80.0bn
            tam_currency: 'GBP',
            cagr_percentage: 21,
            cagr_period_start: 2024,
            cagr_period_end: 2030,
            market_maturity: 'TRANSITIONING',
          })
          .eq('id', theme.id);

        // 2) Get framework criteria map
        const { data: criteria, error: criteriaError } = await supabase
          .from('framework_criteria')
          .select('id, code');
        if (criteriaError) throw criteriaError;
        const cMap: Record<string, string> = {};
        (criteria || []).forEach((c: any) => { cMap[c.code] = c.id; });

        // 3) Detailed scores with rationales
        const scores: Record<string, { score: number; notes: string }> = {
          A1: { score: 5, notes: '€80bn significantly exceeds the €5bn threshold for expansive market classification' },
          A2: { score: 5, notes: '€2.2bn PE-addressable SOM substantially exceeds the €0.3bn threshold for high potential classification' },
          A3: { score: 5, notes: '21% CAGR significantly exceeds the 10% threshold for rapid growth classification' },
          A4: { score: 3, notes: 'Transitioning maturity directly maps to the growth phase rubric (mix of VC and early PE activity)' },
          B1: { score: 5, notes: 'High fragmentation with top 3 holding only 10.5% share creates ideal structure for platform building and bolt-on acquisitions' },
          B2: { score: 3, notes: 'Moderate moat strength indicates medium competitive intensity with viable differentiation opportunities through switching costs or proprietary technology' },
          B3: { score: 3, notes: 'Viable exit quality directly corresponds to medium exit environment with 2-5 relevant M&A transactions in recent years' },
          C1: { score: 5, notes: 'Only 35% compliance-driven demand falls well below the 40% threshold, indicating primarily ROI-driven market resilient to policy changes' },
          C2: { score: 5, notes: 'Excellent timing with transitioning maturity, >15% CAGR, and strong regulatory support creates optimal PE investment window' },
          C3: { score: 3, notes: 'Mixed demand drivers with majority ROI-driven but significant discretionary component creates moderate cyclicality exposure' },
          C4: { score: 3, notes: 'Mix of medium to medium-high confidence across critical research tools with no major data gaps represents manageable research concerns' },
        };

        for (const [code, s] of Object.entries(scores)) {
          const criteria_id = cMap[code];
          if (!criteria_id) continue;

          const { data: existing, error: selErr } = await supabase
            .from('detailed_scores')
            .select('id')
            .eq('theme_id', theme.id)
            .eq('criteria_id', criteria_id)
            .maybeSingle();
          if (selErr) throw selErr;

          if (existing?.id) {
            await supabase.from('detailed_scores').update({
              score: s.score,
              confidence: 'MEDIUM',
              notes: s.notes,
              updated_by: user.id,
              update_source: 'manual',
            }).eq('id', existing.id);
          } else {
            await supabase.from('detailed_scores').insert({
              theme_id: theme.id,
              criteria_id,
              score: s.score,
              confidence: 'MEDIUM',
              notes: s.notes,
              updated_by: user.id,
              update_source: 'manual',
            });
          }
        }

        // 4) Regulations and theme linkage
        const regulations = [
          {
            title: 'Regulation (EU) 2023/1804 on Deployment of Alternative Fuels Infrastructure (AFIR)',
            description: 'Member States must meet strict EV charging-rollout targets on the TEN-T network and urban areas with incremental targets each year from 2024 through 2030. Charging stations must also be "smart" and connected via national data platforms.',
            jurisdiction: 'EU',
            status: 'in_force',
            source_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A02023R1804-20250414',
            compliance_deadline: '2030-12-31',
            regulatory_body: 'Regulation (EU) 2023/1804',
            regulation_type: 'infrastructure',
            impact_level: 'high',
            impact_description: 'Strong incentive to invest in charging networks; member states will be pushing that build-out aggressively. Projects aligned with AFIR targets can rely on legal "must-build" demand.',
            relevance_score: 5,
          },
          {
            title: 'The Building etc. (Amendment) (England) (No. 2) Regulations 2022 (SI 2022/984)',
            description: 'All new residential dwellings must have one chargepoint per home; new non-residential buildings with >10 parking spaces must install EV chargepoints on 20% of spaces and EV-ready wiring on all spaces.',
            jurisdiction: 'UK',
            status: 'in_force',
            source_url: '',
            compliance_deadline: '2022-06-30',
            regulatory_body: 'SI 2022/984',
            regulation_type: 'infrastructure',
            impact_level: 'high',
            impact_description: 'Mandatory demand for chargers in construction, driving adoption of chargepoint supply in building sector and raising underlying market size.',
            relevance_score: 5,
          },
          {
            title: 'The Electric Vehicles (Smart Charge Points) Regulations 2021',
            description: 'All new home and workplace chargers must be "smart"—capable of receiving tariffs and responding. From 1 July 2022 all new private chargepoints must meet technical "smart" standards; large public and workplace chargepoints have staggered deadlines.',
            jurisdiction: 'UK',
            status: 'in_force',
            source_url: '',
            compliance_deadline: '2025-04-30',
            regulatory_body: 'The Electric Vehicles (Smart Charge Points) Regulations 2021',
            regulation_type: 'infrastructure',
            impact_level: 'medium',
            impact_description: 'Adds compliance cost to chargers (favoring higher-end CPOs) and integrates EV charging load management into energy markets, but does not by itself drive large additional volume of chargers.',
            relevance_score: 3,
          },
          {
            title: 'Ladesäulenverordnung (LSV)',
            description: 'Price transparency (publish €/kWh and €/minute), standardized billing information, mandatory smart-metering or equivalent on new chargers, and grid-access priority settings for chargers.',
            jurisdiction: 'DE',
            status: 'in_force',
            source_url: '',
            compliance_deadline: '2023-12-31',
            regulatory_body: 'Ladesäulenverordnung (LSV)',
            regulation_type: 'infrastructure',
            impact_level: 'medium',
            impact_description: 'Creates some compliance work for operators but also levels the playing field. It indirectly supports investment by clarifying rules and requiring open-access networks.',
            relevance_score: 3,
          },
          {
            title: 'Ladeinfrastrukturgesetz (LadInfraG 2023)',
            description: 'Tenants have a right to request a charger, planning/regulatory barriers are reduced, and reference values for connection capacity are set.',
            jurisdiction: 'DE',
            status: 'in_force',
            source_url: '',
            compliance_deadline: '2023-07-31',
            regulatory_body: 'Ladeinfrastrukturgesetz (LadInfraG 2023)',
            regulation_type: 'infrastructure',
            impact_level: 'medium',
            impact_description: 'Lowers soft-costs of installation and may open new retrofit markets. Helps unlock private-sector investment by making permitting faster.',
            relevance_score: 3,
          },
        ];

        for (const reg of regulations) {
          // find existing regulation
          const { data: existingReg } = await supabase
            .from('regulations')
            .select('id')
            .eq('title', reg.title)
            .eq('jurisdiction', reg.jurisdiction)
            .maybeSingle();

          let regulation_id = existingReg?.id as string | undefined;
          if (!regulation_id) {
            const { data: inserted } = await supabase
              .from('regulations')
              .insert({
                title: reg.title,
                description: reg.description,
                jurisdiction: reg.jurisdiction,
                regulation_type: reg.regulation_type,
                status: reg.status,
                source_url: reg.source_url,
                analysis_url: reg.source_url,
                compliance_deadline: reg.compliance_deadline,
                regulatory_body: reg.regulatory_body,
                impact_level: reg.impact_level,
              })
              .select('id')
              .single();
            regulation_id = inserted?.id;
          } else {
            await supabase
              .from('regulations')
              .update({
                description: reg.description,
                source_url: reg.source_url,
                analysis_url: reg.source_url,
                compliance_deadline: reg.compliance_deadline,
                impact_level: reg.impact_level,
              })
              .eq('id', regulation_id);
          }

          if (regulation_id) {
            const { data: tr } = await supabase
              .from('theme_regulations')
              .select('id')
              .eq('theme_id', theme.id)
              .eq('regulation_id', regulation_id)
              .maybeSingle();

            if (tr?.id) {
              await supabase
                .from('theme_regulations')
                .update({ impact_description: reg.impact_description, relevance_score: reg.relevance_score })
                .eq('id', tr.id);
            } else {
              await supabase
                .from('theme_regulations')
                .insert({
                  theme_id: theme.id,
                  regulation_id,
                  impact_description: reg.impact_description,
                  relevance_score: reg.relevance_score,
                });
            }
          }
        }

        toast({ title: 'EV Charging populated', description: 'TAM, CAGR, scores, and regulations saved.' });
        await refreshTheme();
      } catch (e: any) {
        console.error('Populate failed', e);
        toast({ title: 'Populate failed', description: e.message || 'Check permissions', variant: 'destructive' });
      }
    };

    run();
  }, [theme]);

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
    if (score >= 70) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const getPillarColor = (pillar: string) => {
    return PILLAR_COLORS[pillar as keyof typeof PILLAR_COLORS] || "bg-muted text-foreground border-muted";
  };

  const formatTAM = (value: number | null, currency: string = 'GBP') => {
    if (!value) return '--';
    const symbol = currency === 'GBP' ? '£' : '$';
    if (value >= 1_000_000_000) return `${symbol}${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
    return `${symbol}${value.toFixed(1)}`;
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
                    {theme.overall_score}
                  </span>
                  <span className="text-lg text-muted-foreground">/100</span>
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
                      {formatTAM((theme as any).tam_value, (theme as any).tam_currency)}
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
                      {formatCAGR((theme as any).cagr_percentage)}
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
                      {(theme as any).market_maturity || '--'}
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