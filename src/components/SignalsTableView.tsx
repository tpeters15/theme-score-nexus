import { useState } from "react";
import { ProcessedSignalData } from "@/data/processedSignals";
import { DataTable, DataTableColumn } from "@/components/ui/basic-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronDown, ChevronRight, Eye, MapPin } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SignalsTableViewProps {
  signals: ProcessedSignalData[];
  onSignalClick: (signal: ProcessedSignalData) => void;
}

export function SignalsTableView({ signals, onSignalClick }: SignalsTableViewProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'regulatory': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'market': return "bg-green-100 text-green-800 border-green-200";
      case 'deal_funding': return "bg-purple-100 text-purple-800 border-purple-200";
      case 'news': return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDaysOldBadge = (daysOld: number) => {
    if (daysOld === 0) return "bg-red-100 text-red-800";
    if (daysOld <= 2) return "bg-orange-100 text-orange-800";
    return "bg-muted text-muted-foreground";
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

  const columns: DataTableColumn<ProcessedSignalData>[] = [
    {
      key: '__expander' as keyof ProcessedSignalData,
      header: '',
      width: '40px',
      render: (value, signal) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(signal.signal_id);
          }}
          className="h-7 w-7 p-0"
        >
          {expandedRows.has(signal.signal_id) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ),
    },
    {
      key: 'title',
      header: 'Signal',
      sortable: true,
      filterable: true,
      width: '400px',
      render: (value) => (
        <div className="space-y-1">
          <div className="text-data-primary font-medium">{value as string}</div>
        </div>
      ),
    },
    {
      key: 'signal_type',
      header: 'Type',
      sortable: true,
      filterable: true,
      width: '150px',
      render: (value) => (
        <Badge variant="outline" className={cn("text-xs", getTypeColor(value as string))}>
          {(value as string).replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'countries',
      header: 'Countries',
      sortable: true,
      filterable: true,
      width: '150px',
      render: (value) => (
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{value as string}</span>
        </div>
      ),
    },
    {
      key: 'deal_size',
      header: 'Deal Size',
      sortable: true,
      width: '150px',
      render: (value) => (
        <span className="font-semibold text-green-700">
          {(value as string) || '-'}
        </span>
      ),
    },
    {
      key: 'days_old',
      header: 'Age',
      sortable: true,
      width: '100px',
      render: (value) => (
        <Badge variant="outline" className={cn("text-xs", getDaysOldBadge(value as number))}>
          {value}d
        </Badge>
      ),
    },
    {
      key: 'published_date',
      header: 'Published',
      sortable: true,
      width: '150px',
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(value as string), 'dd MMM yyyy')}
        </span>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      filterable: true,
      width: '200px',
      render: (value) => (
        <span className="text-sm text-muted-foreground">{value as string}</span>
      ),
    },
    {
      key: '__actions' as keyof ProcessedSignalData,
      header: '',
      width: '80px',
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
        </div>
      ),
    },
  ];

  const renderExpandedRow = (signal: ProcessedSignalData) => {
    if (!expandedRows.has(signal.signal_id)) return null;

    return (
      <div className="bg-muted/30 border-t border-border p-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Content Summary</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {signal.content_snippet}
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div>
              <span className="text-xs text-muted-foreground">Signal ID</span>
              <p className="font-mono text-xs font-medium mt-1">{signal.signal_id}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Countries</span>
              <p className="text-sm font-medium mt-1">{signal.countries}</p>
            </div>
            {signal.deal_size && (
              <div>
                <span className="text-xs text-muted-foreground">Deal Size</span>
                <p className="text-sm font-semibold text-green-700 mt-1">{signal.deal_size}</p>
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
