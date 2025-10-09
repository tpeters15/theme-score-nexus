import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClassificationRequest {
  companyId: string
  companyName: string
  website: string
  batchId: string
  classificationId: string
}

interface TaxonomyData {
  pillars: Array<{
    name: string
    sectors: Array<{
      name: string
      themes: Array<{
        id: string
        name: string
        description: string
        impact: string
        in_scope: string[]
        out_of_scope: string[]
        business_models: string[]
      }>
    }>
  }>
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY')!
    const lovableAiKey = Deno.env.get('LOVABLE_API_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { companyId, companyName, website, batchId, classificationId }: ClassificationRequest = await req.json()
    
    console.log(`Starting classification for ${companyName} (${website})`)

    // Check for existing completed classification for this company
    const { data: existingClassification } = await supabase
      .from('classifications')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'Completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // If we have an existing classification, use it instead of re-classifying
    if (existingClassification) {
      console.log(`Found existing classification for company ${companyId}, reusing results`)
      
      // Copy the existing classification data to the new classification record
      const { error: copyError } = await supabase
        .from('classifications')
        .update({
          status: 'Completed',
          primary_theme: existingClassification.primary_theme,
          theme_id: existingClassification.theme_id,
          pillar: existingClassification.pillar,
          sector: existingClassification.sector,
          business_model: existingClassification.business_model,
          confidence_score: existingClassification.confidence_score,
          rationale: `[Reused from previous classification] ${existingClassification.rationale}`,
          model_used: existingClassification.model_used,
          website_summary: existingClassification.website_summary,
          perplexity_research: existingClassification.perplexity_research,
          context_metadata: {
            ...existingClassification.context_metadata,
            reused_from_classification_id: existingClassification.id,
            reused_at: new Date().toISOString(),
          }
        })
        .eq('id', classificationId)

      if (copyError) {
        console.error('Error copying classification:', copyError)
      } else {
        // Update batch status
        await supabase
          .from('classification_batches')
          .update({ status: 'Completed', updated_at: new Date().toISOString() })
          .eq('id', batchId)

        return new Response(
          JSON.stringify({ 
            success: true, 
            classification: existingClassification,
            reused: true,
            message: 'Reused existing classification for this company'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }
    }

    // Update status to Processing (only if we're doing a new classification)
    await supabase
      .from('classifications')
      .update({ status: 'Processing' })
      .eq('id', classificationId)

    // ==================== STAGE 1: Company Website Analysis ====================
    console.log('Stage 1: Scraping company website with Firecrawl')
    
    let websiteContent = ''
    let websiteError = null
    
    try {
      const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: website,
          formats: ['markdown'],
          onlyMainContent: true,
          waitFor: 2000,
        }),
      })

      if (firecrawlResponse.ok) {
        const firecrawlData = await firecrawlResponse.json()
        websiteContent = firecrawlData.data?.markdown || firecrawlData.data?.content || ''
        console.log(`Scraped ${websiteContent.length} characters from website`)
      } else {
        websiteError = `Firecrawl error: ${firecrawlResponse.status}`
        console.error(websiteError)
      }
    } catch (error) {
      websiteError = `Firecrawl failed: ${error.message}`
      console.error(websiteError)
    }

    // Fetch taxonomy
    console.log('Fetching taxonomy')
    const { data: taxonomyData, error: taxonomyError } = await supabase.rpc('get_taxonomy_json')
    
    if (taxonomyError) {
      throw new Error(`Failed to fetch taxonomy: ${taxonomyError.message}`)
    }

    const taxonomy = taxonomyData as TaxonomyData

    // Create compressed taxonomy for initial classification
    const compressedTaxonomy = taxonomy.pillars.map(p => ({
      pillar: p.name,
      sectors: p.sectors.map(s => ({
        sector: s.name,
        themes: s.themes.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          business_models: t.business_models
        }))
      }))
    }))

    // Stage 1: Initial classification with website content
    console.log('Stage 1: Analyzing website content with Gemini')
    
    const stage1Prompt = `You are a climate tech investment analyst. Analyze this company and classify it into ONE primary theme from our taxonomy.

Company: ${companyName}
Website: ${website}

${websiteContent ? `Website Content:\n${websiteContent.substring(0, 8000)}` : 'Website content unavailable.'}

Taxonomy (select ONE theme):
${JSON.stringify(compressedTaxonomy, null, 2)}

Respond with a JSON object:
{
  "theme_id": "uuid of the selected theme",
  "theme_name": "theme name",
  "pillar": "pillar name",
  "sector": "sector name",
  "business_model": "primary business model from theme's list",
  "confidence_score": 0.0-1.0,
  "rationale": "brief explanation (2-3 sentences)",
  "needs_more_research": true/false (true if confidence < 0.7 or website content insufficient)
}`

    const stage1Response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: stage1Prompt }
        ],
        response_format: { type: 'json_object' },
      }),
    })

    if (!stage1Response.ok) {
      const errorText = await stage1Response.text()
      throw new Error(`Lovable AI Stage 1 error: ${stage1Response.status} - ${errorText}`)
    }

    const stage1Data = await stage1Response.json()
    const stage1Result = JSON.parse(stage1Data.choices[0].message.content)
    
    console.log('Stage 1 result:', stage1Result)

    // ==================== STAGE 2: Web Research (if needed) ====================
    let finalResult = stage1Result
    
    if (stage1Result.needs_more_research || stage1Result.confidence_score < 0.7) {
      console.log('Stage 2: Conducting web research with Gemini + Google Search')
      
      const stage2Prompt = `You are a climate tech investment analyst. Research and classify this company into ONE primary theme from our taxonomy.

Company: ${companyName}
Website Domain: ${website}

${websiteContent ? `Initial Website Analysis:\n${stage1Result.rationale}\n\n` : ''}

Research the company "${companyName}" (website: ${website}) using current web sources to gather:
- Business model and revenue streams
- Products/services offered
- Market positioning and customers
- Technology and approach
- Recent news and developments

Then classify into ONE theme from this taxonomy:
${JSON.stringify(compressedTaxonomy, null, 2)}

Respond with a JSON object:
{
  "theme_id": "uuid of the selected theme",
  "theme_name": "theme name",
  "pillar": "pillar name",
  "sector": "sector name",
  "business_model": "primary business model from theme's list",
  "confidence_score": 0.0-1.0,
  "rationale": "detailed explanation based on web research (3-4 sentences)",
  "sources_consulted": "brief note on what sources informed the decision"
}`

      const stage2Response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'user', content: stage2Prompt }
          ],
          tools: [
            {
              google_search_retrieval: {}
            }
          ],
          response_format: { type: 'json_object' },
        }),
      })

      if (stage2Response.ok) {
        const stage2Data = await stage2Response.json()
        const stage2Result = JSON.parse(stage2Data.choices[0].message.content)
        console.log('Stage 2 result:', stage2Result)
        finalResult = stage2Result
      } else {
        console.error('Stage 2 failed, using Stage 1 result')
      }
    }

    // ==================== STAGE 3: Save Final Classification ====================
    console.log('Stage 3: Saving final classification')
    
    const updateData = {
      status: 'Completed',
      primary_theme: finalResult.theme_name,
      theme_id: finalResult.theme_id,
      pillar: finalResult.pillar,
      sector: finalResult.sector,
      business_model: finalResult.business_model,
      confidence_score: finalResult.confidence_score,
      rationale: finalResult.rationale,
      model_used: 'gemini-2.5-flash',
      website_summary: websiteContent.substring(0, 1000),
      perplexity_research: finalResult.sources_consulted || null,
      context_metadata: {
        stage1_confidence: stage1Result.confidence_score,
        stage2_triggered: stage1Result.needs_more_research || stage1Result.confidence_score < 0.7,
        website_scraped: !!websiteContent,
        scraping_error: websiteError,
      }
    }

    const { error: updateError } = await supabase
      .from('classifications')
      .update(updateData)
      .eq('id', classificationId)

    if (updateError) {
      throw new Error(`Failed to update classification: ${updateError.message}`)
    }

    // Update batch status
    await supabase
      .from('classification_batches')
      .update({ status: 'Completed', updated_at: new Date().toISOString() })
      .eq('id', batchId)

    console.log(`Classification completed for ${companyName}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        classification: updateData,
        stages_used: updateData.context_metadata.stage2_triggered ? 'Stage 1 + 2' : 'Stage 1 only'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Classification error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
