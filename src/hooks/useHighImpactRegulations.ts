import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Regulation } from "@/types/regulatory";

export function useHighImpactRegulations() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHighImpactRegulations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch high-impact regulations
      const { data: regs, error: fetchError } = await supabase
        .from('regulations')
        .select('*')
        .eq('impact_level', 'high')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      if (fetchError) {
        throw fetchError;
      }

      // Preload themes to avoid FK join (FK not present yet)
      const { data: allThemes } = await supabase
        .from('themes')
        .select('id, name, pillar');

      const themeById = new Map((allThemes || []).map(t => [t.id, t]));

      // For each regulation, get the theme connections and highest relevance score
      const regulationsWithRelevance = await Promise.all(
        (regs || []).map(async (reg) => {
          const { data: themeRegData } = await supabase
            .from('theme_regulations')
            .select('theme_id, relevance_score, impact_description, criteria_impacts')
            .eq('regulation_id', reg.id)
            .order('relevance_score', { ascending: false });

          const connected_themes = (themeRegData || [])
            .map(tr => themeById.get(tr.theme_id))
            .filter(Boolean);

          return {
            id: reg.id,
            title: reg.title,
            description: reg.description,
            jurisdiction: reg.jurisdiction,
            regulation_type: reg.regulation_type,
            status: reg.status,
            impact_level: reg.impact_level,
            compliance_deadline: reg.compliance_deadline,
            effective_date: reg.effective_date,
            source_url: reg.source_url,
            analysis_url: reg.analysis_url,
            regulatory_body: reg.regulatory_body,
            key_provisions: reg.key_provisions || [],
            relevance_score: themeRegData?.[0]?.relevance_score || 0,
            impact_description: themeRegData?.[0]?.impact_description || reg.description,
            criteria_impacts: themeRegData?.[0]?.criteria_impacts || [],
            connected_themes
          } as Regulation & { connected_themes: any[] };
        })
      );

      setRegulations(regulationsWithRelevance);
    } catch (err) {
      console.error('Error fetching high-impact regulations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch regulations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighImpactRegulations();
  }, []);

  return {
    regulations,
    loading,
    error,
    refetch: fetchHighImpactRegulations
  };
}