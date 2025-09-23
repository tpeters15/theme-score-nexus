import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { Regulation } from "@/types/regulatory";

// Interface removed - now using type from regulatory.ts

export default function RegulatoryTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("all");
  const [selectedImpact, setSelectedImpact] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch regulations from database
  useEffect(() => {
    async function fetchRegulations() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('regulations')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching regulations:', error);
          return;
        }

        // Transform data to match our interface with default values
        const transformedRegulations: Regulation[] = (data || []).map(reg => ({
          ...reg,
          relevance_score: 4, // Default since this comes from theme_regulations
          impact_description: 'Regulatory impact assessment pending',
          criteria_impacts: []
        }));

        setRegulations(transformedRegulations);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRegulations();
  }, []);

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
    
    return matchesSearch && matchesJurisdiction && matchesImpact && matchesStatus;
  });

  const jurisdictions = [...new Set(regulations.map(r => r.jurisdiction))];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Regulatory Tracker</h1>
          <p className="text-muted-foreground">Loading regulatory data...</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Regulatory Tracker</h1>
        <p className="text-muted-foreground">
          Central repository for regulatory and policy instruments affecting climate tech investments
        </p>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Regulations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Regulations ({filteredRegulations.length})
          </h2>
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        {filteredRegulations.map((regulation) => {
          const daysUntilDeadline = regulation.compliance_deadline ? 
            getDaysUntilDeadline(regulation.compliance_deadline) : null;
          
          return (
            <Card key={regulation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">{regulation.title}</h3>
                      <Badge variant="outline" className={cn("text-xs", getImpactColor(regulation.impact_level))}>
                        {regulation.impact_level.toUpperCase()} IMPACT
                      </Badge>
                      {regulation.relevance_score && (
                       <span className="text-sm text-muted-foreground">
                          {regulation.relevance_score}/5 relevance
                        </span>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      {regulation.description}
                    </p>
                    
                    {/* Metadata */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Globe2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">Jurisdiction:</span> {regulation.jurisdiction}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">Regulatory Body:</span> {regulation.regulatory_body}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs", getStatusColor(regulation.status))}>
                          {regulation.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* Key Provisions */}
                    {regulation.key_provisions && regulation.key_provisions.length > 0 && (
                      <div className="mb-4">
                        <span className="text-sm font-medium">Key Provisions:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {regulation.key_provisions.map((provision, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {provision}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Impact Description */}
                    {regulation.impact_description && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-sm font-medium text-blue-800">Impact on Target Customers:</span>
                        <div className="text-xs text-blue-700 mt-1">{regulation.impact_description}</div>
                      </div>
                    )}

                    {/* Dates and Deadline */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      {regulation.effective_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Effective: {format(new Date(regulation.effective_date), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      
                      {regulation.compliance_deadline && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-orange-500" />
                          <span className={cn(
                            "font-medium",
                            daysUntilDeadline && daysUntilDeadline < 90 ? "text-red-600" : "text-muted-foreground"
                          )}>
                            Deadline: {format(new Date(regulation.compliance_deadline), 'MMM d, yyyy')}
                            {daysUntilDeadline && daysUntilDeadline > 0 && (
                              <span className="ml-1">({daysUntilDeadline} days left)</span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {regulation.source_url && (
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Source
                      </Button>
                    )}
                    {regulation.analysis_url && (
                      <Button variant="outline" size="sm">
                        <FileText className="h-3 w-3 mr-1" />
                        Analysis
                      </Button>
                    )}
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
    </div>
  );
}