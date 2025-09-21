import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Regulation } from '@/components/RegulatoryTable';

export function useRegulations(themeId: string) {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegulations = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('theme_regulations')
        .select(`
          id,
          relevance_score,
          impact_description,
          criteria_impacts,
          regulation:regulation_id (
            id,
            title,
            description,
            jurisdiction,
            regulation_type,
            status,
            impact_level,
            compliance_deadline,
            effective_date,
            source_url,
            analysis_url,
            regulatory_body,
            key_provisions
          )
        `)
        .eq('theme_id', themeId)
        .order('relevance_score', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform the data to match our Regulation interface
      const transformedRegulations: Regulation[] = (data || []).map((item: any) => ({
        id: item.regulation.id,
        title: item.regulation.title,
        description: item.regulation.description,
        jurisdiction: item.regulation.jurisdiction,
        regulation_type: item.regulation.regulation_type,
        status: item.regulation.status,
        impact_level: item.regulation.impact_level,
        compliance_deadline: item.regulation.compliance_deadline,
        effective_date: item.regulation.effective_date,
        source_url: item.regulation.source_url,
        analysis_url: item.regulation.analysis_url,
        regulatory_body: item.regulation.regulatory_body,
        key_provisions: item.regulation.key_provisions || [],
        relevance_score: item.relevance_score,
        impact_description: item.impact_description,
        criteria_impacts: item.criteria_impacts || []
      }));

      setRegulations(transformedRegulations);
    } catch (err) {
      console.error('Error fetching regulations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch regulations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (themeId) {
      fetchRegulations();
    }
  }, [themeId]);

  return {
    regulations,
    loading,
    error,
    refetch: fetchRegulations
  };
}