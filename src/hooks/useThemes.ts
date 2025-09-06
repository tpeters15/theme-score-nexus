import { useState, useEffect } from 'react';
import { ThemeWithScores, Score, Attribute, DEFAULT_ATTRIBUTES, SAMPLE_THEMES } from '@/types/themes';

// Mock data for development
function generateMockData(): ThemeWithScores[] {
  const attributes: Attribute[] = DEFAULT_ATTRIBUTES.map((attr, index) => ({
    id: `attr-${index + 1}`,
    ...attr,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  return SAMPLE_THEMES.map((theme, themeIndex) => {
    const themeId = `theme-${themeIndex + 1}`;
    const scores = attributes.map((attr, attrIndex) => {
      const baseScore = 45 + Math.random() * 40; // Random score between 45-85
      return {
        id: `score-${themeIndex}-${attrIndex}`,
        theme_id: themeId,
        attribute_id: attr.id,
        score: Math.round(baseScore * 10) / 10,
        confidence: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)] as 'High' | 'Medium' | 'Low',
        notes: `Research notes for ${theme.name} - ${attr.name}`,
        updated_by: 'john.doe@firm.com',
        updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        update_source: 'manual' as const,
        attribute: attr,
      };
    });

    const weightedTotal = scores.reduce((sum, score) => {
      return sum + (score.score * score.attribute.weight / 100);
    }, 0);

    const avgConfidence = scores.length > 0 ? 
      scores.filter(s => s.confidence === 'High').length > scores.length / 2 ? 'High' :
      scores.filter(s => s.confidence === 'Medium').length > 0 ? 'Medium' : 'Low' : 'Low';

    return {
      id: themeId,
      ...theme,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      scores,
      weighted_total_score: weightedTotal,
      overall_confidence: avgConfidence,
    };
  });
}

// Add more sample themes to fill the 7x7 grid
const ADDITIONAL_THEMES = [
  { name: 'AI-Powered Cybersecurity', pillar: 'Digital Transformation', sector: 'Security' },
  { name: 'Vertical Farming Technology', pillar: 'Sustainable Future', sector: 'Agriculture' },
  { name: 'Insurtech Platforms', pillar: 'FinTech Revolution', sector: 'Insurance' },
  { name: 'Mental Health Apps', pillar: 'Digital Transformation', sector: 'Healthcare' },
  { name: 'Electric Aviation', pillar: 'Sustainable Future', sector: 'Transportation' },
  { name: 'Buy Now Pay Later', pillar: 'FinTech Revolution', sector: 'Payments' },
  { name: 'AR/VR Training', pillar: 'Digital Transformation', sector: 'Education' },
  { name: 'Smart Building Tech', pillar: 'Sustainable Future', sector: 'Real Estate' },
  { name: 'Robo-Advisory', pillar: 'FinTech Revolution', sector: 'Wealth Management' },
  { name: 'IoT Fleet Management', pillar: 'Digital Transformation', sector: 'Logistics' },
  { name: 'Carbon Capture Tech', pillar: 'Sustainable Future', sector: 'Climate' },
  { name: 'Embedded Finance', pillar: 'FinTech Revolution', sector: 'Banking' },
  { name: 'No-Code Platforms', pillar: 'Digital Transformation', sector: 'Software' },
  { name: 'Renewable Energy Storage', pillar: 'Sustainable Future', sector: 'Energy' },
  { name: 'Digital Identity', pillar: 'FinTech Revolution', sector: 'Security' },
  { name: 'Edge Computing', pillar: 'Digital Transformation', sector: 'Infrastructure' },
  { name: 'Circular Economy', pillar: 'Sustainable Future', sector: 'Manufacturing' },
  { name: 'Crypto Infrastructure', pillar: 'FinTech Revolution', sector: 'Blockchain' },
  { name: 'Remote Work Tools', pillar: 'Digital Transformation', sector: 'Productivity' },
  { name: 'Green Hydrogen', pillar: 'Sustainable Future', sector: 'Energy' },
  { name: 'Regtech Solutions', pillar: 'FinTech Revolution', sector: 'Compliance' },
  { name: 'AI Drug Discovery', pillar: 'Digital Transformation', sector: 'Pharmaceuticals' },
  { name: 'Sustainable Fashion', pillar: 'Sustainable Future', sector: 'Retail' },
  { name: 'Open Banking', pillar: 'FinTech Revolution', sector: 'Banking' },
  { name: 'Autonomous Delivery', pillar: 'Digital Transformation', sector: 'Logistics' },
  { name: 'Bioplastics', pillar: 'Sustainable Future', sector: 'Materials' },
  { name: 'Neobanks', pillar: 'FinTech Revolution', sector: 'Banking' },
  { name: 'Digital Twins', pillar: 'Digital Transformation', sector: 'Manufacturing' },
  { name: 'Lab-Grown Meat', pillar: 'Sustainable Future', sector: 'Food Tech' },
  { name: 'DeFi Protocols', pillar: 'FinTech Revolution', sector: 'DeFi' },
  { name: 'Quantum Computing', pillar: 'Digital Transformation', sector: 'Computing' },
  { name: 'Ocean Tech', pillar: 'Sustainable Future', sector: 'Marine' },
  { name: 'Central Bank Digital Currency', pillar: 'FinTech Revolution', sector: 'Government' },
  { name: 'Space Economy', pillar: 'Digital Transformation', sector: 'Aerospace' },
  { name: 'Clean Coal Technology', pillar: 'Sustainable Future', sector: 'Energy' },
  { name: 'API Economy', pillar: 'FinTech Revolution', sector: 'Infrastructure' },
  { name: 'Precision Medicine', pillar: 'Digital Transformation', sector: 'Healthcare' },
  { name: 'Sustainable Mining', pillar: 'Sustainable Future', sector: 'Mining' },
  { name: 'Embedded Payments', pillar: 'FinTech Revolution', sector: 'Payments' },
  { name: 'Smart Cities', pillar: 'Digital Transformation', sector: 'Urban Planning' },
  { name: 'Carbon Credits', pillar: 'Sustainable Future', sector: 'Climate' },
  { name: 'Banking as a Service', pillar: 'FinTech Revolution', sector: 'Banking' },
  { name: 'Web3 Infrastructure', pillar: 'Digital Transformation', sector: 'Blockchain' },
];

function generateFullMockData(): ThemeWithScores[] {
  const allThemes = [...SAMPLE_THEMES, ...ADDITIONAL_THEMES];
  const attributes: Attribute[] = DEFAULT_ATTRIBUTES.map((attr, index) => ({
    id: `attr-${index + 1}`,
    ...attr,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  return allThemes.map((theme, themeIndex) => {
    const themeId = `theme-${themeIndex + 1}`;
    const scores = attributes.map((attr, attrIndex) => {
      const baseScore = 35 + Math.random() * 50; // Random score between 35-85
      return {
        id: `score-${themeIndex}-${attrIndex}`,
        theme_id: themeId,
        attribute_id: attr.id,
        score: Math.round(baseScore * 10) / 10,
        confidence: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)] as 'High' | 'Medium' | 'Low',
        notes: `Research notes for ${theme.name} - ${attr.name}`,
        updated_by: 'john.doe@firm.com',
        updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        update_source: 'manual' as const,
        attribute: attr,
      };
    });

    const weightedTotal = scores.reduce((sum, score) => {
      return sum + (score.score * score.attribute.weight / 100);
    }, 0);

    const avgConfidence = scores.length > 0 ? 
      scores.filter(s => s.confidence === 'High').length > scores.length / 2 ? 'High' :
      scores.filter(s => s.confidence === 'Medium').length > 0 ? 'Medium' : 'Low' : 'Low';

    return {
      id: themeId,
      ...theme,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      scores,
      weighted_total_score: weightedTotal,
      overall_confidence: avgConfidence,
    };
  });
}

export function useThemes() {
  const [themes, setThemes] = useState<ThemeWithScores[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setThemes(generateFullMockData());
      setLoading(false);
    }, 500);
  }, []);

  const updateThemeScores = async (themeId: string, scoreUpdates: Partial<Score>[]) => {
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
            updated_by: 'john.doe@firm.com',
            update_source: 'manual' as const,
          };
        });

        const weightedTotal = updatedScores.reduce((sum, score) => {
          return sum + (score.score * score.attribute.weight / 100);
        }, 0);

        const avgConfidence = updatedScores.length > 0 ? 
          updatedScores.filter(s => s.confidence === 'High').length > updatedScores.length / 2 ? 'High' :
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