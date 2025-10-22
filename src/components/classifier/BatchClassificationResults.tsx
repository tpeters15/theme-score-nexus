import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ClassificationDetailModal } from "./ClassificationDetailModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Eye } from "lucide-react";

export const BatchClassificationResults = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [selectedClassification, setSelectedClassification] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      
      // Fetch recent company theme mappings with related data
      const { data, error } = await supabase
        .from("company_theme_mappings")
        .select(`
          *,
          company:companies(
            id,
            company_name,
            website_domain,
            classification_status
          ),
          theme:taxonomy_themes(
            id,
            name,
            sector:taxonomy_sectors(
              name,
              pillar:taxonomy_pillars(name)
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform to match expected format
      const formattedResults = (data || []).map((mapping: any) => ({
        id: mapping.id,
        company_id: mapping.company_id,
        primary_theme: mapping.theme?.name || "Unknown",
        confidence_score: mapping.confidence_score || 0,
        rationale: mapping.notes || "No rationale provided",
        status: mapping.company?.classification_status === "completed" ? "Completed" : "Processing",
        pillar: mapping.theme?.sector?.pillar?.name,
        sector: mapping.theme?.sector?.name,
        business_model: "",
        context_metadata: {},
        updated_at: mapping.updated_at,
        company: {
          company_name: mapping.company?.company_name,
          website_domain: mapping.company?.website_domain
        },
        theme: mapping.theme
      }));

      setResults(formattedResults);
    } catch (error: any) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (result: any) => {
    setSelectedClassification(result);
    setModalOpen(true);
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 0.85) return <Badge variant="default">{(score * 100).toFixed(0)}%</Badge>;
    if (score >= 0.70) return <Badge variant="secondary">{(score * 100).toFixed(0)}%</Badge>;
    return <Badge variant="destructive">{(score * 100).toFixed(0)}%</Badge>;
  };

  if (loading) {
    return (
      <Card className="p-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          No classification results yet. Start classifying companies using the tabs above.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Recent Classifications ({results.length})
        </h2>
        <Button variant="outline" size="sm" onClick={fetchResults}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {results.map((result) => (
          <Card key={result.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{result.company?.company_name}</h3>
                  {result.status === "Completed" ? (
                    <Badge variant="default">Completed</Badge>
                  ) : (
                    <Badge variant="secondary">Processing</Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {result.company?.website_domain}
                </p>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Pillar:</span>
                    <div className="font-medium mt-1">{result.pillar || "-"}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sector:</span>
                    <div className="font-medium mt-1">{result.sector || "-"}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Theme:</span>
                    <div className="font-medium mt-1">{result.primary_theme}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence:</span>
                    <div className="mt-1">{getConfidenceBadge(result.confidence_score)}</div>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(result)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <ClassificationDetailModal
        classification={selectedClassification}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};
