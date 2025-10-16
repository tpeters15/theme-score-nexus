import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ThemeMomentum {
  theme_id: string;
  theme_name: string;
  pillar: string;
  sector: string;
  momentum_score: number;
  signal_velocity_7d: number;
  signal_velocity_30d: number;
  signal_velocity_90d: number;
  signal_acceleration: number;
  score_change_30d: number;
  deal_count: number;
  total_deal_value: number;
  country_count: number;
  source_count: number;
  trend_direction: 'accelerating' | 'steady' | 'decelerating';
  historical_momentum: Array<{ date: string; score: number }>;
}

export function useThemeMomentum(timeRange: '7d' | '30d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['theme-momentum', timeRange],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('calculate-theme-momentum', {
        body: { timeRange }
      });

      if (error) throw error;
      return data.data as ThemeMomentum[];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
