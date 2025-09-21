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

const ThemeProfile = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const { fetchThemeWithDetailedScores } = useFramework();
  const [theme, setTheme] = useState<ThemeWithDetailedScores | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFrameworkModal, setShowFrameworkModal] = useState(false);

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
  }, [themeId, fetchThemeWithDetailedScores]);

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
        <Button
          onClick={() => setShowFrameworkModal(true)}
          className="mb-6"
        >
          View Framework Analysis
        </Button>
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

        {/* Score Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">
                <span className={getScoreColor(theme.overall_score)}>
                  {theme.overall_score}
                </span>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
              <div>
                <Badge 
                  variant={theme.overall_confidence === 'High' ? 'default' : 
                           theme.overall_confidence === 'Medium' ? 'secondary' : 'destructive'}
                >
                  {theme.overall_confidence} Confidence
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scope */}
      {(theme.in_scope?.length || theme.out_of_scope?.length) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {theme.in_scope?.length && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">In Scope</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {theme.in_scope.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          {theme.out_of_scope?.length && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Out of Scope</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {theme.out_of_scope.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="research" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="research">Research & Documents</TabsTrigger>
          <TabsTrigger value="analysis">Framework Analysis</TabsTrigger>
          <TabsTrigger value="activity">Research Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="research" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Research Documents
              </CardTitle>
              <CardDescription>
                Documents and research materials for this theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              {theme.research_documents.length > 0 ? (
                <div className="space-y-4">
                  {theme.research_documents.map((doc: ResearchDocument) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{doc.title}</h4>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground">{doc.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {doc.document_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(doc.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {doc.file_path && (
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No research documents available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid gap-6">
            {theme.categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle>{category.name} ({category.code})</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.criteria.map((criteria) => {
                      const score = theme.detailed_scores.find(s => s.criteria_id === criteria.id);
                      return (
                        <div key={criteria.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex-1">
                            <h4 className="font-medium">{criteria.name} ({criteria.code})</h4>
                            <p className="text-sm text-muted-foreground">{criteria.description}</p>
                          </div>
                          <div className="text-right">
                            {score?.score ? (
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${getScoreColor(score.score)}`}>
                                  {score.score}/5
                                </span>
                                {score.confidence && (
                                  <Badge variant="outline" className="text-xs">
                                    {score.confidence}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Not scored</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Research Runs
              </CardTitle>
              <CardDescription>
                History of automated research activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {theme.research_runs.length > 0 ? (
                <div className="space-y-4">
                  {theme.research_runs.map((run: N8nResearchRun) => (
                    <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={run.status === 'completed' ? 'default' : 
                                     run.status === 'running' ? 'secondary' : 
                                     run.status === 'failed' ? 'destructive' : 'outline'}
                            >
                              {run.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {run.criteria_ids.length} criteria analyzed
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Started: {new Date(run.started_at).toLocaleString()}
                          </p>
                          {run.completed_at && (
                            <p className="text-sm text-muted-foreground">
                              Completed: {new Date(run.completed_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No research runs available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
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
    </div>
  );
};

export default ThemeProfile;