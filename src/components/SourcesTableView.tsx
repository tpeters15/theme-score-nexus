import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/basic-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Play, Pause, RefreshCw, ExternalLink, Clock, CheckCircle2, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Source {
  id: string;
  source_name: string;
  source_type: string;
  status: string;
  base_url?: string;
  feed_url?: string;
  last_checked_at?: string;
  last_success_at?: string;
  check_frequency: string;
  error_message?: string;
}

interface SourcesTableViewProps {
  sources: Source[];
  onToggleStatus: (id: string, status: string) => void;
  onCheckNow: (id: string, name: string) => void;
}

export function SourcesTableView({ sources, onToggleStatus, onCheckNow }: SourcesTableViewProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return "bg-green-100 text-green-800 border-green-200";
      case 'paused': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'error': return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rss': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'api': return "bg-purple-100 text-purple-800 border-purple-200";
      case 'web': return "bg-cyan-100 text-cyan-800 border-cyan-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const toggleExpand = (sourceId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sourceId)) {
        newSet.delete(sourceId);
      } else {
        newSet.add(sourceId);
      }
      return newSet;
    });
  };

  const columns: DataTableColumn<Source>[] = [
    {
      key: 'id',
      header: '',
      width: '40px',
      render: (value, source) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(source.id);
          }}
          className="h-7 w-7 p-0"
        >
          {expandedRows.has(source.id) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ),
    },
    {
      key: 'source_name',
      header: 'Source Name',
      sortable: true,
      filterable: true,
      width: '300px',
      render: (value, source) => (
        <div className="space-y-1">
          <div className="text-data-primary font-medium">{value}</div>
          <div className="text-data-secondary text-xs truncate max-w-sm">
            {source.base_url || source.feed_url || "No URL configured"}
          </div>
        </div>
      ),
    },
    {
      key: 'source_type',
      header: 'Type',
      sortable: true,
      filterable: true,
      width: '120px',
      render: (value) => (
        <Badge variant="outline" className={cn("text-xs", getTypeColor(value as string))}>
          {value?.toString().toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      width: '120px',
      render: (value) => (
        <Badge variant="outline" className={cn("text-xs", getStatusColor(value as string))}>
          {value === 'active' && <CheckCircle2 className="h-3 w-3 mr-1" />}
          {value === 'paused' && <Clock className="h-3 w-3 mr-1" />}
          {value === 'error' && <Activity className="h-3 w-3 mr-1" />}
          {value?.toString().toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'check_frequency',
      header: 'Frequency',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className="text-sm text-muted-foreground capitalize">{value}</span>
      ),
    },
    {
      key: 'last_checked_at',
      header: 'Last Checked',
      sortable: true,
      width: '180px',
      render: (value) => (
        <div className="text-sm text-muted-foreground">
          {value ? formatDistanceToNow(new Date(value as string), { addSuffix: true }) : 'Never'}
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      width: '150px',
      render: (value, source) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(source.id, source.status === 'active' ? 'paused' : 'active');
            }}
            className="h-7 w-7 p-0"
          >
            {source.status === 'active' ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCheckNow(source.id, source.source_name);
            }}
            className="h-7 w-7 p-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Link to={`/source/${source.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const renderExpandedRow = (source: Source) => {
    if (!expandedRows.has(source.id)) return null;

    return (
      <div className="bg-muted/30 border-t border-border p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Configuration</h4>
              <div className="space-y-2 text-sm">
                {source.base_url && (
                  <div>
                    <span className="text-muted-foreground">Base URL:</span>
                    <div className="font-medium font-mono text-xs mt-1 break-all">{source.base_url}</div>
                  </div>
                )}
                {source.feed_url && (
                  <div>
                    <span className="text-muted-foreground">Feed URL:</span>
                    <div className="font-medium font-mono text-xs mt-1 break-all">{source.feed_url}</div>
                  </div>
                )}
              </div>
            </div>

            {source.error_message && (
              <div>
                <h4 className="text-sm font-semibold text-red-600 mb-2">Error</h4>
                <p className="text-sm text-red-600">{source.error_message}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Status Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check Frequency:</span>
                  <span className="font-medium capitalize">{source.check_frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Success:</span>
                  <span className="font-medium">
                    {source.last_success_at 
                      ? formatDistanceToNow(new Date(source.last_success_at), { addSuffix: true })
                      : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link to={`/source/${source.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs w-full"
                >
                  View Full Profile →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DataTable
      data={sources}
      columns={columns}
      searchable={false}
      itemsPerPage={15}
      showPagination={true}
      hoverable={true}
      bordered={true}
      emptyMessage="No sources found"
      onRowClick={(source) => {}}
      className="surface-elevated"
      expandedRowRender={renderExpandedRow}
    />
  );
}
