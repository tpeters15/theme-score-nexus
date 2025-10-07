import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClassificationData {
  pillar: string
  sector: string
  theme: string
  confidence: number
  rationale: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { dealcloud_id, classification } = await req.json() as {
      dealcloud_id: string
      classification: ClassificationData
    }

    console.log(`Writing back to DealCloud for company ${dealcloud_id}`)

    // TODO: Implement actual DealCloud API integration
    // For now, this is a placeholder that logs the data
    
    const writeBackPayload = {
      company_id: dealcloud_id,
      fields: {
        taxonomy_pillar: classification.pillar,
        taxonomy_sector: classification.sector,
        taxonomy_theme: classification.theme,
        classification_confidence: classification.confidence,
        classification_rationale: classification.rationale,
        last_classified_at: new Date().toISOString()
      }
    }

    console.log('DealCloud write-back payload:', JSON.stringify(writeBackPayload, null, 2))

    // When DealCloud API is ready, uncomment and configure:
    /*
    const dealCloudApiKey = Deno.env.get('DEALCLOUD_API_KEY')
    const dealCloudApiUrl = Deno.env.get('DEALCLOUD_API_URL')
    
    const response = await fetch(`${dealCloudApiUrl}/companies/${dealcloud_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${dealCloudApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(writeBackPayload.fields)
    })

    if (!response.ok) {
      throw new Error(`DealCloud API error: ${response.status}`)
    }
    */

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'DealCloud write-back logged (API integration pending)',
        payload: writeBackPayload
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in dealcloud-write-back:', error)
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
