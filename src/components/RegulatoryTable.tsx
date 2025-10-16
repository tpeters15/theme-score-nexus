import React, { useState, useMemo } from 'react';
import { ExternalLink, Calendar, AlertTriangle, Shield, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export interface Regulation {
  id: string;
  title: string;
  description: string;
  jurisdiction: string;
  regulation_type: string;
  status: string;
  impact_level: string;
  compliance_deadline?: string;
  effective_date?: string;
  source_url?: string;
  analysis_url?: string;
  regulatory_body: string;
  key_provisions: string[];
  relevance_score: number;
  impact_description: string;
  criteria_impacts: string[];
}

interface RegulatoryTableProps {
  regulations: Regulation[];
  onRegulationClick?: (regulation: Regulation) => void;
}

type SortField = 'title' | 'jurisdiction' | 'impact_level' | 'status' | 'compliance_deadline' | 'relevance_score';
type SortDirection = 'asc' | 'desc';

export function RegulatoryTable({ regulations, onRegulationClick }: RegulatoryTableProps) {
  const [sortField, setSortField] = useState<SortField>('relevance_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRegulations = useMemo(() => {
    return [...regulations].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'compliance_deadline') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [regulations, sortField, sortDirection]);

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'proposed': return 'bg-warning text-warning-foreground';
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'repealed': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getRelevanceStars = (score: number) => {
    return '★'.repeat(score) + '☆'.repeat(5 - score);
  };

  const toggleRowExpansion = (regulationId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(regulationId)) {
      newExpanded.delete(regulationId);
    } else {
      newExpanded.add(regulationId);
    }
    setExpandedRows(newExpanded);
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-semibold hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      {children}
      {sortField === field && (
        <span className="ml-1">
          {sortDirection === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </Button>
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  if (regulations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-muted-foreground">No regulatory data available</h3>
          <p className="text-sm text-muted-foreground">Regulatory information will appear here once available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Regulatory Environment ({regulations.length} regulations)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>
                <SortButton field="title">Regulation</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="jurisdiction">Jurisdiction</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="impact_level">Impact</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="status">Status</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="compliance_deadline">Deadline</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="relevance_score">Relevance</SortButton>
              </TableHead>
              <TableHead className="w-[180px]">Links</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRegulations.map((regulation) => (
              <React.Fragment key={regulation.id}>
                <TableRow 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onRegulationClick?.(regulation)}
                >
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRowExpansion(regulation.id);
                      }}
                    >
                      {expandedRows.has(regulation.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{regulation.title}</div>
                      <div className="text-sm text-muted-foreground">{regulation.regulation_type}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{regulation.jurisdiction}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(getImpactColor(regulation.impact_level))}>
                      {regulation.impact_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(getStatusColor(regulation.status))}>
                      {regulation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {regulation.compliance_deadline && (
                        <>
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">{formatDate(regulation.compliance_deadline)}</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-mono">{getRelevanceStars(regulation.relevance_score)}</span>
                      <span className="text-xs text-muted-foreground">({regulation.relevance_score}/5)</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {regulation.source_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(regulation.source_url, '_blank');
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Source
                        </Button>
                      )}
                      {regulation.analysis_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(regulation.analysis_url, '_blank');
                          }}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Analysis
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                
                {expandedRows.has(regulation.id) && (
                  <TableRow>
                    <TableCell colSpan={8} className="bg-muted/20 p-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">{regulation.description}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Impact on Theme</h4>
                          <p className="text-sm text-muted-foreground">{regulation.impact_description}</p>
                        </div>
                        
                        {regulation.key_provisions.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Key Provisions</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {regulation.key_provisions.map((provision, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  {provision}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span><strong>Regulatory Body:</strong> {regulation.regulatory_body}</span>
                          {regulation.effective_date && (
                            <span><strong>Effective:</strong> {formatDate(regulation.effective_date)}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}