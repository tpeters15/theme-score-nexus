import { AlertTriangle, Shield, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useHighImpactRegulations } from "@/hooks/useHighImpactRegulations";
import { Skeleton } from "@/components/ui/skeleton";

export function RegulatoryImpactAlerts() {
  const { regulations, loading, error } = useHighImpactRegulations();

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Regulatory Impact Alerts
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/regulatory-tracker">View All Regulations</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Regulatory Impact Alerts
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/regulatory-tracker">View All Regulations</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to load regulatory alerts. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200/50 bg-gradient-to-br from-orange-50/30 to-red-50/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-orange-500/10">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            Regulatory Alerts
          </CardTitle>
          <Button variant="outline" size="sm" asChild className="text-xs h-7">
            <a href="/regulatory-tracker">View All</a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {regulations.map((regulation) => {
          const daysUntilDeadline = regulation.compliance_deadline ? getDaysUntilDeadline(regulation.compliance_deadline) : null;
          
          return (
            <div
              key={regulation.id}
              className="p-3 rounded-lg border bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2">
                  <Shield className="h-3 w-3 text-muted-foreground mt-1 flex-shrink-0" />
                  <h4 className="font-medium text-sm leading-tight">{regulation.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-medium",
                    regulation.impact_level === "high" ? "text-red-600" : 
                    regulation.impact_level === "medium" ? "text-yellow-600" : "text-green-600"
                  )}>
                    {regulation.impact_level?.toUpperCase() || 'UNKNOWN'}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{regulation.relevance_score || 0}%</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2 leading-relaxed">
                {regulation.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{regulation.jurisdiction}</span>
                  <span>•</span>
                  <span>{regulation.regulatory_body}</span>
                  <span>•</span>
                  <span className="capitalize">{regulation.status}</span>
                </div>
                
                {regulation.compliance_deadline && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-orange-500" />
                    <span className={cn(
                      "text-xs font-medium",
                      daysUntilDeadline && daysUntilDeadline < 90 ? "text-red-600" : "text-muted-foreground"
                    )}>
                      {daysUntilDeadline && daysUntilDeadline > 0 
                        ? `${daysUntilDeadline} days left`
                        : daysUntilDeadline === 0
                        ? "Due today"
                        : "Overdue"
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
      </CardContent>
    </Card>
  );
}