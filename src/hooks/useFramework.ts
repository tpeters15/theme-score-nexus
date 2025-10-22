import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FrameworkCategory, FrameworkCriteria, DetailedScore, ResearchDocument, ThemeWithDetailedScores, FrameworkCategoryWithCriteria, UserRole } from '@/types/framework';
import { Theme } from '@/types/themes';

export const useFramework = () => {
  const [categories, setCategories] = useState<FrameworkCategory[]>([]);
  const [criteria, setCriteria] = useState<FrameworkCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    fetchFrameworkData();
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleData) {
        setUserRole(roleData.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchFrameworkData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('framework_categories')
        .select('*')
        .order('display_order');

      if (categoriesError) throw categoriesError;

      // Fetch criteria
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('framework_criteria')
        .select('*')
        .order('category_id, display_order');

      if (criteriaError) throw criteriaError;

      setCategories(categoriesData || []);
      setCriteria(criteriaData || []);
    } catch (error) {
      console.error('Error fetching framework data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExistingDocuments = async (documents: ResearchDocument[]): Promise<ResearchDocument[]> => {
    if (!documents.length) return documents;

    const validDocuments: ResearchDocument[] = [];

    for (const doc of documents) {
      if (!doc.file_path) {
        // Skip documents without file paths
        continue;
      }

      try {
        // Check if file exists in storage by trying to get its metadata
        const { data, error } = await supabase.storage
          .from('research-documents')
          .list(doc.file_path.includes('/') ? doc.file_path.substring(0, doc.file_path.lastIndexOf('/')) : '', {
            limit: 1000
          });

        // Check if the exact file exists in the list
        const filename = doc.file_path.split('/').pop();
        const fileExists = data?.some(file => file.name === filename);

        if (!error && fileExists) {
          validDocuments.push(doc);
        } else {
          console.warn(`File not found in storage: ${doc.file_path}`);
          // Optionally, you could delete the orphaned database record here
          // await supabase.from('research_documents').delete().eq('id', doc.id);
        }
      } catch (error) {
        console.warn(`Error checking file existence for ${doc.file_path}:`, error);
      }
    }

    return validDocuments;
  };

  const fetchThemeWithDetailedScores = async (themeId: string): Promise<ThemeWithDetailedScores | null> => {
    try {
      // Fetch theme
    const { data: themeData, error: themeError } = await supabase
      .from('taxonomy_themes')
      .select(`
        *,
        sector:taxonomy_sectors!inner(
          name,
          pillar:taxonomy_pillars!inner(name)
        )
      `)
      .eq('id', themeId)
      .single();

    if (themeError || !themeData) {
      console.error('Error fetching theme:', themeError);
      return null;
    }

    // Transform to match Theme interface
    const theme = {
      id: themeData.id,
      name: themeData.name,
      pillar: themeData.sector.pillar.name,
      sector: themeData.sector.name,
      description: themeData.description,
      in_scope: themeData.in_scope,
      out_of_scope: themeData.out_of_scope,
      keywords: themeData.keywords,
      created_at: themeData.created_at,
      updated_at: themeData.updated_at,
      tam_value: themeData.tam_value,
      tam_currency: themeData.tam_currency,
      cagr_percentage: themeData.cagr_percentage,
      cagr_period_start: themeData.cagr_period_start,
      cagr_period_end: themeData.cagr_period_end,
      market_maturity: themeData.market_maturity,
    };

      if (themeError) throw themeError;

      // Fetch framework categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('framework_categories')
        .select('*')
        .order('display_order');

      if (categoriesError) throw categoriesError;

      // Fetch framework criteria
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('framework_criteria')
        .select('*')
        .order('category_id, display_order');

      if (criteriaError) throw criteriaError;

      // Fetch detailed scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('detailed_scores')
        .select('*')
        .eq('theme_id', themeId);

      if (scoresError) throw scoresError;

      // Fetch research documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('research_documents')
        .select('*')
        .eq('theme_id', themeId)
        .order('created_at', { ascending: false });

      if (documentsError) throw documentsError;

      // Filter documents to only include those with files that actually exist in storage
      const validDocuments = await filterExistingDocuments(documentsData || []);

      // Manually join categories with their criteria
      const categoriesWithCriteria: FrameworkCategoryWithCriteria[] = (categoriesData || []).map(category => ({
        ...category,
        criteria: (criteriaData || []).filter(criterion => criterion.category_id === category.id)
      }));

      // Manually join scores with their criteria
      const scoresWithCriteria = (scoresData || []).map(score => ({
        ...score,
        criteria: (criteriaData || []).find(criterion => criterion.id === score.criteria_id)!
      })).filter(score => score.criteria); // Filter out scores without matching criteria

      // Calculate overall score and confidence
      const { overall_score, overall_confidence } = calculateOverallScore(scoresWithCriteria, categoriesWithCriteria);

      return {
        ...theme,
        categories: categoriesWithCriteria,
        detailed_scores: scoresWithCriteria,
        research_documents: validDocuments,
        overall_score,
        overall_confidence
      };
    } catch (error) {
      console.error('Error fetching theme with detailed scores:', error);
      return null;
    }
  };

  const calculateOverallScore = (scores: any[], categories: FrameworkCategoryWithCriteria[]) => {
    // Only include categories A, B, C, D for scoring (E and F are qualitative only)
    const scoringCategories = categories.filter(cat => ['A', 'B', 'C', 'D'].includes(cat.code));
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    let confidenceMap: { [key: string]: number } = { 'High': 0, 'Medium': 0, 'Low': 0 };

    for (const category of scoringCategories) {
      let categoryScore = 0;
      let categoryTotalCriteriaWeight = 0;
      
      for (const criteria of category.criteria) {
        const score = scores.find(s => s.criteria_id === criteria.id);
        if (score && score.score) {
          categoryScore += (score.score * criteria.weight);
          categoryTotalCriteriaWeight += criteria.weight;
          
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

    // Calculate overall score on 1-5 scale and keep it on that scale for display
    const scoreOn1to5Scale = totalWeight > 0 ? (totalWeightedScore / totalWeight) : 0;
    const overall_score = Number(scoreOn1to5Scale.toFixed(2));

    // Determine overall confidence
    const totalScores = Object.values(confidenceMap).reduce((a, b) => a + b, 0);
    let overall_confidence: 'High' | 'Medium' | 'Low' = 'Medium';
    
    if (totalScores > 0) {
      const highPercentage = confidenceMap['High'] / totalScores;
      const lowPercentage = confidenceMap['Low'] / totalScores;
      
      if (highPercentage >= 0.6) {
        overall_confidence = 'High';
      } else if (lowPercentage >= 0.4) {
        overall_confidence = 'Low';
      }
    }

    return { overall_score, overall_confidence };
  };

  const updateDetailedScore = async (themeId: string, criteriaId: string, scoreData: Partial<DetailedScore>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('detailed_scores')
        .upsert({
          theme_id: themeId,
          criteria_id: criteriaId,
          ...scoreData,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
          update_source: 'manual'
        });

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating detailed score:', error);
      return false;
    }
  };

  return {
    categories,
    criteria,
    loading,
    userRole,
    fetchThemeWithDetailedScores,
    updateDetailedScore,
    refreshFrameworkData: fetchFrameworkData
  };
};