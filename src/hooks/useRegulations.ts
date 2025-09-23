import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Regulation } from '@/types/regulatory';

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
          regulation_id
        `)
        .eq('theme_id', themeId)
        .order('relevance_score', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Get regulation IDs and fetch the regulation details separately
      const regulationIds = (data || []).map(item => item.regulation_id);
      
      if (regulationIds.length === 0) {
        setRegulations([]);
        return;
      }

      const { data: regulationsData, error: regError } = await supabase
        .from('regulations')
        .select('*')
        .in('id', regulationIds);

      if (regError) {
        throw regError;
      }

      // Transform the data to match our Regulation interface
      const transformedRegulations: Regulation[] = (data || []).map((themeReg: any) => {
        const regulation = (regulationsData || []).find(reg => reg.id === themeReg.regulation_id);
        if (!regulation) return null;
        
        return {
          id: regulation.id,
          title: regulation.title,
          description: regulation.description,
          jurisdiction: regulation.jurisdiction,
          regulation_type: regulation.regulation_type,
          status: regulation.status,
          impact_level: regulation.impact_level,
          compliance_deadline: regulation.compliance_deadline,
          effective_date: regulation.effective_date,
          source_url: regulation.source_url,
          analysis_url: regulation.analysis_url,
          regulatory_body: regulation.regulatory_body,
          key_provisions: regulation.key_provisions || [],
          relevance_score: themeReg.relevance_score,
          impact_description: themeReg.impact_description,
          criteria_impacts: themeReg.criteria_impacts || []
        };
      }).filter(Boolean);

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