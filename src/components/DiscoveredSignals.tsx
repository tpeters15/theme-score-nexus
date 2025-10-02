import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function DiscoveredSignals() {
  const { data: signals, isLoading } = useQuery({
    queryKey: ["discovered-signals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("signals")
        .select("*")
        .eq("processing_status", "discovered")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recently Discovered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recently Discovered
          {signals && signals.length > 0 && (
            <Badge variant="secondary">{signals.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {signals && signals.length > 0 ? (
          <div className="space-y-4">
            {signals.map((signal) => (
              <div
                key={signal.id}
                className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm line-clamp-1">{signal.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {signal.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{signal.source}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(signal.created_at), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                {signal.document_url && (
                  <a
                    href={signal.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No discovered signals yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
