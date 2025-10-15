import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// High-priority themes to populate
const HIGH_PRIORITY_THEMES = [
  { id: "59276a29-119b-4412-86ae-4725472eb380", name: "EV Charging Infrastructure" },
  { id: "cd3dd655-ed9c-42ea-80a1-0bee29dd00b3", name: "Renewable Energy EPC & O&M" },
  { id: "138d8cdd-a174-4b51-83df-ebcc3d0e2d73", name: "Grid Infrastructure & Connection" },
  { id: "0a2cff00-5987-472c-8255-ac10f02e5d87", name: "Recycling & Material Recovery" },
  { id: "f68542c4-647a-4ff0-b2f1-830d9ee7f99c", name: "Industrial & Commercial Energy Efficiency" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = [];

    // Process each theme
    for (const theme of HIGH_PRIORITY_THEMES) {
      // Fetch theme details including keywords
      const { data: themeData, error: themeError } = await supabase
        .from("taxonomy_themes")
        .select("description, keywords")
        .eq("id", theme.id)
        .single();

      if (themeError) {
        console.error(`Error fetching theme ${theme.name}:`, themeError);
        continue;
      }

      // Call the map-signals-to-theme function
      const { data, error } = await supabase.functions.invoke('map-signals-to-theme', {
        body: {
          themeId: theme.id,
          themeName: theme.name,
          themeDescription: themeData.description,
          keywords: themeData.keywords,
          signalLimit: 5
        }
      });

      if (error) {
        console.error(`Error mapping signals for ${theme.name}:`, error);
        results.push({
          theme: theme.name,
          status: "error",
          error: error.message
        });
      } else {
        results.push({
          theme: theme.name,
          status: "success",
          mapped_count: data.mappings?.length || 0
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: "Theme signal population complete",
        results
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
