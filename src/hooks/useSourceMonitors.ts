import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SourceMonitor {
  id: string;
  source_name: string;
  source_type: string;
  base_url: string;
  scraping_config: Record<string, any>;
  check_frequency: string;
  last_checked_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useSourceMonitors() {
  return useQuery({
    queryKey: ["source-monitors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("source_monitors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SourceMonitor[];
    },
  });
}

export function useToggleMonitorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("source_monitors")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["source-monitors"] });
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
