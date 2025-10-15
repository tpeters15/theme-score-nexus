import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileText, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Regulation } from "@/types/regulatory";
import { ResearchDocument } from "@/types/framework";

interface QuickInsightsProps {
  regulations: Regulation[];
  recentDocuments: ResearchDocument[];
}

export const QuickInsights = ({ regulations, recentDocuments }: QuickInsightsProps) => {
  // Get top 3 high-impact regulations based on relevance_score
  const highImpactRegs = regulations
    .filter(r => r.relevance_score >= 70)
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, 3);

  // Get 3 most recent documents
  const recentDocs = recentDocuments
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  const getImpactColor = (score: number) => {
    if (score >= 80) return "destructive";
    if (score >= 70) return "default";
    return "secondary";
  };

  return (
    <div className="space-y-4">
      {/* High Impact Regulations */}
      {highImpactRegs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              High Impact Alerts
            </CardTitle>
            <CardDescription className="text-xs">
              Regulations requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {highImpactRegs.map((reg) => (
              <div key={reg.id} className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium line-clamp-2 flex-1">
                    {reg.title}
                  </p>
                  <Badge variant={getImpactColor(reg.relevance_score)} className="text-xs shrink-0">
                    {reg.relevance_score}
                  </Badge>
                </div>
                {reg.effective_date && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(reg.effective_date), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Research */}
      {recentDocs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Recent Research
            </CardTitle>
            <CardDescription className="text-xs">
              Latest uploaded documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDocs.map((doc) => (
              <div key={doc.id} className="space-y-1">
                <p className="text-xs font-medium line-clamp-2">
                  {doc.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(doc.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {highImpactRegs.length === 0 && recentDocs.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No insights available yet
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
