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
    const { themeId, themeName, themeDescription, keywords, signalLimit = 5 } = await req.json();

    if (!themeId || !themeName) {
      return new Response(
        JSON.stringify({ error: "themeId and themeName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch recent signals (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: signals, error: signalsError } = await supabase
      .from("processed_signals")
      .select(`
        id,
        signal_type_classified,
        countries,
        content_snippet,
        extracted_deal_size,
        raw_signal:raw_signals!raw_signal_id (
          title,
          source,
          publication_date,
          url
        )
      `)
      .gte("processed_timestamp", thirtyDaysAgo.toISOString())
      .order("processed_timestamp", { ascending: false })
      .limit(50);

    if (signalsError) {
      throw signalsError;
    }

    if (!signals || signals.length === 0) {
      return new Response(
        JSON.stringify({ message: "No recent signals found", mappings: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use AI to analyze which signals are relevant to this theme
    const systemPrompt = `You are an investment analyst identifying market signals relevant to specific investment themes. 
Analyze each signal and determine if it's relevant to the given theme based on the theme description, keywords, and signal content.
Return a relevance score (0-1) and brief analysis for signals that are relevant (score > 0.6).`;

    const userPrompt = `Theme: ${themeName}
Description: ${themeDescription || 'Not provided'}
Keywords: ${keywords?.join(', ') || 'None'}

Analyze these signals and identify the top ${signalLimit} most relevant ones:

${signals.map((s, idx) => `
Signal ${idx + 1}:
Title: ${s.raw_signal.title}
Type: ${s.signal_type_classified || 'Unknown'}
Snippet: ${s.content_snippet || 'No snippet'}
Deal Size: ${s.extracted_deal_size || 'N/A'}
Countries: ${s.countries?.join(', ') || 'N/A'}
`).join('\n')}

Return the top ${signalLimit} most relevant signals.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "rank_signals",
            description: "Return the most relevant signals with scores and analysis",
            parameters: {
              type: "object",
              properties: {
                relevant_signals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      signal_index: { type: "number", description: "Index of the signal (0-based)" },
                      relevance_score: { type: "number", description: "Score from 0 to 1" },
                      analysis: { type: "string", description: "Brief explanation of relevance" }
                    },
                    required: ["signal_index", "relevance_score", "analysis"]
                  }
                }
              },
              required: ["relevant_signals"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "rank_signals" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const result = JSON.parse(toolCall.function.arguments);
    const relevantSignals = result.relevant_signals || [];

    // Insert mappings into database
    const mappings = [];
    for (const ranked of relevantSignals) {
      const signal = signals[ranked.signal_index];
      if (!signal || ranked.relevance_score <= 0.6) continue;

      const { error: insertError } = await supabase
        .from("theme_signals")
        .upsert({
          theme_id: themeId,
          processed_signal_id: signal.id,
          relevance_score: ranked.relevance_score,
          ai_analysis: ranked.analysis
        }, {
          onConflict: 'theme_id,processed_signal_id'
        });

      if (!insertError) {
        mappings.push({
          signal_title: signal.raw_signal.title,
          relevance_score: ranked.relevance_score,
          analysis: ranked.analysis
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Mapped ${mappings.length} signals to theme`,
        mappings
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
