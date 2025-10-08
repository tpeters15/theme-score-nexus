import { useState } from "react";
import { ProcessedSignal } from "@/hooks/useProcessedSignals";
import { DataTable, DataTableColumn } from "@/components/ui/basic-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronDown, ChevronRight, Eye, Clock, Building2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SignalsTableViewProps {
  signals: ProcessedSignal[];
  onSignalClick: (signal: ProcessedSignal) => void;
}

export function SignalsTableView({ signals, onSignalClick }: SignalsTableViewProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'PitchBook Alert': return "bg-orange-100 text-orange-800 border-orange-200";
      case 'Bloomberg Green': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'Carbon Brief Daily': return "bg-green-100 text-green-800 border-green-200";
      case 'Financial Times': return "bg-pink-100 text-pink-800 border-pink-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email_alert': return "bg-purple-100 text-purple-800 border-purple-200";
      case 'rss': return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case 'html': return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const toggleExpand = (signalId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(signalId)) {
        newSet.delete(signalId);
      } else {
        newSet.add(signalId);
      }
      return newSet;
    });
  };

  const columns: DataTableColumn<ProcessedSignal>[] = [
    {
      key: 'id',
      header: '',
      width: '40px',
      render: (value, signal) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(signal.id);
          }}
          className="h-7 w-7 p-0"
        >
          {expandedRows.has(signal.id) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ),
    },
    {
      key: 'id',
      header: 'Signal',
      sortable: true,
      filterable: true,
      width: '400px',
      render: (value, signal) => (
        <div className="space-y-1">
          <div className="text-data-primary font-medium">{signal.raw_signal?.title || "Untitled"}</div>
          <div className="text-data-secondary truncate max-w-md text-xs">
            {signal.content_snippet || signal.raw_signal?.description || "No description available"}
          </div>
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Source',
      sortable: true,
      filterable: true,
      width: '200px',
      render: (value, signal) => (
        <Badge variant="outline" className={cn("text-xs", getSourceColor(signal.raw_signal?.source || ""))}>
          <Building2 className="h-3 w-3 mr-1" />
          {signal.raw_signal?.source || "Unknown"}
        </Badge>
      ),
    },
    {
      key: 'signal_type_classified',
      header: 'Type',
      sortable: true,
      filterable: true,
      width: '150px',
      render: (value) => (
        <Badge variant="outline" className={cn("text-xs", getTypeColor(value as string || ""))}>
          {value?.toString().replace('_', ' ') || "Unclassified"}
        </Badge>
      ),
    },
    {
      key: 'processed_timestamp',
      header: 'Date',
      sortable: true,
      width: '180px',
      render: (value, signal) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{format(new Date(signal.raw_signal?.scraped_date || signal.processed_timestamp), 'MMM dd, yyyy')}</span>
        </div>
      ),
    },
    {
      key: 'id',
      header: '',
      width: '100px',
      render: (value, signal) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSignalClick(signal);
            }}
            className="h-7 w-7 p-0"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          {signal.raw_signal?.url && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0" 
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <a href={signal.raw_signal.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>
      ),
    },
  ];

  const renderExpandedRow = (signal: ProcessedSignal) => {
    if (!expandedRows.has(signal.id)) return null;

    return (
      <div className="bg-muted/30 border-t border-border p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {signal.raw_signal?.description || signal.content_snippet || "No description available"}
              </p>
            </div>
            
            {signal.memo_analysis && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Analysis</h4>
                <p className="text-sm text-muted-foreground">{signal.memo_analysis}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Details</h4>
              <div className="space-y-2 text-sm">
                {signal.raw_signal?.author && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Author:</span>
                    <span className="font-medium">{signal.raw_signal.author}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Signal ID:</span>
                  <span className="font-medium font-mono text-xs">{signal.raw_signal?.signal_id}</span>
                </div>
                {signal.credibility_score && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credibility:</span>
                    <span className="font-medium">{signal.credibility_score}/10</span>
                  </div>
                )}
              </div>
            </div>

            {signal.raw_signal?.url && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(signal.raw_signal.url, '_blank')}
                  className="text-xs w-full"
                >
                  View Original Source →
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DataTable
      data={signals}
      columns={columns}
      searchable={false}
      itemsPerPage={15}
      showPagination={true}
      hoverable={true}
      bordered={true}
      emptyMessage="No signals found"
      onRowClick={onSignalClick}
      className="surface-elevated"
      expandedRowRender={renderExpandedRow}
    />
  );
}
