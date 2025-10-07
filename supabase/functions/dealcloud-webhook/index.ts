import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DealCloudCompany {
  dealcloud_id: string
  company_name: string
  website: string
  sourcescrub_description?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { company } = await req.json() as { company: DealCloudCompany }

    console.log(`Processing DealCloud company: ${company.company_name}`)

    // Extract domain from website
    const domain = company.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]

    // Upsert company record
    const { data: companyRecord, error: companyError } = await supabase
      .from('companies')
      .upsert({
        dealcloud_id: company.dealcloud_id,
        company_name: company.company_name,
        website_domain: domain,
        description: company.sourcescrub_description || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'dealcloud_id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (companyError) {
      console.error('Error upserting company:', companyError)
      throw companyError
    }

    console.log(`Company upserted: ${companyRecord.id}`)

    // Get current taxonomy version
    const { data: latestTheme } = await supabase
      .from('taxonomy_themes')
      .select('version')
      .order('version', { ascending: false })
      .limit(1)
      .single()

    const taxonomyVersion = latestTheme?.version || 1

    // Create classification record (Pending status)
    const { data: classification, error: classificationError } = await supabase
      .from('classifications')
      .insert({
        company_id: companyRecord.id,
        batch_id: null, // DealCloud classifications are individual
        source_system: 'dealcloud',
        classification_type: 'initial',
        dealcloud_id: company.dealcloud_id,
        sourcescrub_description: company.sourcescrub_description || null,
        taxonomy_version: taxonomyVersion,
        status: 'Pending'
      })
      .select()
      .single()

    if (classificationError) {
      console.error('Error creating classification:', classificationError)
      throw classificationError
    }

    console.log(`Classification created: ${classification.id}`)

    // Return payload for n8n workflow
    return new Response(
      JSON.stringify({
        classification_id: classification.id,
        company_id: companyRecord.id,
        company_name: company.company_name,
        website: company.website,
        domain: domain,
        sourcescrub_description: company.sourcescrub_description || '',
        dealcloud_id: company.dealcloud_id,
        taxonomy_version: taxonomyVersion
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in dealcloud-webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
