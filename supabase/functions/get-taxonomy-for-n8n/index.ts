import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Fetch all taxonomy data in parallel including business models
    const [pillarsResult, sectorsResult, themesResult, businessModelsResult] = await Promise.all([
      supabaseClient
        .from('taxonomy_pillars')
        .select('id, name, display_order, description')
        .order('display_order', { ascending: true }),

      supabaseClient
        .from('taxonomy_sectors')
        .select('id, name, pillar_id, display_order, description')
        .order('display_order', { ascending: true }),

      supabaseClient
        .from('taxonomy_themes')
        .select('id, name, sector_id, description, impact, in_scope, out_of_scope, key_identifiers, keywords, common_edge_cases')
        .eq('is_active', true)
        .order('name', { ascending: true }),

      supabaseClient
        .from('taxonomy_business_models')
        .select('id, name, description')
        .order('name', { ascending: true })
    ])

    if (pillarsResult.error) throw pillarsResult.error
    if (sectorsResult.error) throw sectorsResult.error
    if (themesResult.error) throw themesResult.error
    if (businessModelsResult.error) throw businessModelsResult.error

    // Build hierarchical taxonomy structure optimized for n8n
    const taxonomyMap: Record<string, any> = {}

    for (const pillar of pillarsResult.data) {
      taxonomyMap[pillar.name] = {
        id: pillar.id,
        sectors: {}
      }

      const pillarSectors = sectorsResult.data.filter(s => s.pillar_id === pillar.id)

      for (const sector of pillarSectors) {
        const sectorThemes = themesResult.data
          .filter(t => t.sector_id === sector.id)
          .map(t => ({
            id: t.id,
            name: t.name,
            description: t.description,
            impact: t.impact,
            in_scope: t.in_scope,
            out_of_scope: t.out_of_scope,
            key_identifiers: t.key_identifiers,
            keywords: t.keywords,
            common_edge_cases: t.common_edge_cases
          }))

        taxonomyMap[pillar.name].sectors[sector.name] = {
          id: sector.id,
          themes: sectorThemes
        }
      }
    }

    // Also provide flat theme list for quick lookups
    const flatThemes = themesResult.data.map(theme => {
      const sector = sectorsResult.data.find(s => s.id === theme.sector_id)
      const pillar = sector ? pillarsResult.data.find(p => p.id === sector.pillar_id) : null

      return {
        id: theme.id,
        name: theme.name,
        sector_id: sector?.id,
        sector_name: sector?.name,
        pillar_id: pillar?.id,
        pillar_name: pillar?.name
      }
    })

    return new Response(
      JSON.stringify({
        taxonomy: taxonomyMap,
        flat_themes: flatThemes,
        business_models: businessModelsResult.data.map(bm => ({
          id: bm.id,
          name: bm.name,
          description: bm.description
        })),
        metadata: {
          total_pillars: pillarsResult.data.length,
          total_sectors: sectorsResult.data.length,
          total_themes: themesResult.data.length,
          total_business_models: businessModelsResult.data.length,
          generated_at: new Date().toISOString()
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        }
      }
    )
  } catch (error) {
    console.error('Error fetching taxonomy:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch taxonomy' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
