import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProcessedSignal {
  id: string;
  raw_signal_id: string;
  signal_type_classified: string | null;
  countries: string[] | null;
  content_snippet: string | null;
  extracted_deal_size: string | null;
  processed_timestamp: string;
  is_featured: boolean | null;
  raw_signal: {
    signal_id: string;
    title: string;
    source: string;
    publication_date: string | null;
    url: string | null;
  };
}

export function useProcessedSignalsFeatured() {
  return useQuery({
    queryKey: ['processed-signals-featured'],
    queryFn: async () => {
      const { data, error } = await supabase
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
          raw_signal:raw_signals!raw_signal_id (
            signal_id,
            title,
            source,
            publication_date,
            url
          )
        `)
        .eq('is_featured', true)
        .order('processed_timestamp', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching featured signals:', error);
        throw error;
      }

      return data as ProcessedSignal[];
    },
  });
}
