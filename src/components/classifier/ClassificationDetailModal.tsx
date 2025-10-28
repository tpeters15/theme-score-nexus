import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Globe, Building2, Target, Layers, TrendingUp } from "lucide-react";

interface Classification {
  id: string;
  primary_theme: string;
  confidence_score: number;
  rationale: string;
  status: string;
  company_id: string;
  pillar: string;
  sector: string;
  business_model: string;
  context_metadata: any;
  updated_at: string;
  research_summary?: string;
  company?: {
    company_name: string;
    website_domain: string;
    classification_research_summary?: string;
  };
  theme?: {
    name: string;
    sector: {
      name: string;
      pillar: {
        name: string;
      };
    };
  };
}

interface ClassificationDetailModalProps {
  classification: Classification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClassificationDetailModal = ({ 
  classification, 
  open, 
  onOpenChange 
}: ClassificationDetailModalProps) => {
  if (!classification) return null;

  const getConfidenceBadgeVariant = (score: number) => {
    if (score >= 0.85) return "default";
    if (score >= 0.70) return "secondary";
    return "destructive";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge variant="default">Completed</Badge>;
      case "Processing":
        return <Badge variant="secondary">Processing</Badge>;
      case "Failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Queued</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {classification.company?.company_name || "Unknown Company"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-full max-h-[calc(90vh-8rem)] pr-4">
          <div className="space-y-6">
            {/* Company Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>{classification.company?.website_domain || "-"}</span>
              </div>
            </div>

            <Separator />

            {/* Classification Results */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Classification
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Pillar</p>
                  <p className="font-medium">
                    {classification.theme?.sector?.pillar?.name || classification.pillar || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Sector</p>
                  <p className="font-medium">
                    {classification.theme?.sector?.name || classification.sector || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Theme</p>
                  <p className="font-medium">
                    {classification.theme?.name || classification.primary_theme || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Business Model</p>
                  <p className="font-medium">{classification.business_model || "-"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Confidence & Status */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Assessment
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Confidence Score</p>
                  <div className="flex items-center gap-2">
                    {classification.confidence_score ? (
                      <Badge variant={getConfidenceBadgeVariant(classification.confidence_score)}>
                        {(classification.confidence_score * 100).toFixed(0)}%
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                    {classification.context_metadata?.reused_from_classification_id && (
                      <Badge variant="outline" className="text-xs">Reused</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Status</p>
                  {getStatusBadge(classification.status)}
                </div>
              </div>
            </div>

            <Separator />

            {/* Research Summary */}
            {(classification.company?.classification_research_summary || classification.research_summary) && (
              <>
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Research Summary
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
                      {classification.company?.classification_research_summary || classification.research_summary}
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Rationale */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Classification Rationale
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {classification.rationale || "No rationale provided"}
              </p>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Classified on {new Date(classification.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
