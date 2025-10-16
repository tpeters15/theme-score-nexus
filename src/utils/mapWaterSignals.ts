import { supabase } from "@/integrations/supabase/client";

export async function mapWaterSignalsToTheme() {
  try {
    // Water Efficiency theme ID
    const themeId = 'aa637432-d6c1-47c8-94b8-2bad7e55f5d0';
    const themeName = 'Water Efficiency';
    const themeDescription = 'Companies providing auditing, consulting, efficiency technologies, and implementation services that reduce water consumption in buildings, agriculture, industry, and landscapes through behavioral change, fixture upgrades, and system optimization.';
    const keywords = [
      'water audits', 'fixture efficiency', 'smart meters', 'precision irrigation', 
      'leak detection', 'NRW', 'non-revenue water', 'pressure management', 
      'greywater', 'rainwater harvesting', 'water reuse', 'IoT monitoring', 
      'irrigation scheduling', 'soil moisture sensors', 'water footprint', 
      'closed-loop cooling', 'industrial water recycling', 'membrane treatment', 
      'water-as-a-service', 'smart water meters', 'water analytics', 
      'water conservation', 'drip irrigation', 'building water efficiency', 
      'water management platform', 'acoustic leak detection', 'wastewater treatment'
    ];

    const { data, error } = await supabase.functions.invoke('map-signals-to-theme', {
      body: {
        themeId,
        themeName,
        themeDescription,
        keywords,
        signalLimit: 10
      }
    });

    if (error) {
      console.error('Error mapping water signals:', error);
      throw error;
    }

    console.log('Water signal mapping results:', data);
    return data;
  } catch (error) {
    console.error('Failed to map water signals:', error);
    throw error;
  }
}
