import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScoreUpdate {
  criteria_id: string;
  score: number;
  confidence: string;
  notes: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { theme_id, scores } = await req.json();

    if (!theme_id || !scores || !Array.isArray(scores)) {
      throw new Error('Missing required fields: theme_id and scores array');
    }

    console.log(`Updating ${scores.length} scores for theme ${theme_id}`);

    // Update each score
    for (const scoreUpdate of scores as ScoreUpdate[]) {
      const { criteria_id, score, confidence, notes } = scoreUpdate;

      // Upsert the score
      const { error } = await supabaseClient
        .from('detailed_scores')
        .upsert({
          theme_id,
          criteria_id,
          score,
          confidence,
          notes,
          update_source: 'manual',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'theme_id,criteria_id'
        });

      if (error) {
        console.error(`Error updating score for criteria ${criteria_id}:`, error);
        throw error;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully updated ${scores.length} scores` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in bulk-score-update:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
