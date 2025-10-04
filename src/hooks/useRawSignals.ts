import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RawSignal {
  id: string;
  signal_id: string;
  fingerprint?: string;
  original_id?: string;
  url?: string;
  title: string;
  raw_content?: string;
  description?: string;
  source_id?: string;
  source: string;
  source_type?: string;
  author?: string;
  publication_date?: string;
  scraped_date: string;
  file_path?: string;
  document_url?: string;
  created_at: string;
}

export function useRawSignals() {
  return useQuery({
    queryKey: ["raw-signals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("raw_signals")
        .select("*")
        .order("scraped_date", { ascending: false });

      if (error) throw error;
      return data as RawSignal[];
    },
  });
}

export function useRecentRawSignals(limit: number = 4) {
  return useQuery({
    queryKey: ["raw-signals", "recent", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("raw_signals")
        .select("*")
        .order("scraped_date", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as RawSignal[];
    },
  });
}
