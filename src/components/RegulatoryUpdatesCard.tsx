import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Regulation } from './RegulatoryTable';

interface RegulatoryUpdatesCardProps {
  regulations: Regulation[];
}

export function RegulatoryUpdatesCard({ regulations }: RegulatoryUpdatesCardProps) {
  if (regulations.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            Regulatory Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">No updates available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Recent regulations (last 3 months)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const recentRegulations = regulations
    .filter(r => {
      const effectiveDate = r.effective_date ? new Date(r.effective_date) : null;
      return effectiveDate && effectiveDate >= threeMonthsAgo;
    })
    .sort((a, b) => {
      const dateA = a.effective_date ? new Date(a.effective_date).getTime() : 0;
      const dateB = b.effective_date ? new Date(b.effective_date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  // Upcoming deadlines
  const now = new Date();
  const upcomingDeadlines = regulations
    .filter(r => {
      const deadline = r.compliance_deadline ? new Date(r.compliance_deadline) : null;
      return deadline && deadline > now;
    })
    .sort((a, b) => {
      const dateA = a.compliance_deadline ? new Date(a.compliance_deadline).getTime() : 0;
      const dateB = b.compliance_deadline ? new Date(b.compliance_deadline).getTime() : 0;
      return dateA - dateB;
    })
    .slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getImpactIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'low':
        return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4" />
          Regulatory Updates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recent Regulations */}
        {recentRegulations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Recent Changes
            </h4>
            <div className="space-y-3">
              {recentRegulations.map((regulation) => (
                <div key={regulation.id} className="space-y-1.5 pb-3 border-b last:border-0 last:pb-0">
                  <div className="flex items-start gap-2">
                    {getImpactIcon(regulation.impact_level)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2 leading-tight">
                        {regulation.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {regulation.jurisdiction}
                        </Badge>
                        {regulation.effective_date && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(regulation.effective_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Upcoming Deadlines
            </h4>
            <div className="space-y-3">
              {upcomingDeadlines.map((regulation) => (
                <div key={regulation.id} className="space-y-1.5 pb-3 border-b last:border-0 last:pb-0">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2 leading-tight">
                        {regulation.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className="text-xs">
                          {regulation.jurisdiction}
                        </Badge>
                        {regulation.compliance_deadline && (
                          <span className="text-xs font-semibold text-warning">
                            Due: {formatDate(regulation.compliance_deadline)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state if no recent or upcoming items */}
        {recentRegulations.length === 0 && upcomingDeadlines.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle2 className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">All regulations up to date</p>
            <p className="text-xs">No recent changes or upcoming deadlines</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
