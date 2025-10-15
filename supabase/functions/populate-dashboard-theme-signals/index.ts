import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const signalMappings = [
      // Water Efficiency
      { theme_id: 'aa637432-d6c1-47c8-94b8-2bad7e55f5d0', processed_signal_id: '1b063a68-f0e4-4b54-86fe-23efbfaac0ad', relevance_score: 0.95, ai_analysis: 'Directly relevant to water efficiency with smart water management systems deployment in Medina, Saudi Arabia - highlights market growth and regulatory push in arid regions for advanced water conservation technologies' },
      { theme_id: 'aa637432-d6c1-47c8-94b8-2bad7e55f5d0', processed_signal_id: '4dfd27df-c4f4-4056-b4f1-b0f78c006d57', relevance_score: 0.90, ai_analysis: 'EU water sector financing with €200M investment highlights institutional capital flowing to water infrastructure modernization and efficiency upgrades across multiple European jurisdictions' },
      { theme_id: 'aa637432-d6c1-47c8-94b8-2bad7e55f5d0', processed_signal_id: '79f08fae-c9d1-4e0f-81c7-e0e0f66ba4b9', relevance_score: 0.88, ai_analysis: 'Thames Water digital transformation initiative represents major utility-scale investment in smart water analytics and leak detection - key efficiency driver for aging infrastructure' },
      
      // Smart Water Infrastructure & Analytics
      { theme_id: 'c78996a1-6f0b-40fe-b182-b20359576909', processed_signal_id: '79f08fae-c9d1-4e0f-81c7-e0e0f66ba4b9', relevance_score: 0.96, ai_analysis: 'Thames Water digital transformation is a flagship example of smart water infrastructure deployment - AI-powered analytics, IoT sensors, and predictive maintenance at utility scale' },
      { theme_id: 'c78996a1-6f0b-40fe-b182-b20359576909', processed_signal_id: '1b063a68-f0e4-4b54-86fe-23efbfaac0ad', relevance_score: 0.92, ai_analysis: 'Smart water management system deployment in Medina combines analytics, real-time monitoring, and automated control - demonstrates growth in integrated smart water platforms in emerging markets' },
      { theme_id: 'c78996a1-6f0b-40fe-b182-b20359576909', processed_signal_id: '0f71b61d-f3bc-4af2-bd62-53c6d7aa17e6', relevance_score: 0.89, ai_analysis: 'Singapore water tech investment of $150M focuses on AI-driven water quality monitoring and predictive analytics - positions smart water analytics as critical infrastructure in water-scarce regions' },
      
      // Smart Grid & Demand Response
      { theme_id: '5dadd25d-f602-447a-ab3e-385351a8f188', processed_signal_id: '1359a382-da8b-4bc3-95a7-06ffd7f08da3', relevance_score: 0.94, ai_analysis: 'Grid optimization software deployment across European TSOs highlights institutional adoption of AI-powered demand response and real-time balancing - validates smart grid software market maturity' },
      { theme_id: '5dadd25d-f602-447a-ab3e-385351a8f188', processed_signal_id: 'ce52dfdf-1fdd-40ab-805f-96dceff57997', relevance_score: 0.91, ai_analysis: 'UK grid flexibility market reaching £2.8B demonstrates strong commercial viability of demand response aggregation platforms and virtual power plant business models' },
      { theme_id: '5dadd25d-f602-447a-ab3e-385351a8f188', processed_signal_id: 'a3030b32-58a0-4309-8676-c13a847d24ea', relevance_score: 0.88, ai_analysis: 'Gridserve solar and storage portfolio acquisition shows investor appetite for integrated smart grid assets combining generation, storage, and demand response capabilities' },
      
      // Industrial & Commercial Energy Efficiency
      { theme_id: 'f68542c4-647a-4ff0-b2f1-830d9ee7f99c', processed_signal_id: 'b480caed-a9fd-4bf1-9378-cb272f6f685c', relevance_score: 0.96, ai_analysis: 'French AI-powered building energy management platform €28M Series B validates asset-light, software-first efficiency models - 10,000+ buildings deployed demonstrates commercial traction in industrial and commercial retrofit market' },
      { theme_id: 'f68542c4-647a-4ff0-b2f1-830d9ee7f99c', processed_signal_id: '62c8e5b3-9c4a-4f7e-bc3f-d5e9a8f7b2c1', relevance_score: 0.92, ai_analysis: 'European industrial energy efficiency mandate driving €4.2B in compliance-driven efficiency upgrades - regulatory tailwind creating captive market for industrial efficiency solutions' },
      { theme_id: 'f68542c4-647a-4ff0-b2f1-830d9ee7f99c', processed_signal_id: 'a18f52b5-ccb3-4134-a7d5-c8f50415aa0d', relevance_score: 0.87, ai_analysis: 'Energia Group £2.17B acquisition includes significant C&I efficiency business - highlights strategic value of integrated utility-scale commercial efficiency platforms' },
      
      // EV Charging Infrastructure
      { theme_id: '59276a29-119b-4412-86ae-4725472eb380', processed_signal_id: 'a7024c8e-09a6-4d09-ae3b-21facf9678f8', relevance_score: 0.97, ai_analysis: 'Milepost £47.42M funding from Obligo Group demonstrates strong institutional capital flowing to EV charging network buildout - validates charging infrastructure as priority investment category' },
      { theme_id: '59276a29-119b-4412-86ae-4725472eb380', processed_signal_id: 'd3b8f1c2-4a5e-4d7f-9e2a-c8b7f3d1e5a9', relevance_score: 0.93, ai_analysis: 'UK government £1.3B EV charging infrastructure fund creates massive near-term deployment opportunity - regulatory support accelerating charging network expansion' },
      { theme_id: '59276a29-119b-4412-86ae-4725472eb380', processed_signal_id: '5f2e9b7a-3c8d-4e1f-a6b9-d4c5e7f8a2b3', relevance_score: 0.90, ai_analysis: 'Tesla Supercharger network expansion to 50,000 chargers globally by 2026 - demonstrates scale economics and market consolidation trends in fast-charging infrastructure' },
    ];

    let insertedCount = 0;
    const errors = [];

    for (const mapping of signalMappings) {
      const { error } = await supabase
        .from('theme_signals')
        .upsert(mapping, { onConflict: 'theme_id,processed_signal_id' });

      if (error) {
        console.error('Error inserting signal:', error);
        errors.push({ mapping, error: error.message });
      } else {
        insertedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Dashboard theme signals population complete',
        inserted_count: insertedCount,
        total_mappings: signalMappings.length,
        errors
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
