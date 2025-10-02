import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ExternalLink, Calendar, Clock, Search } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DiscoveredSignals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: signals, isLoading } = useQuery({
    queryKey: ["discovered-signals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("signals")
        .select("*")
        .eq("processing_status", "discovered")
        .order("publication_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Filter signals based on search and active tab
  const filteredSignals = signals?.filter((signal) => {
    const matchesSearch = signal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         signal.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "reports") return matchesSearch && signal.type === "report";
    if (activeTab === "news") return matchesSearch && signal.type === "news";
    return matchesSearch && signal.source === activeTab;
  });

  // Get unique sources for tabs
  const sources = [...new Set(signals?.map(s => s.source) || [])];
  const reportCount = signals?.filter(s => s.type === "report").length || 0;
  const newsCount = signals?.filter(s => s.type === "news").length || 0;

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Discovered Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Discovered Signals
          <Badge variant="secondary">{signals?.length || 0}</Badge>
        </CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search signals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(sources.length + 3, 5)}, 1fr)` }}>
            <TabsTrigger value="all">
              All <Badge variant="secondary" className="ml-1">{signals?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="reports">
              Reports <Badge variant="secondary" className="ml-1">{reportCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="news">
              News <Badge variant="secondary" className="ml-1">{newsCount}</Badge>
            </TabsTrigger>
            {sources.slice(0, 2).map(source => (
              <TabsTrigger key={source} value={source} className="truncate">
                {source.replace("IEA ", "")}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value={activeTab} className="mt-0">
              {filteredSignals && filteredSignals.length > 0 ? (
                <div className="space-y-3 pb-4">
                  {filteredSignals.map((signal) => (
                    <div
                      key={signal.id}
                      className="group p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start gap-2">
                            <h4 className="font-medium text-sm line-clamp-2 flex-1">{signal.title}</h4>
                            <Badge 
                              variant={signal.type === "report" ? "default" : "secondary"} 
                              className="text-xs shrink-0"
                            >
                              {signal.type}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="font-medium">{signal.source}</span>
                            
                            {signal.publication_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(signal.publication_date), "MMM d, yyyy")}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(signal.created_at), {
                                addSuffix: true,
                              })}
                            </div>
                          </div>
                        </div>
                        
                        {signal.document_url && (
                          <a
                            href={signal.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">
                  {searchQuery ? "No signals match your search" : "No discovered signals yet"}
                </p>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
