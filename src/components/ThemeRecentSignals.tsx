import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ExternalLink, Calendar } from "lucide-react";
import { useState } from "react";
import { ProcessedSignalDetailModal } from "@/components/ProcessedSignalDetailModal";
import { ProcessedSignal } from "@/hooks/useProcessedSignals";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ThemeRecentSignalsProps {
  themeId: string;
}

export function ThemeRecentSignals({ themeId }: ThemeRecentSignalsProps) {
  const [selectedSignal, setSelectedSignal] = useState<ProcessedSignal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: themeSignals, isLoading } = useQuery({
    queryKey: ['theme-signals', themeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('theme_signals')
        .select(`
          id,
          relevance_score,
          ai_analysis,
          processed_signal:processed_signals!inner (
            id,
            raw_signal_id,
            signal_type_classified,
            countries,
            content_snippet,
            extracted_deal_size,
            processed_timestamp,
            is_featured,
            raw_signal:raw_signals!raw_signal_id (
              signal_id,
              title,
              source,
              publication_date,
              url
            )
          )
        `)
        .eq('theme_id', themeId)
        .order('relevance_score', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      return data?.map(ts => ts.processed_signal as unknown as ProcessedSignal) || [];
    },
  });

  const openModal = (signal: ProcessedSignal) => {
    setSelectedSignal(signal);
    setIsModalOpen(true);
  };

  const getSourceColor = (source: string) => {
    if (source.includes('PitchBook')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (source.includes('Reuters')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    if (source.includes('Bloomberg')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    if (source.includes('FT')) return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  const getTypeColor = (type: string | null) => {
    if (!type) return 'bg-muted text-muted-foreground';
    if (type.includes('deal') || type.includes('funding')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (type.includes('market')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (type.includes('regulatory')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-muted text-muted-foreground';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Market Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!themeSignals || themeSignals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Market Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No relevant signals identified yet. Check back soon as our AI continuously monitors market activity.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Market Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themeSignals.map((signal) => (
              <div
                key={signal.id}
                onClick={() => openModal(signal)}
                className="group cursor-pointer rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {signal.raw_signal.title}
                    </h4>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>

                  {signal.content_snippet && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {signal.content_snippet}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className={getSourceColor(signal.raw_signal.source)}>
                      {signal.raw_signal.source}
                    </Badge>
                    {signal.signal_type_classified && (
                      <Badge className={getTypeColor(signal.signal_type_classified)}>
                        {signal.signal_type_classified}
                      </Badge>
                    )}
                    {signal.extracted_deal_size && (
                      <Badge variant="outline" className="font-mono">
                        {signal.extracted_deal_size}
                      </Badge>
                    )}
                  </div>

                  {signal.raw_signal.publication_date && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(signal.raw_signal.publication_date), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedSignal && (
        <ProcessedSignalDetailModal
          signal={selectedSignal}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </>
  );
}
