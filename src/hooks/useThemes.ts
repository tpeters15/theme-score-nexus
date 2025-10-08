import { useState, useEffect } from 'react';
import { Theme, ThemeWithScores } from '@/types/themes';
import { supabase } from '@/integrations/supabase/client';
import { FrameworkCategory, FrameworkCriteria, DetailedScore } from '@/types/framework';

async function fetchThemes(): Promise<Theme[]> {
  const { data, error } = await supabase
    .from('taxonomy_themes')
    .select(`
      *,
      sector:taxonomy_sectors!inner(
        name,
        pillar:taxonomy_pillars!inner(name)
      )
    `);

  if (error) {
    console.error('Error fetching themes:', error);
    return [];
  }

  // Transform the data to match Theme interface
  const themes = (data || []).map(theme => ({
    id: theme.id,
    name: theme.name,
    pillar: theme.sector.pillar.name,
    sector: theme.sector.name,
    description: theme.description,
    in_scope: theme.in_scope,
    out_of_scope: theme.out_of_scope,
    keywords: theme.keywords,
    created_at: theme.created_at,
    updated_at: theme.updated_at,
  }));

  return themes;
}

async function fetchFrameworkCategories(): Promise<FrameworkCategory[]> {
  const { data, error } = await supabase
    .from('framework_categories')
    .select('*')
    .order('display_order');

  if (error) {
    console.error('Error fetching framework categories:', error);
    return [];
  }

  return data || [];
}

async function fetchFrameworkCriteria(): Promise<FrameworkCriteria[]> {
  const { data, error } = await supabase
    .from('framework_criteria')
    .select('*')
    .order('category_id, display_order');

  if (error) {
    console.error('Error fetching framework criteria:', error);
    return [];
  }

  return data || [];
}

async function fetchDetailedScores(): Promise<DetailedScore[]> {
  const { data, error } = await supabase
    .from('detailed_scores')
    .select('*');

  if (error) {
    console.error('Error fetching detailed scores:', error);
    return [];
  }

  return data || [];
}

function calculateThemeFrameworkScores(
  themes: Theme[], 
  categories: FrameworkCategory[], 
  criteria: FrameworkCriteria[], 
  scores: DetailedScore[]
): ThemeWithScores[] {
  // Only categories A, B, C are used for scoring
  const scoringCategories = categories.filter(cat => ['A', 'B', 'C'].includes(cat.code));
  const scoringCriteriaIds = new Set(
    criteria
      .filter(c => scoringCategories.some(cat => cat.id === c.category_id))
      .map(c => c.id)
  );

  return themes.map(theme => {
    const themeScores = scores.filter(score => score.theme_id === theme.id);
    const scoredScoringCriteria = themeScores.filter(score => 
      score.score !== null && 
      score.score > 0 && 
      scoringCriteriaIds.has(score.criteria_id)
    );

    let totalWeightedScore = 0;
    let totalWeight = 0;
    let confidenceMap: { [key: string]: number } = { 'High': 0, 'Medium': 0, 'Low': 0 };

    for (const category of scoringCategories) {
      let categoryScore = 0;
      let categoryTotalCriteriaWeight = 0;
      
      for (const criterion of criteria.filter(c => c.category_id === category.id)) {
        const score = themeScores.find(s => s.criteria_id === criterion.id);
        if (score && score.score) {
          // Convert 1-5 scale to 0-100 percentage scale
          const percentageScore = ((score.score - 1) / 4) * 100;
          categoryScore += (percentageScore * criterion.weight);
          categoryTotalCriteriaWeight += criterion.weight;
          
          // Count confidence levels
          if (score.confidence) {
            confidenceMap[score.confidence]++;
          }
        }
      }

      if (categoryTotalCriteriaWeight > 0) {
        const categoryWeightedScore = (categoryScore / categoryTotalCriteriaWeight) * (category.weight / 100);
        totalWeightedScore += categoryWeightedScore;
        totalWeight += (category.weight / 100);
      }
    }

    const overall_score = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

    // Determine overall confidence
    const totalScoredCriteria = Object.values(confidenceMap).reduce((a, b) => a + b, 0);
    let overall_confidence: 'High' | 'Medium' | 'Low' = 'Low';
    
    if (totalScoredCriteria > 0) {
      const highPercentage = confidenceMap['High'] / totalScoredCriteria;
      const lowPercentage = confidenceMap['Low'] / totalScoredCriteria;
      
      if (highPercentage >= 0.6) {
        overall_confidence = 'High';
      } else if (lowPercentage >= 0.4) {
        overall_confidence = 'Low';
      } else {
        overall_confidence = 'Medium';
      }
    }

    // For backward compatibility, create empty scores array to match ThemeWithScores interface
    const totalScoringCriteria = criteria.filter(c => scoringCriteriaIds.has(c.id)).length;

    return {
      ...theme,
      scores: [], // Empty for backward compatibility - actual scores are in the framework system
      weighted_total_score: overall_score,
      overall_confidence,
    };
  });
}

export function useThemes() {
  const [themes, setThemes] = useState<ThemeWithScores[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [themesData, categoriesData, criteriaData, scoresData] = await Promise.all([
          fetchThemes(),
          fetchFrameworkCategories(),
          fetchFrameworkCriteria(),
          fetchDetailedScores(),
        ]);

        const themesWithScores = calculateThemeFrameworkScores(
          themesData, 
          categoriesData, 
          criteriaData, 
          scoresData
        );
        setThemes(themesWithScores);
      } catch (error) {
        console.error('Error loading themes data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const refreshThemes = async () => {
    const [themesData, categoriesData, criteriaData, scoresData] = await Promise.all([
      fetchThemes(),
      fetchFrameworkCategories(),
      fetchFrameworkCriteria(),
      fetchDetailedScores(),
    ]);

    const themesWithScores = calculateThemeFrameworkScores(
      themesData, 
      categoriesData, 
      criteriaData, 
      scoresData
    );
    setThemes(themesWithScores);
  };

  const updateThemeScores = async (themeId: string, scoreUpdates: any[], keywords?: string[], description?: string, inScope?: string[], outOfScope?: string[]) => {
    // Prepare theme updates
    const themeUpdates: any = {};
    
    if (keywords !== undefined) {
      console.log('Updating keywords:', keywords);
      const validKeywords = keywords.filter(k => typeof k === 'string' && k.trim().length > 0);
      themeUpdates.keywords = validKeywords.length > 0 ? validKeywords : null;
    }
    
    if (description !== undefined) {
      themeUpdates.description = description.trim() || null;
    }
    
    if (inScope !== undefined) {
      const validInScope = inScope.filter(item => typeof item === 'string' && item.trim().length > 0);
      themeUpdates.in_scope = validInScope.length > 0 ? validInScope : null;
    }
    
    if (outOfScope !== undefined) {
      const validOutOfScope = outOfScope.filter(item => typeof item === 'string' && item.trim().length > 0);
      themeUpdates.out_of_scope = validOutOfScope.length > 0 ? validOutOfScope : null;
    }
    
    // Update theme fields if any changes
    if (Object.keys(themeUpdates).length > 0) {
      const { error } = await supabase
        .from('taxonomy_themes')
        .update(themeUpdates)
        .eq('id', themeId);
      
      if (error) {
        console.error('Error updating theme:', error);
        alert(`Failed to save theme: ${error.message}`);
        return;
      }
      
      console.log('Theme updated successfully');
    }
    
    // Refresh themes after any updates
    await refreshThemes();
  };

  return {
    themes,
    loading,
    updateThemeScores,
    refreshThemes,
  };
}