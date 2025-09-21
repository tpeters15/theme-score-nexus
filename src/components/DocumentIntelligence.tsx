import { useState, useEffect } from "react";
import { Search, Tag, FileText, Brain, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResearchDocument } from "@/types/framework";

interface DocumentIntelligenceProps {
  documents: ResearchDocument[];
  onDocumentSelect?: (document: ResearchDocument) => void;
  className?: string;
}

// Mock data for demonstration - in production this would come from AI analysis
const MOCK_KEYWORDS = [
  "ESG", "renewable energy", "sustainability", "carbon footprint", "climate risk",
  "market analysis", "financial performance", "regulatory compliance", "innovation",
  "digital transformation", "artificial intelligence", "blockchain", "cybersecurity"
];

const MOCK_INSIGHTS = [
  {
    id: "1",
    type: "trend",
    title: "Emerging ESG Focus",
    description: "Recent documents show increased emphasis on environmental sustainability",
    documentCount: 5,
    relevance: "high"
  },
  {
    id: "2", 
    type: "risk",
    title: "Regulatory Changes",
    description: "Multiple documents reference upcoming regulatory requirements",
    documentCount: 3,
    relevance: "medium"
  },
  {
    id: "3",
    type: "opportunity",
    title: "Technology Innovation",
    description: "Documents highlight AI and automation opportunities",
    documentCount: 4,
    relevance: "high"
  }
];

export function DocumentIntelligence({ documents, onDocumentSelect, className = "" }: DocumentIntelligenceProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<ResearchDocument[]>(documents);

  useEffect(() => {
    let filtered = documents;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected keywords (mock implementation)
    if (selectedKeywords.length > 0) {
      // In production, this would check against extracted keywords from documents
      filtered = filtered.filter(doc => {
        const docText = `${doc.title} ${doc.description || ""}`.toLowerCase();
        return selectedKeywords.some(keyword => 
          docText.includes(keyword.toLowerCase())
        );
      });
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, selectedKeywords]);

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "trend": return <TrendingUp className="h-4 w-4" />;
      case "risk": return <FileText className="h-4 w-4" />;
      case "opportunity": return <Brain className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case "high": return "bg-score-high text-score-high-foreground";
      case "medium": return "bg-score-medium text-score-medium-foreground";
      case "low": return "bg-score-low text-score-low-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Document Intelligence
          </CardTitle>
          <CardDescription>
            AI-powered analysis and search across {documents.length} documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents by title, content, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Keyword Filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="text-sm font-medium">Filter by Keywords</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {MOCK_KEYWORDS.map(keyword => (
                <Badge
                  key={keyword}
                  variant={selectedKeywords.includes(keyword) ? "default" : "outline"}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleKeyword(keyword)}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredDocuments.length} of {documents.length} documents
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Research Insights
            </CardTitle>
            <CardDescription>
              Automated analysis of document patterns and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_INSIGHTS.map(insight => (
                <div key={insight.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-1">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge 
                        className={getRelevanceColor(insight.relevance)}
                        variant="secondary"
                      >
                        {insight.relevance}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Based on {insight.documentCount} documents
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Results */}
      {filteredDocuments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredDocuments.map(document => (
                <div 
                  key={document.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onDocumentSelect?.(document)}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{document.title}</h4>
                      {document.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {document.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {document.document_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(document.created_at).toLocaleDateString()}
                        </span>
                        {document.file_size && (
                          <span className="text-xs text-muted-foreground">
                            {(document.file_size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : searchTerm || selectedKeywords.length > 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">No documents found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search terms or keyword filters
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedKeywords([]);
              }}
              className="mt-3"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}