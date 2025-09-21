import React from 'react';
import { Shield, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Regulation } from './RegulatoryTable';

interface RegulatorySummaryCardProps {
  regulations: Regulation[];
}

export function RegulatorySummaryCard({ regulations }: RegulatorySummaryCardProps) {
  if (regulations.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            Regulatory Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <Shield className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">No regulatory data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate regulatory health metrics
  const totalRegulations = regulations.length;
  const highImpactCount = regulations.filter(r => r.impact_level === 'high').length;
  const activeRegulations = regulations.filter(r => r.status === 'active').length;
  const upcomingDeadlines = regulations.filter(r => {
    if (!r.compliance_deadline) return false;
    const deadline = new Date(r.compliance_deadline);
    const now = new Date();
    const threeMonthsFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000));
    return deadline > now && deadline <= threeMonthsFromNow;
  }).length;

  // Calculate average relevance score
  const averageRelevance = regulations.reduce((sum, r) => sum + r.relevance_score, 0) / totalRegulations;
  
  // Calculate regulatory health score (0-100)
  const healthScore = Math.round(
    (activeRegulations / totalRegulations) * 40 + // 40% weight for active regulations
    (averageRelevance / 5) * 30 + // 30% weight for relevance
    ((totalRegulations - highImpactCount) / totalRegulations) * 30 // 30% weight for low risk (fewer high-impact)
  );

  const getHealthColor = (score: number) => {
    if (score >= 75) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 75) return 'Good';
    if (score >= 50) return 'Moderate';
    return 'High Risk';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4" />
          Regulatory Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Regulatory Health Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Regulatory Health</span>
            <span className={cn("text-sm font-semibold", getHealthColor(healthScore))}>
              {getHealthLabel(healthScore)}
            </span>
          </div>
          <Progress value={healthScore} className="h-2" />
          <div className="text-xs text-muted-foreground text-right">{healthScore}/100</div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Regulations</span>
            </div>
            <div className="text-lg font-semibold">{totalRegulations}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-destructive" />
              <span className="text-xs text-muted-foreground">High Impact</span>
            </div>
            <div className="text-lg font-semibold text-destructive">{highImpactCount}</div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Status Breakdown</span>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              Active: {activeRegulations}
            </Badge>
            {upcomingDeadlines > 0 && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Clock className="h-2 w-2" />
                Deadlines: {upcomingDeadlines}
              </Badge>
            )}
          </div>
        </div>

        {/* Average Relevance */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Avg. Relevance</span>
            <span className="text-xs font-mono">
              {'★'.repeat(Math.round(averageRelevance))}{'☆'.repeat(5 - Math.round(averageRelevance))}
            </span>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            {averageRelevance.toFixed(1)}/5.0
          </div>
        </div>
      </CardContent>
    </Card>
  );
}