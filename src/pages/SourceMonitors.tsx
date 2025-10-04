import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useSources, useToggleSourceStatus, useTriggerScrape } from "@/hooks/useSources";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, RefreshCw, Plus, Activity, CheckCircle2, Clock, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AddSourceDialog } from "@/components/sources/AddSourceDialog";
import { SourceStats } from "@/components/sources/SourceStats";


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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSources.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedSources.length} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("activate")}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("pause")}
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedSources.length === filteredSources.length && filteredSources.length > 0}
                    onCheckedChange={handleToggleAll}
                  />
                </TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Last Checked</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSources.includes(source.id)}
                      onCheckedChange={() => handleToggleSource(source.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <Link
                        to={`/source/${source.id}`}
                        className="font-medium hover:underline"
                      >
                        {source.source_name}
                      </Link>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {source.base_url || source.feed_url || source.api_endpoint}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{source.source_type.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={source.status === "active" ? "default" : "secondary"}>
                      {source.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{source.check_frequency}</TableCell>
                  <TableCell>
                    {source.last_checked_at ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatDistanceToNow(new Date(source.last_checked_at), {
                          addSuffix: true,
                        })}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCheckNow(source.id, source.source_name)}
                        disabled={triggerScrape.isPending}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleStatus.mutate({
                          id: source.id,
                          status: source.status === "active" ? "paused" : "active"
                        })}
                      >
                        {source.status === "active" ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "No sources match your filters"
                  : "No sources configured yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddSourceDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
