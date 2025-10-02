import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSourceMonitors, useToggleMonitorStatus, useTriggerScrape } from "@/hooks/useSourceMonitors";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, RefreshCw, ExternalLink, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DiscoveredSignals } from "@/components/DiscoveredSignals";

export default function SourceMonitors() {
  const { data: monitors, isLoading } = useSourceMonitors();
  const toggleStatus = useToggleMonitorStatus();
  const triggerScrape = useTriggerScrape();
  const { toast } = useToast();

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "paused" : "active";
      await toggleStatus.mutateAsync({ id, status: newStatus });
      toast({
        title: "Status updated",
        description: `Monitor ${newStatus === "active" ? "activated" : "paused"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update monitor status",
        variant: "destructive",
      });
    }
  };

  const handleTriggerScrape = async () => {
    try {
      toast({
        title: "Starting scrape",
        description: "Checking for new publications...",
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
      <AppLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Source Monitors</h1>
            <p className="text-muted-foreground mt-1">
              Automated monitoring of external intelligence sources
            </p>
          </div>
          <Button
            onClick={handleTriggerScrape}
            disabled={triggerScrape.isPending}
            size="lg"
          >
            {triggerScrape.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Now
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {monitors?.map((monitor) => (
            <Card key={monitor.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {monitor.source_name}
                      <Badge variant={monitor.status === "active" ? "default" : "secondary"}>
                        {monitor.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      <a 
                        href={monitor.base_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {monitor.base_url}
                      </a>
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(monitor.id, monitor.status)}
                    disabled={toggleStatus.isPending}
                  >
                    {monitor.status === "active" ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Check Frequency</p>
                    <p className="font-medium capitalize">{monitor.check_frequency}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Source Type</p>
                    <p className="font-medium uppercase">{monitor.source_type}</p>
                  </div>
                </div>
                
                {monitor.last_checked_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      Last checked{" "}
                      {formatDistanceToNow(new Date(monitor.last_checked_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
              ))}
            </div>

            {monitors?.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">No source monitors configured</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <DiscoveredSignals />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
