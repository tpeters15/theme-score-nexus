import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClassificationResult {
  company_id: string
  primary_theme: string
  confidence_score: number
  rationale: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { batch_id, results } = await req.json() as {
      batch_id: string
      results: ClassificationResult[]
    }

    console.log(`Processing ${results.length} classification results for batch ${batch_id}`)

    // Update each classification record
    for (const result of results) {
      const { error } = await supabase
        .from('classifications')
        .update({
          primary_theme: result.primary_theme,
          confidence_score: result.confidence_score,
          rationale: result.rationale,
          status: 'Completed'
        })
        .eq('company_id', result.company_id)
        .eq('batch_id', batch_id)

      if (error) {
        console.error(`Error updating classification for company ${result.company_id}:`, error)
      }
    }

    // Update batch status
    const { error: batchError } = await supabase
      .from('classification_batches')
      .update({ status: 'Completed' })
      .eq('id', batch_id)

    if (batchError) {
      console.error('Error updating batch status:', batchError)
    }

    console.log(`Batch ${batch_id} completed successfully`)

    return new Response(
      JSON.stringify({ success: true, processed: results.length }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in batch-classification-webhook:', error)
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
