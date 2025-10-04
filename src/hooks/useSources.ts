import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Source {
  id: string;
  source_name: string;
  source_type: string;
  status: string;
  base_url?: string;
  feed_url?: string;
  api_endpoint?: string;
  field_mappings?: Record<string, any>;
  scraping_config?: Record<string, any>;
  check_frequency: string;
  last_checked_at?: string;
  last_success_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export function useSources() {
  return useQuery({
    queryKey: ["sources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Source[];
    },
  });
}

export function useToggleSourceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("sources")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
    },
  });
}

export function useTriggerScrape() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("scrape-iea-sources");

      if (error) throw error;
      return data;
    },
  });
}
