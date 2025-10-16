import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ThemeMomentumData {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const { timeRange = '30d' } = await req.json().catch(() => ({}));

    // Calculate date ranges
    const now = new Date();
    const date7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const date30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const date90d = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Fetch all active themes with their pillars and sectors
    const { data: themes, error: themesError } = await supabaseClient
      .from('taxonomy_themes')
      .select(`
        id,
        name,
        taxonomy_sectors!inner (
          name,
          taxonomy_pillars!inner (
            name
          )
        )
      `)
      .eq('is_active', true);

    if (themesError) throw themesError;

    // Fetch all theme signals for momentum calculation
    const { data: themeSignals, error: signalsError } = await supabaseClient
      .from('theme_signals')
      .select(`
        theme_id,
        created_at,
        relevance_score,
        processed_signals!inner (
          signal_type_classified,
          extracted_deal_size,
          countries,
          raw_signals!inner (
            source,
            publication_date
          )
        )
      `)
      .gte('created_at', date90d.toISOString());

    if (signalsError) throw signalsError;

    // Fetch detailed scores for score trend analysis
    const { data: scores, error: scoresError } = await supabaseClient
      .from('detailed_scores')
      .select('theme_id, score, updated_at')
      .gte('updated_at', date30d.toISOString())
      .not('score', 'is', null);

    if (scoresError) throw scoresError;

    // Calculate momentum for each theme
    const momentumData: ThemeMomentumData[] = themes.map((theme: any) => {
      const themeId = theme.id;
      const themeName = theme.name;
      const pillar = theme.taxonomy_sectors.taxonomy_pillars.name;
      const sector = theme.taxonomy_sectors.name;

      // Filter signals for this theme
      const signals = themeSignals.filter((s: any) => s.theme_id === themeId);

      // Calculate signal velocities
      const signals7d = signals.filter((s: any) => new Date(s.created_at) >= date7d);
      const signals30d = signals.filter((s: any) => new Date(s.created_at) >= date30d);
      const signals90d = signals.filter((s: any) => new Date(s.created_at) >= date90d);

      const velocity7d = signals7d.length / 7;
      const velocity30d = signals30d.length / 30;
      const velocity90d = signals90d.length / 90;

      // Calculate acceleration (change in velocity)
      const acceleration = velocity7d - velocity30d;

      // Calculate deal metrics
      const dealSignals = signals30d.filter((s: any) => 
        s.processed_signals?.signal_type_classified === 'Deal' ||
        s.processed_signals?.signal_type_classified === 'Funding'
      );
      const dealCount = dealSignals.length;

      // Extract deal values (simplified - in real case would parse the extracted_deal_size)
      const totalDealValue = dealSignals.reduce((sum: number, s: any) => {
        const dealSize = s.processed_signals?.extracted_deal_size;
        // Simple heuristic: if it contains 'M', multiply by 1, if 'B', multiply by 1000
        if (dealSize?.includes('M')) return sum + parseFloat(dealSize) || 0;
        if (dealSize?.includes('B')) return sum + (parseFloat(dealSize) * 1000) || 0;
        return sum;
      }, 0);

      // Calculate geographic spread
      const countries = new Set<string>();
      signals30d.forEach((s: any) => {
        const signalCountries = s.processed_signals?.countries || [];
        signalCountries.forEach((c: string) => countries.add(c));
      });
      const countryCount = countries.size;

      // Calculate source diversity
      const sources = new Set<string>();
      signals30d.forEach((s: any) => {
        const source = s.processed_signals?.raw_signals?.source;
        if (source) sources.add(source);
      });
      const sourceCount = sources.size;

      // Calculate score change
      const themeScores = scores.filter((s: any) => s.theme_id === themeId);
      const scoreChange = themeScores.length >= 2 
        ? themeScores[themeScores.length - 1].score - themeScores[0].score 
        : 0;

      // Calculate momentum score
      const normalizedVelocity = Math.min(velocity30d * 10, 100); // Cap at 100
      const normalizedAcceleration = Math.min(Math.max((acceleration + 1) * 50, 0), 100);
      const normalizedScoreChange = Math.min(Math.max((scoreChange + 5) * 10, 0), 100);
      const normalizedDealActivity = Math.min(dealCount * 10, 100);
      const normalizedGeoSpread = Math.min(countryCount * 10, 100);
      const normalizedSourceDiversity = Math.min(sourceCount * 5, 100);

      const momentumScore = (
        normalizedVelocity * 0.30 +
        normalizedAcceleration * 0.25 +
        normalizedScoreChange * 0.20 +
        normalizedDealActivity * 0.15 +
        normalizedGeoSpread * 0.05 +
        normalizedSourceDiversity * 0.05
      );

      // Determine trend direction
      let trendDirection: 'accelerating' | 'steady' | 'decelerating';
      if (acceleration > 0.2) trendDirection = 'accelerating';
      else if (acceleration < -0.2) trendDirection = 'decelerating';
      else trendDirection = 'steady';

      // Calculate historical momentum (weekly snapshots for last 90 days)
      const historicalMomentum: Array<{ date: string; score: number }> = [];
      for (let i = 12; i >= 0; i--) {
        const weekDate = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const weekSignals = signals.filter((s: any) => 
          new Date(s.created_at) <= weekDate && 
          new Date(s.created_at) >= new Date(weekDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        );
        const weekScore = Math.min(weekSignals.length * 8, 100); // Simplified score
        historicalMomentum.push({
          date: weekDate.toISOString().split('T')[0],
          score: weekScore,
        });
      }

      return {
        theme_id: themeId,
        theme_name: themeName,
        pillar,
        sector,
        momentum_score: Math.round(momentumScore * 10) / 10,
        signal_velocity_7d: Math.round(velocity7d * 10) / 10,
        signal_velocity_30d: Math.round(velocity30d * 10) / 10,
        signal_velocity_90d: Math.round(velocity90d * 10) / 10,
        signal_acceleration: Math.round(acceleration * 100) / 100,
        score_change_30d: Math.round(scoreChange * 10) / 10,
        deal_count: dealCount,
        total_deal_value: Math.round(totalDealValue),
        country_count: countryCount,
        source_count: sourceCount,
        trend_direction: trendDirection,
        historical_momentum: historicalMomentum,
      };
    });

    // Sort by momentum score descending
    momentumData.sort((a, b) => b.momentum_score - a.momentum_score);

    return new Response(
      JSON.stringify({ data: momentumData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error calculating momentum:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
