import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { 
  Shield, 
  Search, 
  Filter, 
  Calendar,
  AlertTriangle,
  ExternalLink,
  Clock,
  Building2,
  Globe2,
  FileText,
  Link,
  Grid3X3,
  Table2,
  Download,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { RegulationThemeLinkModal } from "@/components/RegulationThemeLinkModal";
import { RegulatoryDetailModal } from "@/components/RegulatoryDetailModal";
import { RegulatoryTable } from "@/components/RegulatoryTable";
import type { Regulation } from "@/types/regulatory";

// Interface removed - now using type from regulatory.ts

export default function RegulatoryTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("all");
  const [selectedImpact, setSelectedImpact] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [themes, setThemes] = useState<{id: string; name: string}[]>([]);

  // Fetch regulations from database with theme information
  const fetchRegulations = async () => {
    try {
      setLoading(true);
      
      // Fetch all themes for filtering
      const { data: themesData, error: themesError } = await supabase
        .from('taxonomy_themes')
        .select('id, name')
        .order('name');

      if (themesError) {
        console.error('Error fetching themes:', themesError);
      } else {
        setThemes(themesData || []);
      }
      
      // Fetch regulations with theme relationships
      const { data: regulationsData, error: regulationsError } = await supabase
        .from('regulations')
        .select('*')
        .order('created_at', { ascending: false });

      if (regulationsError) {
        console.error('Error fetching regulations:', regulationsError);
        return;
      }

      // Fetch theme-regulation relationships using manual join to avoid foreign key issues
      const { data: themeRegulations, error: themeRegError } = await supabase
        .from('theme_regulations')
        .select('regulation_id, relevance_score, impact_description, criteria_impacts, theme_id')
        .order('relevance_score', { ascending: false });

      if (themeRegError) {
        console.error('Error fetching theme regulations:', themeRegError);
      } else {
        console.log('Theme regulations data:', themeRegulations);
      }

      // Fetch themes separately
      const { data: allThemes, error: themesError2 } = await supabase
        .from('taxonomy_themes')
        .select('id, name');

      if (themesError2) {
        console.error('Error fetching themes for relationships:', themesError2);
      }

      // Transform and combine the data
      const transformedRegulations: Regulation[] = (regulationsData || []).map(reg => {
        const themeRels = (themeRegulations || []).filter(tr => tr.regulation_id === reg.id);
        console.log(`Regulation ${reg.title} has ${themeRels.length} theme relationships:`, themeRels);
        
        const affectedThemes = themeRels.map(tr => {
          const theme = (allThemes || []).find(t => t.id === tr.theme_id);
          console.log('Found theme:', theme);
          return theme?.name;
        }).filter(Boolean);
        
        console.log(`Affected themes for ${reg.title}:`, affectedThemes);
        
        const maxRelevance = Math.max(...themeRels.map(tr => tr.relevance_score || 0), 0);
        
        return {
          ...reg,
          relevance_score: maxRelevance || 3,
          impact_description: themeRels[0]?.impact_description || 'Regulatory impact assessment pending',
          criteria_impacts: themeRels[0]?.criteria_impacts || [],
          affected_themes: affectedThemes,
          theme_ids: themeRels.map(tr => tr.theme_id).filter(Boolean)
        };
      });

      setRegulations(transformedRegulations);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegulations();
  }, []);

  const handleLinkToThemes = (regulation: Regulation) => {
    setSelectedRegulation(regulation);
    setShowLinkModal(true);
  };

  const handleViewDetails = (regulation: Regulation) => {
    setSelectedRegulation(regulation);
    setShowDetailModal(true);
  };

  const handleLinksUpdated = () => {
    fetchRegulations(); // Refresh the data
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'high': return "bg-red-100 text-red-800 border-red-200";
      case 'medium': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'low': return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return "bg-green-100 text-green-800 border-green-200";
      case 'pending': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'draft': return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredRegulations = regulations.filter(regulation => {
    const matchesSearch = regulation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         regulation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         regulation.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesJurisdiction = selectedJurisdiction === "all" || 
                               regulation.jurisdiction.toLowerCase().includes(selectedJurisdiction.toLowerCase());
    
    const matchesImpact = selectedImpact === "all" || regulation.impact_level === selectedImpact;
    
    const matchesStatus = selectedStatus === "all" || regulation.status === selectedStatus;
    
    const matchesTheme = selectedTheme === "all" || 
                        (regulation.theme_ids && regulation.theme_ids.includes(selectedTheme));
    
    return matchesSearch && matchesJurisdiction && matchesImpact && matchesStatus && matchesTheme;
  });

  const jurisdictions = [...new Set(regulations.map(r => r.jurisdiction))];

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-6">
        <div className="mb-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-foreground">Regulatory Tracker</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Loading regulatory data...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="mb-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-foreground">Regulatory Tracker</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{filteredRegulations.length} regulations</span>
                <span>•</span>
                <span>{jurisdictions.length} jurisdictions</span>
                <span>•</span>
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted rounded-md p-0.5">
              <Toggle
                pressed={viewMode === 'cards'}
                onPressedChange={() => setViewMode('cards')}
                size="sm"
                className="h-7 px-2 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </Toggle>
              <Toggle
                pressed={viewMode === 'table'}
                onPressedChange={() => setViewMode('table')}
                size="sm"
                className="h-7 px-2 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
              >
                <Table2 className="h-3.5 w-3.5" />
              </Toggle>
            </div>
            
            <Button variant="outline" size="sm" className="text-xs">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search regulations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="Jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jurisdictions</SelectItem>
                  {jurisdictions.map(jurisdiction => (
                    <SelectItem key={jurisdiction} value={jurisdiction.toLowerCase()}>
                      {jurisdiction}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Investment Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Themes</SelectItem>
                  {themes.map(theme => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedImpact} onValueChange={setSelectedImpact}>
                <SelectTrigger>
                  <SelectValue placeholder="Impact Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Impact Levels</SelectItem>
                  <SelectItem value="high">High Impact</SelectItem>
                  <SelectItem value="medium">Medium Impact</SelectItem>
                  <SelectItem value="low">Low Impact</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic View Rendering */}
      {viewMode === 'table' ? (
        <RegulatoryTable 
          regulations={filteredRegulations}
          onRegulationClick={handleLinkToThemes}
        />
      ) : (
        /* Cards View */
        <div className="space-y-4">
          {filteredRegulations.map((regulation) => {
            const daysUntilDeadline = regulation.compliance_deadline ? 
              getDaysUntilDeadline(regulation.compliance_deadline) : null;
            
            return (
              <Card key={regulation.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewDetails(regulation)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header with title and status */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-lg text-foreground">{regulation.title}</h3>
                          </div>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {regulation.description}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Badge variant="outline" className={cn("text-xs whitespace-nowrap", getStatusColor(regulation.status))}>
                            {regulation.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className={cn("text-xs whitespace-nowrap", getImpactColor(regulation.impact_level))}>
                            {regulation.impact_level.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      {/* Linked Themes - Most Important Information */}
                      {regulation.affected_themes && regulation.affected_themes.length > 0 ? (
                        <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Investment Themes</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {regulation.affected_themes.map((theme, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                                {theme}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-muted">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">No themes linked</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLinkToThemes(regulation);
                              }}
                              className="text-xs"
                            >
                              <Link className="h-3 w-3 mr-1" />
                              Link Themes
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Essential details in a clean row */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Globe2 className="h-3 w-3" />
                            <span>{regulation.jurisdiction}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            <span>{regulation.regulatory_body}</span>
                          </div>
                          {regulation.compliance_deadline && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-orange-500" />
                              <span className={cn(
                                "font-medium",
                                getDaysUntilDeadline(regulation.compliance_deadline) < 90 ? "text-red-600" : "text-muted-foreground"
                              )}>
                                {format(new Date(regulation.compliance_deadline), 'MMM d, yyyy')}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          {regulation.affected_themes && regulation.affected_themes.length > 0 && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLinkToThemes(regulation);
                              }}
                              className="text-xs"
                            >
                              <Link className="h-3 w-3 mr-1" />
                              Edit Links
                            </Button>
                          )}
                          {regulation.source_url && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(regulation.source_url, '_blank');
                              }}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Source
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredRegulations.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No regulations found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Theme Link Modal */}
      {showLinkModal && selectedRegulation && (
        <RegulationThemeLinkModal
          regulation={selectedRegulation}
          isOpen={showLinkModal}
          onClose={() => {
            setShowLinkModal(false);
            setSelectedRegulation(null);
          }}
          onLinksUpdated={handleLinksUpdated}
        />
      )}

      {/* Regulatory Detail Modal */}
      {showDetailModal && selectedRegulation && (
        <RegulatoryDetailModal
          regulation={selectedRegulation}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRegulation(null);
          }}
        />
      )}
    </div>
  );
}