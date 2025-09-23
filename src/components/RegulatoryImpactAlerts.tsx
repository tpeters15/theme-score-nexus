import { AlertTriangle, Shield, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface RegulatoryAlert {
  id: string;
  title: string;
  description: string;
  impact_level: string;
  jurisdiction: string;
  regulatory_body: string;
  compliance_deadline?: string;
  effective_date?: string;
  status: string;
  relevance_score: number;
}

interface RegulatoryImpactAlertsProps {
  // For now, we'll use mock data until we have a way to fetch high-impact regulations
}

export function RegulatoryImpactAlerts({}: RegulatoryImpactAlertsProps) {
  // Mock high-impact regulatory alerts
  const alerts: RegulatoryAlert[] = [
    {
      id: "1",
      title: "EU Corporate Sustainability Reporting Directive (CSRD)",
      description: "New mandatory sustainability reporting requirements for large companies",
      impact_level: "high",
      jurisdiction: "European Union",
      regulatory_body: "European Commission",
      compliance_deadline: "2025-01-01",
      effective_date: "2024-01-05",
      status: "active",
      relevance_score: 95
    },
    {
      id: "2",
      title: "SEC Climate Risk Disclosure Rules",
      description: "Enhanced climate-related disclosure requirements for public companies",
      impact_level: "high",
      jurisdiction: "United States",
      regulatory_body: "Securities and Exchange Commission",
      compliance_deadline: "2025-03-15",
      effective_date: "2024-03-06",
      status: "active",
      relevance_score: 88
    },
    {
      id: "3",
      title: "UK Taxonomy Regulation",
      description: "Green taxonomy framework for sustainable finance classification",
      impact_level: "medium",
      jurisdiction: "United Kingdom",
      regulatory_body: "HM Treasury",
      compliance_deadline: "2024-12-31",
      effective_date: "2024-06-01",
      status: "pending",
      relevance_score: 82
    }
  ];

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

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Regulatory Impact Alerts
          </CardTitle>
          <Button variant="outline" size="sm">
            View All Regulations
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => {
          const daysUntilDeadline = alert.compliance_deadline ? getDaysUntilDeadline(alert.compliance_deadline) : null;
          
          return (
            <div
              key={alert.id}
              className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500 mt-0.5" />
                  <h4 className="font-medium text-sm leading-tight">{alert.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-xs", getImpactColor(alert.impact_level))}>
                    {alert.impact_level.toUpperCase()} IMPACT
                  </Badge>
                  <span className="text-xs text-muted-foreground">{alert.relevance_score}%</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {alert.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{alert.jurisdiction}</span>
                  <span>•</span>
                  <span>{alert.regulatory_body}</span>
                  <Badge variant="outline" className={cn("text-xs", getStatusColor(alert.status))}>
                    {alert.status.toUpperCase()}
                  </Badge>
                </div>
                
                {alert.compliance_deadline && (
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
        
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {alerts.length} high-priority alerts</span>
            <Button variant="ghost" size="sm" className="h-auto p-0 text-primary">
              <ExternalLink className="h-3 w-3 mr-1" />
              Regulatory Research
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}