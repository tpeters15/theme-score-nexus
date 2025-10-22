import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
}

// Verify webhook signature for authentication
async function verifyWebhookSignature(payload: string, signature: string | null): Promise<boolean> {
  if (!signature) return false
  
  const webhookSecret = Deno.env.get('N8N_WEBHOOK_SECRET')
  if (!webhookSecret) {
    console.error('N8N_WEBHOOK_SECRET not configured')
    return false
  }
  
  const encoder = new TextEncoder()
  const key = encoder.encode(webhookSecret)
  const message = encoder.encode(payload)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )
  
  const signatureBytes = hexToBytes(signature)
  return crypto.subtle.verify('HMAC', cryptoKey, signatureBytes, message)
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook authentication
    const rawBody = await req.text()
    const signature = req.headers.get('x-webhook-signature')
    
    const isValid = await verifyWebhookSignature(rawBody, signature)
    if (!isValid) {
      console.error('Invalid webhook signature')
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid signature' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { action, data } = JSON.parse(rawBody)
    
    console.log('Received n8n webhook:', { action, data })

    switch (action) {
      case 'start_research':
        return await handleStartResearch(supabaseClient, data)
      case 'update_progress':
        return await handleUpdateProgress(supabaseClient, data)
      case 'complete_research':
        return await handleCompleteResearch(supabaseClient, data)
      case 'research_failed':
        return await handleResearchFailed(supabaseClient, data)
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Error in n8n webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleStartResearch(supabase: any, data: any) {
  const { run_id, theme_id, criteria_ids, n8n_execution_id, started_by } = data

  // Update research run status
  const { error: updateError } = await supabase
    .from('n8n_research_runs')
    .update({
      status: 'running',
      n8n_execution_id,
      started_at: new Date().toISOString()
    })
    .eq('id', run_id)

  if (updateError) {
    console.error('Error updating research run:', updateError)
    return new Response(
      JSON.stringify({ error: 'Failed to update research run' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Research started' }),
    { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  )
}

async function handleUpdateProgress(supabase: any, data: any) {
  const { run_id, progress_data } = data

  // Update research run with progress data
  const { error: updateError } = await supabase
    .from('n8n_research_runs')
    .update({
      results_summary: progress_data
    })
    .eq('id', run_id)

  if (updateError) {
    console.error('Error updating research progress:', updateError)
    return new Response(
      JSON.stringify({ error: 'Failed to update progress' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Progress updated' }),
    { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  )
}

async function handleCompleteResearch(supabase: any, data: any) {
  const { run_id, theme_id, research_results, documents } = data

  try {
    // Update research run status
    await supabase
      .from('n8n_research_runs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        results_summary: research_results.summary
      })
      .eq('id', run_id)

    // Update detailed scores with AI research data
    if (research_results.criteria_scores) {
      for (const criteriaResult of research_results.criteria_scores) {
        const { criteria_id, suggested_score, confidence, ai_research_data, notes } = criteriaResult

        // Upsert detailed score
        await supabase
          .from('detailed_scores')
          .upsert({
            theme_id,
            criteria_id,
            score: suggested_score,
            confidence,
            ai_research_data,
            notes,
            update_source: 'n8n_agent',
            updated_at: new Date().toISOString()
          })
      }
    }

    // Store research documents metadata
    if (documents && documents.length > 0) {
      for (const doc of documents) {
        await supabase
          .from('research_documents')
          .insert({
            theme_id,
            criteria_id: doc.criteria_id,
            title: doc.title,
            description: doc.description,
            document_type: doc.document_type,
            file_path: doc.file_path,
            file_size: doc.file_size,
            mime_type: doc.mime_type,
            n8n_agent_run_id: run_id
          })
      }
    }

    console.log('Research completed successfully for run:', run_id)

    return new Response(
      JSON.stringify({ success: true, message: 'Research completed and data stored' }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    console.error('Error completing research:', error)
    
    // Mark run as failed
    await supabase
      .from('n8n_research_runs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message
      })
      .eq('id', run_id)

    return new Response(
      JSON.stringify({ error: 'Failed to complete research' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
}

async function handleResearchFailed(supabase: any, data: any) {
  const { run_id, error_message } = data

  const { error: updateError } = await supabase
    .from('n8n_research_runs')
    .update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      error_message
    })
    .eq('id', run_id)

  if (updateError) {
    console.error('Error updating failed research run:', updateError)
    return new Response(
      JSON.stringify({ error: 'Failed to update research run' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Research failure recorded' }),
    { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  )
}