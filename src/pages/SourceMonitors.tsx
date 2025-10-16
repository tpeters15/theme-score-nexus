import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSources, useToggleSourceStatus, useTriggerScrape } from "@/hooks/useSources";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Plus, Search } from "lucide-react";
import { AddSourceDialog } from "@/components/sources/AddSourceDialog";
import { SourceStats } from "@/components/sources/SourceStats";
import { SourcesTableView } from "@/components/SourcesTableView";
import { PopulateSourcesButton } from "@/components/PopulateSourcesButton";


export default function SourceMonitors() {
  const { data: sources = [], isLoading } = useSources();
  const toggleStatus = useToggleSourceStatus();
  const triggerScrape = useTriggerScrape();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Filter sources
  const filteredSources = sources.filter((source) => {
    const matchesSearch = source.source_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || source.status === statusFilter;
    const matchesType = typeFilter === "all" || source.source_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleToggleSource = (sourceId: string) => {
    setSelectedSources((prev) =>
      prev.includes(sourceId)
        ? prev.filter((id) => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleToggleAll = () => {
    if (selectedSources.length === filteredSources.length) {
      setSelectedSources([]);
    } else {
      setSelectedSources(filteredSources.map((s) => s.id));
    }
  };

  const handleBulkAction = async (action: "activate" | "pause") => {
    const newStatus = action === "activate" ? "active" : "paused";
    
    for (const sourceId of selectedSources) {
      try {
        await toggleStatus.mutateAsync({ id: sourceId, status: newStatus });
      } catch (error) {
        console.error(`Failed to update source ${sourceId}:`, error);
      }
    }
    
    toast({
      title: "Bulk action completed",
      description: `${selectedSources.length} sources ${action}d`,
    });
    setSelectedSources([]);
  };

  const handleCheckNow = async (sourceId: string, sourceName: string) => {
    try {
      toast({
        title: "Starting scrape",
        description: `Checking ${sourceName}...`,
      });
      
      // TODO: Call edge function for single source scrape
      // For now, trigger global scrape
      await triggerScrape.mutateAsync();
      
      toast({
        title: "Scrape complete",
        description: `${sourceName} has been checked`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check source",
        variant: "destructive",
      });
    }
  };

  const handleRunAll = async () => {
    try {
      toast({
        title: "Starting scrape",
        description: "Checking all active sources...",
      });
      const result = await triggerScrape.mutateAsync();
      toast({
        title: "Scrape complete",
        description: `Found ${result?.results?.reduce((acc: number, r: any) => acc + (r.newUrls || 0), 0) || 0} new items`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger scrape",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  const activeCount = sources.filter((s) => s.status === "active").length;
  const uniqueTypes = [...new Set(sources.map((s) => s.source_type))];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Source Monitors</h1>
          <p className="text-muted-foreground mt-1">
            Manage automated intelligence collection from external sources
          </p>
        </div>
        <div className="flex gap-2">
          <PopulateSourcesButton />
          <Button onClick={handleRunAll} disabled={triggerScrape.isPending} variant="outline">
            {triggerScrape.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run All
              </>
            )}
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Source
          </Button>
        </div>
      </div>

      <SourceStats sources={sources} />

      {/* Sources Table */}
      <SourcesTableView 
        sources={filteredSources}
        onToggleStatus={(id, status) => toggleStatus.mutate({ id, status })}
        onCheckNow={handleCheckNow}
      />

      <AddSourceDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
