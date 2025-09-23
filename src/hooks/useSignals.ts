import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Signal {
  id: string;
  signal_id: string;
  internal_id?: string;
  topic_id?: string;
  url?: string;
  title: string;
  description?: string;
  source: string;
  type: string;
  author?: string;
  created_at: string;
  updated_at: string;
}

export function useSignals() {
  return useQuery({
    queryKey: ["signals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("signals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data as Signal[];
    },
  });
}

export function useRecentSignals(limit: number = 4) {
  return useQuery({
    queryKey: ["signals", "recent", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("signals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data as Signal[];
    },
  });
}