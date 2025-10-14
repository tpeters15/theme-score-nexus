import { supabase } from "@/integrations/supabase/client";

export interface BulkScoreUpdate {
  criteria_id: string;
  score: number;
  confidence: 'High' | 'Medium' | 'Low';
  notes: string;
}

export async function upsertScoresDirectly(themeId: string, scores: BulkScoreUpdate[]) {
  const { data: { user } } = await supabase.auth.getUser();
  const payload = scores.map(s => ({
    theme_id: themeId,
    criteria_id: s.criteria_id,
    score: s.score,
    confidence: s.confidence,
    notes: s.notes,
    updated_by: user?.id ?? null,
    updated_at: new Date().toISOString(),
    update_source: 'manual',
  }));

  const { error } = await supabase
    .from('detailed_scores')
    .upsert(payload, { onConflict: 'theme_id,criteria_id' });

  if (error) {
    console.error('Direct upsert error:', error);
    throw error;
  }

  return { success: true, count: payload.length };
}

export async function bulkUpdateScores(themeId: string, scores: BulkScoreUpdate[]) {
  try {
    const { data, error } = await supabase.functions.invoke('bulk-score-update', {
      body: {
        theme_id: themeId,
        scores,
      },
    });

    if (error) {
      console.warn('Edge function error, falling back to direct upsert:', error);
      return await upsertScoresDirectly(themeId, scores);
    }

    return data;
  } catch (err) {
    console.warn('Edge function unavailable, falling back to direct upsert:', err);
    return await upsertScoresDirectly(themeId, scores);
  }
}

// Predefined score data for Industrial & Commercial Energy Efficiency theme
export const INDUSTRIAL_ENERGY_EFFICIENCY_SCORES: BulkScoreUpdate[] = [
  {
    criteria_id: 'e4613835-f637-49e8-99f1-57d6894cc990', // A1: TAM
    score: 5,
    confidence: 'High',
    notes: 'Blended TAM for asset-light industrial efficiency in target European geographies is €8–12 bn (2025), clearly above the €5 bn threshold.',
  },
  {
    criteria_id: '975d1dff-0048-498e-8259-0aadcf152b8e', // A2: Platform Potential (SOM)
    score: 5,
    confidence: 'High',
    notes: 'Bottom-up model indicates a realistic SOM ≈ €246 m annual revenue by 2029 for a single market-leading platform (≥£100 m).',
  },
  {
    criteria_id: 'd33eecd5-7f34-425a-92eb-138487e882dd', // A3: CAGR
    score: 3,
    confidence: 'Medium',
    notes: 'Final blended growth estimate for the asset-light software/services segment is ~10–12% for the 2025–2029 horizon (within 5–15%).',
  },
  {
    criteria_id: '0c35a53e-ba40-4d76-ba5f-6d5368bcc828', // A4: Market Maturity
    score: 3,
    confidence: 'Medium',
    notes: 'Market is transitioning from early to growth stage, driven by new EU regulations (CSRD, EED) coming into force 2024–2025. While industrial energy management has existed for decades, the shift to integrated software-driven platforms with compliance automation is still maturing, creating a window for consolidation.',
  },
  {
    criteria_id: 'd880face-8043-4240-be11-3c5257927f65', // B1: Market Fragmentation
    score: 5,
    confidence: 'High',
    notes: 'Market is highly fragmented with a long tail of specialists, supporting a clear buy-and-build pathway for a consolidating platform.',
  },
  {
    criteria_id: 'ae53ea1f-0f4e-4d9a-b309-55f8ea57c0f2', // B2: Competitive Landscape & Moat
    score: 3,
    confidence: 'Medium',
    notes: 'Field includes large incumbents alongside many SMEs; defensibility can be built via scalable software layers and integration of ESG/CSRD capabilities that increase stickiness.',
  },
  {
    criteria_id: 'aa88205a-0fe6-4a41-b0fb-9ddd73fe64d8', // B3: Exit Environment
    score: 5,
    confidence: 'High',
    notes: 'Theme shows a clear path to attractive exit with both strategic and financial buyers within 3–5 years, underpinned by consolidation dynamics.',
  },
  {
    criteria_id: 'd6f7c864-6f6b-47e5-8dc5-a3f4b97d4410', // C1: Regulatory & Policy Landscape
    score: 3,
    confidence: 'Medium',
    notes: 'Strong, durable EU/UK regulatory tailwinds support demand, but risks remain around uneven transposition, policy "simplification" and complexity, making growth partly policy-contingent.',
  },
  {
    criteria_id: '81a53b4d-5a36-458b-a50a-605f948e61d9', // D1: Market Timing
    score: 5,
    confidence: 'High',
    notes: 'The investability window is "Near" (≤18 months) given newly implemented binding regulations and 2030 timelines, indicating a favourable entry point.',
  },
  {
    criteria_id: '954e16ba-9b94-4009-85d0-d5c6b76e20d8', // D2: Macro Sensitivity
    score: 3,
    confidence: 'Medium',
    notes: 'Regulatory/compliance drivers provide a non-cyclical demand floor, but a severe industrial recession would defer efficiency capex and slow adoption.',
  },
];
