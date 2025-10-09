import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/basic-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronRight, 
  Download, 
  FileText, 
  Calendar 
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PILLAR_COLORS } from "@/types/themes";

interface ResearchDocument {
  id: string;
  title: string;
  description?: string;
  document_type?: string;
  file_path?: string;
  file_size?: number;
  created_at: string;
  updated_at: string;
  theme?: {
    id: string;
    name: string;
    pillar?: string;
    sector?: string;
  };
  criteria?: {
    name: string;
  };
}

interface ResearchTableViewProps {
  documents: ResearchDocument[];
}

export function ResearchTableView({ documents }: ResearchTableViewProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const getPillarColor = (pillar?: string) => {
    if (!pillar) return "bg-gray-100 text-gray-800 border-gray-200";
    return PILLAR_COLORS[pillar as keyof typeof PILLAR_COLORS] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getThemeColor = (themeName?: string) => {
    if (!themeName) return "bg-gray-100 text-gray-800 border-gray-200";
    
    let hash = 0;
    for (let i = 0; i < themeName.length; i++) {
      hash = themeName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colorPalettes = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200", 
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-orange-100 text-orange-800 border-orange-200",
      "bg-teal-100 text-teal-800 border-teal-200",
    ];
    
    return colorPalettes[Math.abs(hash) % colorPalettes.length];
  };

  const getDocTypeColor = (type?: string) => {
    switch (type) {
      case 'research_report': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'market_analysis': return "bg-green-100 text-green-800 border-green-200";
      case 'technical_brief': return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const toggleExpand = (docId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const columns: DataTableColumn<ResearchDocument>[] = [
    {
      key: 'id',
      header: '',
      width: '40px',
      render: (value, doc) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(doc.id);
          }}
          className="h-7 w-7 p-0"
        >
          {expandedRows.has(doc.id) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ),
    },
    {
      key: 'title',
      header: 'Document Title',
      sortable: true,
      filterable: true,
      width: '350px',
      render: (value, doc) => (
        <div className="space-y-1">
          <div className="text-data-primary font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {doc.title}
          </div>
          <div className="text-data-secondary truncate max-w-md text-xs">
            {doc.description || "No description available"}
          </div>
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Theme',
      sortable: true,
      filterable: true,
      width: '200px',
      render: (value, doc) => (
        doc.theme ? (
          <Badge variant="outline" className={cn("text-xs", getThemeColor(doc.theme.name))}>
            {doc.theme.name}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">No theme</span>
        )
      ),
    },
    {
      key: 'id',
      header: 'Pillar',
      sortable: true,
      filterable: true,
      width: '150px',
      render: (value, doc) => (
        doc.theme?.pillar ? (
          <Badge variant="outline" className={cn("text-xs", getPillarColor(doc.theme.pillar))}>
            {doc.theme.pillar}
          </Badge>
        ) : null
      ),
    },
    {
      key: 'document_type',
      header: 'Type',
      sortable: true,
      filterable: true,
      width: '150px',
      render: (value) => (
        <Badge variant="outline" className={cn("text-xs", getDocTypeColor(value as string))}>
          {value?.toString().replace('_', ' ') || "Document"}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      sortable: true,
      width: '150px',
      render: (value) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{format(new Date(value as string), 'MMM dd, yyyy')}</span>
        </div>
      ),
    },
    {
      key: 'id',
      header: '',
      width: '80px',
      render: (value, doc) => (
        <div className="flex items-center gap-1">
          {doc.file_path && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Download logic here
              }}
              className="h-7 w-7 p-0"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const renderExpandedRow = (doc: ResearchDocument) => {
    if (!expandedRows.has(doc.id)) return null;

    return (
      <div className="bg-muted/30 border-t border-border p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {doc.description || "No description available"}
              </p>
            </div>
            
            {doc.theme && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Related Theme</h4>
                <div className="space-y-1">
                  <div className="text-sm font-medium">{doc.theme.name}</div>
                  {doc.theme.sector && (
                    <div className="text-xs text-muted-foreground">Sector: {doc.theme.sector}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File Size:</span>
                  <span className="font-medium">{formatFileSize(doc.file_size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="font-medium">{format(new Date(doc.updated_at), 'MMM dd, yyyy')}</span>
                </div>
                {doc.criteria && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Criteria:</span>
                    <span className="font-medium">{doc.criteria.name}</span>
                  </div>
                )}
              </div>
            </div>

            {doc.file_path && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs w-full"
                >
                  <Download className="h-3 w-3 mr-2" />
                  Download Document
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
      data={documents}
      columns={columns}
      searchable={false}
      itemsPerPage={15}
      showPagination={true}
      hoverable={true}
      bordered={true}
      emptyMessage="No research documents found"
      className="surface-elevated"
      expandedRowRender={renderExpandedRow}
    />
  );
}
