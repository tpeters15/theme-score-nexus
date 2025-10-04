import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSources, useToggleSourceStatus } from "@/hooks/useSources";
import { useRawSignals } from "@/hooks/useRawSignals";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ExternalLink, Play, Pause, RefreshCw, Clock, Zap, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

export default function SourceProfile() {
  const { sourceId } = useParams<{ sourceId: string }>();
  const { data: sources } = useSources();
  const { data: allSignals } = useRawSignals();
  const toggleStatus = useToggleSourceStatus();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "all">("30d");

  const source = sources?.find((s) => s.id === sourceId);
  
  // Filter signals for this source
  const sourceSignals = allSignals?.filter((signal) => signal.source === source?.source_name) || [];
  
  // Filter by period
  const now = new Date();
  const filteredSignals = sourceSignals.filter((signal) => {
    if (selectedPeriod === "all") return true;
    const signalDate = new Date(signal.scraped_date);
    const daysAgo = selectedPeriod === "7d" ? 7 : 30;
    const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return signalDate > cutoff;
  });

  // Calculate stats
  const signalsLast7Days = sourceSignals.filter((signal) => {
    const signalDate = new Date(signal.scraped_date);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return signalDate > sevenDaysAgo;
  }).length;

  const signalsLast30Days = sourceSignals.filter((signal) => {
    const signalDate = new Date(signal.scraped_date);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return signalDate > thirtyDaysAgo;
  }).length;

  const handleToggleStatus = async () => {
    if (!source) return;
    
    try {
      const newStatus = source.status === "active" ? "paused" : "active";
      await toggleStatus.mutateAsync({ id: source.id, status: newStatus });
      toast({
        title: "Status updated",
        description: `Source ${newStatus === "active" ? "activated" : "paused"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update source status",
        variant: "destructive",
      });
    }
  };

  if (!source) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Source not found</p>
            <Button asChild className="mt-4">
              <Link to="/source-monitors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sources
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/source-monitors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{source.source_name}</h1>
            <Badge variant={source.status === "active" ? "default" : "secondary"}>
              {source.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ExternalLink className="h-4 w-4" />
            <a
              href={source.base_url || source.feed_url || source.api_endpoint}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {source.base_url || source.feed_url || source.api_endpoint}
            </a>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleToggleStatus}>
            {source.status === "active" ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </Button>
          <Button>
            <RefreshCw className="mr-2 h-4 w-4" />
            Check Now
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signals</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sourceSignals.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{signalsLast7Days}</div>
            <p className="text-xs text-muted-foreground">Recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{signalsLast30Days}</div>
            <p className="text-xs text-muted-foreground">Monthly total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Checked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {source.last_checked_at
                ? formatDistanceToNow(new Date(source.last_checked_at), { addSuffix: true })
                : "Never"}
            </div>
            <p className="text-xs text-muted-foreground">Check frequency: {source.check_frequency}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Discovered Signals</CardTitle>
              <CardDescription>
                Showing {filteredSignals.length} signals from this source
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === "7d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("7d")}
              >
                7 days
              </Button>
              <Button
                variant={selectedPeriod === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("30d")}
              >
                30 days
              </Button>
              <Button
                variant={selectedPeriod === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("all")}
              >
                All time
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Source Type</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Scraped</TableHead>
                <TableHead className="text-right">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSignals.slice(0, 50).map((signal) => (
                <TableRow key={signal.id}>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="font-medium truncate">{signal.title}</p>
                      {signal.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {signal.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{signal.source_type || "unknown"}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{signal.author || "-"}</TableCell>
                  <TableCell className="text-sm">
                    {formatDistanceToNow(new Date(signal.scraped_date), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {signal.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={signal.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSignals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No signals found for this period</p>
            </div>
          )}

          {filteredSignals.length > 50 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Showing 50 of {filteredSignals.length} signals
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
