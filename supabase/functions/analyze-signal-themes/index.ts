import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { signal } = await req.json();
    console.log('Analyzing signal:', signal.title);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get taxonomy themes from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: themes, error: themesError } = await supabase
      .from('taxonomy_themes')
      .select(`
        id,
        name,
        description,
        sector:taxonomy_sectors(name),
        pillar:taxonomy_sectors(pillar:taxonomy_pillars(name))
      `)
      .eq('is_active', true);

    if (themesError) {
      console.error('Error fetching themes:', themesError);
      throw themesError;
    }

    console.log(`Fetched ${themes?.length || 0} active themes`);

    // Create a simplified theme list for the AI
    const themeList = themes?.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      sector: t.sector?.name,
      pillar: t.pillar?.pillar?.name
    })) || [];

    const systemPrompt = `You are an expert analyst mapping market signals to investment themes. 
Analyze the given signal and identify which themes it relates to.
For each relevant theme, provide a brief 2-3 sentence analysis explaining the connection.

Available themes:
${JSON.stringify(themeList, null, 2)}

Return your response as a JSON object with this structure:
{
  "mappings": [
    {
      "theme_id": "uuid",
      "theme_name": "name",
      "relevance_score": 0.0-1.0,
      "analysis": "brief explanation of relevance"
    }
  ]
}

Only include themes with relevance_score >= 0.5. Maximum 5 themes.`;

    const userPrompt = `Signal Title: ${signal.title}
Signal Type: ${signal.signal_type}
Countries: ${signal.countries}
Content: ${signal.content_snippet}
${signal.deal_size ? `Deal Size: ${signal.deal_size}` : ''}`;

    console.log('Calling Lovable AI for theme analysis...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0,
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    console.log('AI response received:', content);

    const result = JSON.parse(content);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-signal-themes:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        mappings: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});