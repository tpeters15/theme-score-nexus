import { useState, useEffect } from 'react';
import { ThemeWithScores, Score, Attribute, DEFAULT_ATTRIBUTES, Theme } from '@/types/themes';
import { supabase } from '@/integrations/supabase/client';

async function fetchThemes(): Promise<Theme[]> {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .order('pillar', { ascending: true })
    .order('sector', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching themes:', error);
    return [];
  }

  return data || [];
}

async function fetchAttributes(): Promise<Attribute[]> {
  // For now, use default attributes until attributes table is created
  return DEFAULT_ATTRIBUTES.map((attr, index) => ({
    id: `attr-${index + 1}`,
    ...attr,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

async function fetchScores(): Promise<Score[]> {
  // For now, return empty scores until scores table is created
  return [];
}

function calculateThemeScores(themes: Theme[], attributes: Attribute[], scores: Score[]): ThemeWithScores[] {
  return themes.map(theme => {
    const themeScores = scores
      .filter(score => score.theme_id === theme.id)
      .map(score => {
        const attribute = attributes.find(attr => attr.id === score.attribute_id);
        return attribute ? { ...score, attribute } : null;
      })
      .filter(Boolean) as (Score & { attribute: Attribute })[];

    // If no scores exist, create empty ones for all attributes
    const allScores = attributes.map(attribute => {
      const existingScore = themeScores.find(s => s.attribute_id === attribute.id);
      if (existingScore) return existingScore;
      
      return {
        id: `empty-${theme.id}-${attribute.id}`,
        theme_id: theme.id,
        attribute_id: attribute.id,
        score: 0,
        confidence: 'Low' as const,
        notes: '',
        updated_by: '',
        updated_at: new Date().toISOString(),
        update_source: 'manual' as const,
        attribute,
      };
    });

    const weightedTotal = allScores.reduce((sum, score) => {
      return sum + (score.score * score.attribute.weight / 100);
    }, 0);

    const scoreCount = allScores.filter(s => s.score > 0).length;
    const avgConfidence = scoreCount > 0 ? 
      allScores.filter(s => s.confidence === 'High').length > scoreCount / 2 ? 'High' :
      allScores.filter(s => s.confidence === 'Medium').length > 0 ? 'Medium' : 'Low' : 'Low';

    return {
      ...theme,
      scores: allScores,
      weighted_total_score: weightedTotal,
      overall_confidence: avgConfidence,
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
        const [themesData, attributesData, scoresData] = await Promise.all([
          fetchThemes(),
          fetchAttributes(),
          fetchScores(),
        ]);

        const themesWithScores = calculateThemeScores(themesData, attributesData, scoresData);
        setThemes(themesWithScores);
      } catch (error) {
        console.error('Error loading themes data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const updateThemeScores = async (themeId: string, scoreUpdates: Partial<Score>[]) => {
    // For now, update scores locally until scores table is created
    setThemes(prevThemes => 
      prevThemes.map(theme => {
        if (theme.id !== themeId) return theme;

        const updatedScores = theme.scores.map(score => {
          const update = scoreUpdates.find(u => u.attribute_id === score.attribute_id);
          if (!update) return score;

          return {
            ...score,
            score: update.score !== undefined ? update.score : score.score,
            confidence: update.confidence || score.confidence,
            notes: update.notes !== undefined ? update.notes : score.notes,
            updated_at: new Date().toISOString(),
            updated_by: 'user@firm.com',
            update_source: 'manual' as const,
          };
        });

        const weightedTotal = updatedScores.reduce((sum, score) => {
          return sum + (score.score * score.attribute.weight / 100);
        }, 0);

        const scoreCount = updatedScores.filter(s => s.score > 0).length;
        const avgConfidence = scoreCount > 0 ? 
          updatedScores.filter(s => s.confidence === 'High').length > scoreCount / 2 ? 'High' :
          updatedScores.filter(s => s.confidence === 'Medium').length > 0 ? 'Medium' : 'Low' : 'Low';

        return {
          ...theme,
          scores: updatedScores,
          weighted_total_score: weightedTotal,
          overall_confidence: avgConfidence,
          updated_at: new Date().toISOString(),
        };
      })
    );
  };

  return {
    themes,
    loading,
    updateThemeScores,
  };
}