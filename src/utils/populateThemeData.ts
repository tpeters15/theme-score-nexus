import { supabase } from "@/integrations/supabase/client";

interface ThemePopulationData {
  themeName: string;
  tam: {
    value_gbp_bn: number;
    confidence: string;
    variance_percent: number;
  };
  cagr: {
    value_percent: number;
    period: string;
    confidence: string;
  };
  market_maturity: string;
  regulations: Array<{
    regulation_name: string;
    official_reference: string;
    jurisdiction: string;
    status: string;
    official_source_url?: string;
    core_requirement: string;
    compliance_deadline?: string;
    impact_on_theme: string;
    commercial_implication: string;
  }>;
  scores: {
    [key: string]: number;
  };
  score_justifications: {
    [key: string]: string;
  };
}

export async function populateThemeData(data: ThemePopulationData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // 1. Find or create the theme
  const { data: theme, error: themeError } = await supabase
    .from('taxonomy_themes')
    .select('id')
    .eq('name', data.themeName)
    .single();

  if (themeError || !theme) {
    throw new Error(`Theme "${data.themeName}" not found`);
  }

  // 2. Update theme with TAM, CAGR, and market maturity
  const [startYear, endYear] = data.cagr.period.split('-').map(y => parseInt(y));
  
  const { error: updateError } = await supabase
    .from('taxonomy_themes')
    .update({
      tam_value: data.tam.value_gbp_bn,
      tam_currency: 'GBP',
      cagr_percentage: data.cagr.value_percent,
      cagr_period_start: startYear,
      cagr_period_end: endYear,
      market_maturity: data.market_maturity,
      updated_at: new Date().toISOString()
    })
    .eq('id', theme.id);

  if (updateError) throw updateError;

  // 3. Get framework criteria mapping
  const { data: criteria, error: criteriaError } = await supabase
    .from('framework_criteria')
    .select('id, code');

  if (criteriaError) throw criteriaError;

  const criteriaMap = criteria.reduce((acc, c) => {
    acc[c.code] = c.id;
    return acc;
  }, {} as Record<string, string>);

  // 4. Map score keys to criteria codes
  const scoreMapping: Record<string, string> = {
    'A1_tam': 'A1',
    'A2_som': 'A2',
    'A3_cagr': 'A3',
    'A4_maturity': 'A4',
    'B1_fragmentation': 'B1',
    'B2_competitive_moat': 'B2',
    'B3_exit_quality': 'B3',
    'C1_regulatory': 'C1',
    'C2_timing_risk': 'C2',
    'C3_macro_sensitivity': 'C3',
    'C4_confidence': 'C4'
  };

  // 5. Upsert scores
  for (const [scoreKey, scoreValue] of Object.entries(data.scores)) {
    const criteriaCode = scoreMapping[scoreKey];
    if (!criteriaCode || !criteriaMap[criteriaCode]) continue;

    const criteriaId = criteriaMap[criteriaCode];
    const justification = data.score_justifications[scoreKey];

    await supabase
      .from('detailed_scores')
      .upsert({
        theme_id: theme.id,
        criteria_id: criteriaId,
        score: scoreValue,
        confidence: data.cagr.confidence,
        notes: justification,
        updated_by: user.id,
        update_source: 'manual'
      }, {
        onConflict: 'theme_id,criteria_id'
      });
  }

  // 6. Create regulations and link to theme
  for (const reg of data.regulations) {
    // Insert regulation
    const { data: regulation, error: regError } = await supabase
      .from('regulations')
      .upsert({
        title: reg.regulation_name,
        description: reg.core_requirement,
        jurisdiction: reg.jurisdiction,
        regulation_type: 'infrastructure',
        status: reg.status,
        source_url: reg.official_source_url || '',
        compliance_deadline: reg.compliance_deadline || null,
        regulatory_body: reg.official_reference
      }, {
        onConflict: 'title,jurisdiction'
      })
      .select('id')
      .single();

    if (regError || !regulation) continue;

    // Link to theme
    await supabase
      .from('theme_regulations')
      .upsert({
        theme_id: theme.id,
        regulation_id: regulation.id,
        impact_description: reg.commercial_implication,
        relevance_score: reg.impact_on_theme === 'HIGH' ? 5 : reg.impact_on_theme === 'MEDIUM' ? 3 : 1
      }, {
        onConflict: 'theme_id,regulation_id'
      });
  }

  return { success: true, theme_id: theme.id };
}
