import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting source population from signals...');

    // Get all distinct sources from raw_signals
    const { data: rawSignals, error: signalsError } = await supabase
      .from('raw_signals')
      .select('source, source_type, url');

    if (signalsError) {
      throw signalsError;
    }

    console.log(`Found ${rawSignals?.length || 0} raw signals`);

    // Group by source name and determine source type
    const sourceMap = new Map<string, { source_type: string; urls: string[] }>();
    
    for (const signal of rawSignals || []) {
      if (!signal.source) continue;
      
      if (!sourceMap.has(signal.source)) {
        sourceMap.set(signal.source, {
          source_type: signal.source_type || 'rss',
          urls: []
        });
      }
      
      if (signal.url) {
        sourceMap.get(signal.source)!.urls.push(signal.url);
      }
    }

    console.log(`Found ${sourceMap.size} unique sources`);

    // Get existing sources
    const { data: existingSources, error: existingError } = await supabase
      .from('sources')
      .select('source_name');

    if (existingError) {
      throw existingError;
    }

    const existingSourceNames = new Set(existingSources?.map(s => s.source_name) || []);
    console.log(`Found ${existingSourceNames.size} existing sources in database`);

    // Prepare new sources to insert
    const newSources = [];
    
    for (const [sourceName, sourceInfo] of sourceMap) {
      if (existingSourceNames.has(sourceName)) {
        console.log(`Skipping existing source: ${sourceName}`);
        continue;
      }

      // Extract base URL from first available URL
      let baseUrl = '';
      if (sourceInfo.urls.length > 0) {
        try {
          const url = new URL(sourceInfo.urls[0]);
          baseUrl = `${url.protocol}//${url.host}`;
        } catch (e) {
          console.log(`Could not parse URL for ${sourceName}: ${sourceInfo.urls[0]}`);
        }
      }

      newSources.push({
        source_name: sourceName,
        source_type: sourceInfo.source_type,
        status: 'active',
        base_url: baseUrl || null,
        check_frequency: 'daily',
        field_mappings: {},
        scraping_config: {}
      });
    }

    console.log(`Inserting ${newSources.length} new sources`);

    if (newSources.length > 0) {
      const { data: insertedSources, error: insertError } = await supabase
        .from('sources')
        .insert(newSources)
        .select();

      if (insertError) {
        throw insertError;
      }

      console.log(`Successfully inserted ${insertedSources?.length || 0} sources`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Added ${insertedSources?.length || 0} new sources`,
          sources: insertedSources,
          skipped: existingSourceNames.size
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No new sources to add - all sources already exist',
          skipped: existingSourceNames.size
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error populating sources:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
