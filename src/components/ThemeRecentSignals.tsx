import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, ExternalLink, Calendar, X } from "lucide-react";
import { useState } from "react";
import { ProcessedSignalDetailModal } from "@/components/ProcessedSignalDetailModal";
import { ProcessedSignal } from "@/hooks/useProcessedSignals";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { removeThemeSignals } from "@/utils/removeThemeSignals";
import { toast } from "sonner";

interface ThemeRecentSignalsProps {
  themeId: string;
}

interface ThemeSignalWithId {
  theme_signal_id: string;
  processed_signal_id: string;
  relevance_score: number | null;
  ai_analysis: string | null;
}

export function ThemeRecentSignals({ themeId }: ThemeRecentSignalsProps) {
  const [selectedSignal, setSelectedSignal] = useState<ProcessedSignal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: themeSignals, isLoading } = useQuery({
    queryKey: ['theme-signals', themeId],
    queryFn: async () => {
      // First get the theme_signals with processed_signal_id and theme_signal id
      const { data: themeSigs, error: themeSigsError } = await supabase
        .from('theme_signals')
        .select('id, processed_signal_id, relevance_score, ai_analysis')
        .eq('theme_id', themeId)
        .order('relevance_score', { ascending: false })
        .limit(5);

      if (themeSigsError) throw themeSigsError;
      if (!themeSigs || themeSigs.length === 0) return [];

      // Get all the processed signal IDs
      const signalIds = themeSigs.map(ts => ts.processed_signal_id);

      // Fetch the actual signals with their raw data
      const { data: signals, error: signalsError } = await supabase
        .from('processed_signals')
        .select(`
          id,
          raw_signal_id,
          signal_type_classified,
          countries,
          content_snippet,
          extracted_deal_size,
          processed_timestamp,
          is_featured,
          raw_signals!raw_signal_id (
            signal_id,
            title,
            source,
            publication_date,
            url
          )
        `)
        .in('id', signalIds);

      if (signalsError) throw signalsError;
      if (!signals) return [];

      // Combine the data - match signals by ID to preserve relevance order
      return themeSigs
        .map(ts => {
          const signal = signals.find(s => s.id === ts.processed_signal_id);
          if (!signal) return null;
          return {
            ...signal,
            raw_signal: Array.isArray(signal.raw_signals) ? signal.raw_signals[0] : signal.raw_signals,
            theme_signal_id: ts.id // Store the theme_signal ID for deletion
          } as ProcessedSignal & { theme_signal_id: string };
        })
        .filter((s): s is ProcessedSignal & { theme_signal_id: string } => s !== null);
    },
  });

  const handleRemoveSignal = async (e: React.MouseEvent, themeSignalId: string, signalTitle: string) => {
    e.stopPropagation();
    
    try {
      await removeThemeSignals([themeSignalId]);
      toast.success(`Removed "${signalTitle}" from this theme`);
      queryClient.invalidateQueries({ queryKey: ['theme-signals', themeId] });
    } catch (error) {
      console.error('Error removing signal:', error);
      toast.error('Failed to remove signal');
    }
  };

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
                className="group cursor-pointer rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors relative"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => handleRemoveSignal(e, signal.theme_signal_id, signal.raw_signal.title)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors pr-6">
                      {signal.raw_signal.title}
                    </h4>
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
