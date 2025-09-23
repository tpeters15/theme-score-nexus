import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Download, 
  Search, 
  Filter,
  FileText,
  Calendar,
  User,
  Tag,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useResearchDocuments } from "@/hooks/useResearchDocuments";
import { PILLAR_COLORS } from "@/types/themes";

export function ResearchLibrary() {
  const { data: documents, isLoading, error } = useResearchDocuments();
  const [searchQuery, setSearchQuery] = useState("");
  const [pillarFilter, setPillarFilter] = useState("all");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("all");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Research Library</h1>
            <p className="text-muted-foreground">Centralized repository of research documents and analysis</p>
          </div>
        </div>
        
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Research Library</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Failed to load research documents. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get unique values for filters
  const pillars = [...new Set(documents?.map(doc => doc.theme?.pillar).filter(Boolean) || [])];
  const documentTypes = [...new Set(documents?.map(doc => doc.document_type).filter(Boolean) || [])];

  // Filter documents
  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.theme?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPillar = pillarFilter === "all" || doc.theme?.pillar === pillarFilter;
    const matchesType = documentTypeFilter === "all" || doc.document_type === documentTypeFilter;
    
    return matchesSearch && matchesPillar && matchesType;
  }) || [];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getPillarColor = (pillar?: string) => {
    if (!pillar) return "bg-gray-100 text-gray-800 border-gray-200";
    return PILLAR_COLORS[pillar as keyof typeof PILLAR_COLORS] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            Research Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Centralized repository of {filteredDocuments.length} research documents and analysis
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>{filteredDocuments.length} documents</div>
          <div>Last updated: {documents?.[0] ? format(new Date(documents[0].updated_at), 'MMM dd, HH:mm') : '-'}</div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents by title, description, or theme..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={pillarFilter} onValueChange={setPillarFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by pillar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pillars</SelectItem>
                {pillars.map(pillar => (
                  <SelectItem key={pillar} value={pillar}>{pillar}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {documentTypes.map(type => (
                  <SelectItem key={type} value={type}>{type?.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No documents match your current filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg leading-tight">{document.title}</h3>
                      {document.file_path && (
                        <Button variant="ghost" size="sm" className="h-auto p-1">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {document.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {document.description}
                      </p>
                    )}

                    {/* Tags and Metadata */}
                    <div className="flex items-center flex-wrap gap-2 mb-3">
                      {document.theme && (
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getPillarColor(document.theme.pillar))}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {document.theme.name}
                        </Badge>
                      )}
                      
                      {document.theme?.pillar && (
                        <Badge variant="secondary" className="text-xs">
                          {document.theme.pillar}
                        </Badge>
                      )}
                      
                      {document.theme?.sector && (
                        <Badge variant="outline" className="text-xs">
                          {document.theme.sector}
                        </Badge>
                      )}

                      {document.document_type && (
                        <Badge variant="outline" className="text-xs">
                          {document.document_type.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>

                    {/* Document Details */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(document.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      
                      {document.file_size && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(document.file_size)}</span>
                        </>
                      )}
                      
                      {document.mime_type && (
                        <>
                          <span>•</span>
                          <span>{document.mime_type}</span>
                        </>
                      )}
                      
                      <span>•</span>
                      <span>ID: {document.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}