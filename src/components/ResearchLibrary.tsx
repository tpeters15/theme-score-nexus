import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Search } from "lucide-react";
import { format } from "date-fns";
import { useResearchDocuments } from "@/hooks/useResearchDocuments";
import { ResearchTableView } from "@/components/ResearchTableView";

export function ResearchLibrary() {
  const { data: documents, isLoading, error } = useResearchDocuments();
  const [searchQuery, setSearchQuery] = useState("");
  const [pillarFilter, setPillarFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [themeFilter, setThemeFilter] = useState("all");
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
  const sectors = [...new Set(documents?.map(doc => doc.theme?.sector).filter(Boolean) || [])];
  const themes = [...new Set(documents?.map(doc => doc.theme?.name).filter(Boolean) || [])];
  const documentTypes = [...new Set(documents?.map(doc => doc.document_type).filter(Boolean) || [])];

  // Filter documents
  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.theme?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPillar = pillarFilter === "all" || doc.theme?.pillar === pillarFilter;
    const matchesSector = sectorFilter === "all" || doc.theme?.sector === sectorFilter;
    const matchesTheme = themeFilter === "all" || doc.theme?.name === themeFilter;
    const matchesType = documentTypeFilter === "all" || doc.document_type === documentTypeFilter;
    
    return matchesSearch && matchesPillar && matchesSector && matchesTheme && matchesType;
  }) || [];


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
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={themeFilter} onValueChange={setThemeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Themes</SelectItem>
                {themes.map(theme => (
                  <SelectItem key={theme} value={theme}>{theme}</SelectItem>
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

      {/* Documents Table */}
      <ResearchTableView documents={filteredDocuments} />
    </div>
  );
}