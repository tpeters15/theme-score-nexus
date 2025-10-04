import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TaxonomyPillar, TaxonomySector, TaxonomyTheme, TaxonomyBusinessModel } from '@/types/taxonomy';

export const useTaxonomy = () => {
  const [pillars, setPillars] = useState<TaxonomyPillar[]>([]);
  const [sectors, setSectors] = useState<TaxonomySector[]>([]);
  const [themes, setThemes] = useState<TaxonomyTheme[]>([]);
  const [businessModels, setBusinessModels] = useState<TaxonomyBusinessModel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pillarsRes, sectorsRes, themesRes, businessModelsRes] = await Promise.all([
        supabase.from('taxonomy_pillars').select('*').order('display_order'),
        supabase.from('taxonomy_sectors').select('*').order('display_order'),
        supabase.from('taxonomy_themes').select('*').eq('is_active', true).order('name'),
        supabase.from('taxonomy_business_models').select('*').order('name'),
      ]);

      if (pillarsRes.data) setPillars(pillarsRes.data);
      if (sectorsRes.data) setSectors(sectorsRes.data);
      if (themesRes.data) setThemes(themesRes.data);
      if (businessModelsRes.data) setBusinessModels(businessModelsRes.data);
    } catch (error) {
      console.error('Error fetching taxonomy:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    pillars,
    sectors,
    themes,
    businessModels,
    loading,
    refresh: fetchAll,
  };
};
