import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClassificationResult {
  classification_id: string
  pillar: string
  sector: string
  theme: string
  theme_id?: string
  business_model?: string
  confidence_score: number
  rationale: string
  perplexity_research?: string
  context_metadata?: {
    perplexity_citations?: any[]
    sources_used?: string[]
    search_config?: any
    data_freshness?: string
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { classification_id, result, n8n_execution_id } = await req.json() as {
      classification_id: string
      result: ClassificationResult
      n8n_execution_id?: string
    }

    console.log(`Processing classification result for ${classification_id}`)

    // Update classification with all results
    const { data: classification, error: updateError } = await supabase
      .from('classifications')
      .update({
        pillar: result.pillar,
        sector: result.sector,
        primary_theme: result.theme,
        theme_id: result.theme_id || null,
        business_model: result.business_model || null,
        confidence_score: result.confidence_score,
        rationale: result.rationale,
        perplexity_research: result.perplexity_research || null,
        context_metadata: result.context_metadata || {},
        n8n_execution_id: n8n_execution_id || null,
        status: 'Completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', classification_id)
      .select('*, companies(*)')
      .single()

    if (updateError) {
      console.error('Error updating classification:', updateError)
      throw updateError
    }

    console.log(`Classification ${classification_id} completed successfully`)

    // If this classification has a batch_id, check if batch is complete
    if (classification.batch_id) {
      const { data: batchClassifications } = await supabase
        .from('classifications')
        .select('status')
        .eq('batch_id', classification.batch_id)

      const allCompleted = batchClassifications?.every(c => c.status === 'Completed')
      
      if (allCompleted) {
        await supabase
          .from('classification_batches')
          .update({ 
            status: 'Completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', classification.batch_id)
        
        console.log(`Batch ${classification.batch_id} marked as complete`)
      }
    }

    // If this classification came from DealCloud, trigger write-back
    if (classification.source_system === 'dealcloud' && classification.dealcloud_id) {
      console.log(`Triggering DealCloud write-back for ${classification.dealcloud_id}`)
      
      const { error: writeBackError } = await supabase.functions.invoke('dealcloud-write-back', {
        body: {
          dealcloud_id: classification.dealcloud_id,
          classification: {
            pillar: result.pillar,
            sector: result.sector,
            theme: result.theme,
            confidence: result.confidence_score,
            rationale: result.rationale
          }
        }
      })

      if (writeBackError) {
        console.error('DealCloud write-back failed:', writeBackError)
        // Don't fail the whole operation if write-back fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        classification_id,
        dealcloud_write_back_triggered: classification.source_system === 'dealcloud'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in unified-classification-webhook:', error)
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
