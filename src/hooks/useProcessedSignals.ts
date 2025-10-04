import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProcessedSignal {
  id: string;
  raw_signal_id: string;
  signal_type_classified?: string;
  countries?: string[];
  content_snippet?: string;
  week_processed?: string;
  days_old_when_processed?: number;
  content_length?: number;
  credibility_score?: number;
  extracted_deal_size?: string;
  has_pitchbook_data?: boolean;
  memo_section?: string;
  memo_analysis?: string;
  memo_published_at?: string;
  analysis_priority?: number;
  processed_timestamp: string;
  processed_by?: string;
  // Joined raw signal data
  raw_signal?: {
    id: string;
    signal_id: string;
    url?: string;
    title: string;
    description?: string;
    source: string;
    source_type?: string;
    author?: string;
    publication_date?: string;
    scraped_date: string;
  };
}

export function useProcessedSignals() {
  return useQuery({
    queryKey: ["processed-signals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processed_signals")
        .select(`
          *,
          raw_signal:raw_signals(
            id,
            signal_id,
            url,
            title,
            description,
            source,
            source_type,
            author,
            publication_date,
            scraped_date
          )
        `)
        .order("processed_timestamp", { ascending: false });

      if (error) throw error;
      return data as ProcessedSignal[];
    },
  });
}

export function useRecentProcessedSignals(limit: number = 4) {
  return useQuery({
    queryKey: ["processed-signals", "recent", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processed_signals")
        .select(`
          *,
          raw_signal:raw_signals(
            id,
            signal_id,
            url,
            title,
            description,
            source,
            source_type,
            author,
            publication_date,
            scraped_date
          )
        `)
        .order("processed_timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ProcessedSignal[];
    },
  });
}
