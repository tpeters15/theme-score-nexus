import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClassificationRequest {
  companyId: string
  companyName: string
  website: string
  business_description?: string
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
    
    const { companyId, companyName, website, business_description }: ClassificationRequest = await req.json()
    
    console.log(`Starting classification for ${companyName} (${website})`)

    // Check for existing classification mapping
    const { data: existingMapping } = await supabase
      .from('company_theme_mappings')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle()

    if (existingMapping) {
      console.log(`Found existing classification for company ${companyId}`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          mapping: existingMapping,
          reused: true,
          message: 'Company already classified'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // ==================== WEBSITE SCRAPING ====================
    console.log('Scraping company website with Firecrawl')
    
    let websiteContent = ''
    let websiteError = null
    let hasValidWebsite = true
    
    if (!website || website.length < 3 || !website.includes('.')) {
      websiteError = 'No valid website URL provided'
      hasValidWebsite = false
      console.log('No valid website - will rely on company name and business description')
    } else {
      try {
        const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: website.startsWith('http') ? website : `https://${website}`,
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

    // ==================== STAGE 1: Initial Classification ====================
    console.log('Stage 1: Analyzing website content with Gemini')
    
    const stage1Prompt = `You are a climate tech investment analyst. Analyze this company and classify it into ONE primary theme from our taxonomy.

Company: ${companyName}
${hasValidWebsite ? `Website: ${website}` : 'Website: Not provided'}

${business_description ? `Business Description (from SourceScrub):\n${business_description}\n` : ''}
${websiteContent ? `Website Content:\n${websiteContent.substring(0, 8000)}` : hasValidWebsite ? 'Website content unavailable.' : 'No website available - classify based on company name and business description.'}

${!hasValidWebsite ? 'NOTE: No valid website URL was provided. Base classification on company name and business description. Reduce confidence slightly due to limited information.\n' : ''}

Taxonomy (select ONE theme):
${JSON.stringify(compressedTaxonomy, null, 2)}

IMPORTANT: If the company does NOT fit any theme (even after careful analysis), return null for theme_id and explain why.

Respond with a JSON object:
{
  "theme_id": "uuid of the selected theme OR null if no fit",
  "theme_name": "theme name OR null if no fit",
  "pillar": "pillar name",
  "sector": "sector name OR null",
  "business_model": "primary business model from theme's list OR null",
  "confidence_score": 0.0-1.0,
  "rationale": "brief explanation (2-3 sentences)"
}`
    
    const stage1Prompt = `You are a climate tech investment analyst. Analyze this company and classify it into ONE primary theme from our taxonomy.

Company: ${companyName}
${hasValidWebsite ? `Website: ${website}` : 'Website: Not provided'}

${business_description ? `Business Description (from SourceScrub):\n${business_description}\n` : ''}
${websiteContent ? `Website Content:\n${websiteContent.substring(0, 8000)}` : hasValidWebsite ? 'Website content unavailable.' : 'No website available - classify based on company name and business description.'}

${!hasValidWebsite ? 'NOTE: No valid website URL was provided. Base classification on company name and business description. Reduce confidence slightly due to limited information.\n' : ''}

Taxonomy (select ONE theme):
${JSON.stringify(compressedTaxonomy, null, 2)}

IMPORTANT: If the company does NOT fit any theme (even after careful analysis), return null for theme_id and explain why.

Respond with a JSON object:
{
  "theme_id": "uuid of the selected theme OR null if no fit",
  "theme_name": "theme name OR null if no fit",
  "pillar": "pillar name",
  "sector": "sector name OR null",
  "business_model": "primary business model from theme's list OR null",
  "confidence_score": 0.0-1.0,
  "rationale": "brief explanation (2-3 sentences)"
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

    let finalResult = stage1Result

    // ==================== STAGE 2: Web Research (ALWAYS RUN) ====================
    console.log('Stage 2: Conducting web research with Gemini + Google Search')
    
    const stage2Prompt = `You are a climate tech investment analyst. Research and classify this company into ONE primary theme from our taxonomy.

Company: ${companyName}
${hasValidWebsite ? `Website Domain: ${website}` : 'Website: Not provided'}

${business_description ? `Expected Business Description (from SourceScrub - USE THIS TO VERIFY YOU'RE RESEARCHING THE CORRECT COMPANY):\n${business_description}\n\n` : ''}
${websiteContent ? `Initial Website Analysis:\n${stage1Result.rationale}\n\n` : ''}

${!hasValidWebsite ? 'NOTE: No valid website URL was provided. Search using company name only and verify against business description.\n\n' : ''}

CRITICAL VERIFICATION STEP:
1. Research the company "${companyName}" ${hasValidWebsite ? `(website: ${website})` : ''} using current web sources
2. ${business_description ? `VERIFY that the web search results match the expected business description above. If the search results describe a completely different company, set "company_verification_passed" to false and reduce confidence.` : 'Focus on finding accurate information about this specific company.'}
3. Select the BEST FITTING theme from the taxonomy

Taxonomy (select ONE theme):
${JSON.stringify(compressedTaxonomy, null, 2)}

Respond with a JSON object:
{
  "company_verification_passed": true/false,
  "verification_notes": "explanation if verification failed OR null",
  "theme_id": "uuid of the selected theme OR null if no fit",
  "theme_name": "theme name OR null if no fit",
  "pillar": "pillar name",
  "sector": "sector name OR null",
  "business_model": "primary business model OR null",
  "confidence_score": 0.0-1.0,
  "rationale": "detailed explanation referencing research sources",
  "sources_consulted": "list of sources used for research"
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
        response_format: { type: 'json_object' },
        tools: [{
          type: 'google_search'
        }]
      }),
    })

    if (!stage2Response.ok) {
      const errorText = await stage2Response.text()
      throw new Error(`Lovable AI Stage 2 error: ${stage2Response.status} - ${errorText}`)
    }

    const stage2Data = await stage2Response.json()
    const stage2Result = JSON.parse(stage2Data.choices[0].message.content)
    
    console.log('Stage 2 result:', stage2Result)
    
    finalResult = stage2Result

    // ==================== STAGE 2.5: Research Synthesis ====================
    console.log('Stage 2.5: Creating consolidated research summary')
    
    let researchSummary = ''
    
    try {
      const synthesisPrompt = `You are a climate tech investment analyst. Create a comprehensive research synthesis for this company classification.

Company: ${companyName}
Website: ${website || 'Not provided'}

INFORMATION SOURCES:

1. Website Scraping Results:
${websiteContent ? websiteContent.substring(0, 6000) : 'No website content available'}

2. Web Research Findings:
${stage2Result.rationale}
${stage2Result.sources_consulted ? `\nSources: ${stage2Result.sources_consulted}` : ''}

3. Initial Classification:
- Theme: ${finalResult.theme_name || 'None'}
- Pillar: ${finalResult.pillar}
- Sector: ${finalResult.sector || 'N/A'}
- Business Model: ${finalResult.business_model || 'N/A'}
- Confidence: ${(finalResult.confidence_score * 100).toFixed(0)}%

Create a structured research summary in this format:

## Executive Summary
[2-3 sentences summarizing what the company does and its climate tech relevance]

## Business Model Analysis
[Describe revenue model, target customers, value proposition]

## Technology & Products
[Key technologies, products/services, technical approach]

## Market Position & Impact
[Market stage, competitive positioning, climate impact potential]

## Classification Rationale
[Why this theme/sector/pillar fits best, key evidence from research]

Make this comprehensive but concise (aim for 400-600 words). This will be used by analysts to verify the classification.`

      const synthesisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'user', content: synthesisPrompt }
          ],
        }),
      })

      if (synthesisResponse.ok) {
        const synthesisData = await synthesisResponse.json()
        researchSummary = synthesisData.choices[0].message.content
        console.log(`Generated research summary (${researchSummary.length} characters)`)
      } else {
        console.error('Failed to generate research summary:', synthesisResponse.status)
        researchSummary = `# Research Summary\n\n**Website Analysis:**\n${websiteContent ? websiteContent.substring(0, 500) : 'No website content'}\n\n**Classification:**\n${finalResult.rationale}`
      }
    } catch (error) {
      console.error('Research synthesis error:', error)
      researchSummary = `# Research Summary\n\n**Classification Rationale:**\n${finalResult.rationale}`
    }

    // ==================== STAGE 3: Save to company_theme_mappings ====================
    console.log('Stage 3: Saving final classification and research summary')

    // Only create mapping if we have a valid theme
    if (finalResult.theme_id) {
      const { error: mappingError } = await supabase
        .from('company_theme_mappings')
        .insert({
          company_id: companyId,
          theme_id: finalResult.theme_id,
          is_primary: true,
          confidence_score: finalResult.confidence_score,
          notes: finalResult.rationale,
          classified_by: null, // System classification
        })

      if (mappingError) {
        throw new Error(`Failed to create theme mapping: ${mappingError.message}`)
      }

      // Update company status to completed and save research summary
      await supabase
        .from('companies')
        .update({
          classification_status: 'completed',
          classification_research_summary: researchSummary
        })
        .eq('id', companyId)
    } else {
      // No theme found - update status
      await supabase
        .from('companies')
        .update({
          classification_status: 'no_theme_found',
          classification_error_message: finalResult.rationale
        })
        .eq('id', companyId)
    }

    console.log(`Classification completed for ${companyName}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        result: finalResult,
        stages_used: 'Stage 1 (website) + Stage 2 (Google Search)',
        verification_passed: finalResult.company_verification_passed !== false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Classification error:', error)
    
    // Update company status to failed
    try {
      const { companyId } = await req.json()
      if (companyId) {
        await supabase
          .from('companies')
          .update({
            classification_status: 'failed',
            classification_error_message: error.message
          })
          .eq('id', companyId)
      }
    } catch (updateError) {
      console.error('Failed to update company status:', updateError)
    }
    
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
