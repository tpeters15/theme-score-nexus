import { useRawSignals } from "@/hooks/useRawSignals";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Search, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DiscoveredSignals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: signals, isLoading } = useRawSignals();

  const filteredSignals = signals?.filter((signal) => {
    const matchesSearch =
      searchQuery === "" ||
      signal.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "reports") return matchesSearch && signal.source_type === "report";
    if (activeTab === "news") return matchesSearch && signal.source_type === "news";
    return matchesSearch && signal.source === activeTab;
  });

  const allCount = signals?.length || 0;
  const reportsCount = signals?.filter((s) => s.source_type === "report").length || 0;
  const newsCount = signals?.filter((s) => s.source_type === "news").length || 0;
  const sources = Array.from(new Set(signals?.map((s) => s.source) || []));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Raw Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Raw Signals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search raw signals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All ({allCount})
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex-1">
              Reports ({reportsCount})
            </TabsTrigger>
            <TabsTrigger value="news" className="flex-1">
              News ({newsCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3 mt-4">
            {filteredSignals && filteredSignals.length > 0 ? (
              filteredSignals.slice(0, 10).map((signal) => (
                <div
                  key={signal.id}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="font-medium text-sm mb-1 line-clamp-2">
                    {signal.title}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant="outline">{(signal.source_type || "Unknown").charAt(0).toUpperCase() + (signal.source_type || "Unknown").slice(1)}</Badge>
                    <Badge variant="secondary">{signal.source}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(signal.publication_date || signal.scraped_date).toLocaleDateString()}
                    </span>
                  </div>
                  {(signal.document_url || signal.url) && (
                    <a
                      href={signal.document_url || signal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Document
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                {searchQuery ? "No signals match your search" : "No raw signals yet"}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
