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
    
    const { companyId, companyName, website, batchId, classificationId, business_description }: ClassificationRequest = await req.json()
    
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

    // Fallback: try to find existing classification by website domain or company name
    const normalizeDomain = (url: string) => {
      try {
        const u = new URL(url)
        return u.hostname.replace(/^www\./, '')
      } catch (_) {
        return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
      }
    }
    const normalizedDomain = normalizeDomain(website)

    // 1) Try matching by website_domain
    const { data: domainCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('website_domain', normalizedDomain)
      .maybeSingle()

    let reuseClassification: any = null

    if (domainCompany) {
      const { data: byDomain } = await supabase
        .from('classifications')
        .select('*')
        .eq('company_id', domainCompany.id)
        .eq('status', 'Completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (byDomain) reuseClassification = byDomain
    }

    // 2) If not found, try matching by company name (case-insensitive)
    if (!reuseClassification) {
      const { data: nameCompany } = await supabase
        .from('companies')
        .select('id')
        .ilike('company_name', companyName)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (nameCompany) {
        const { data: byName } = await supabase
          .from('classifications')
          .select('*')
          .eq('company_id', nameCompany.id)
          .eq('status', 'Completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (byName) reuseClassification = byName
      }
    }

    if (reuseClassification) {
      console.log('Reusing classification found via website/company name')
      const { error: copyError2 } = await supabase
        .from('classifications')
        .update({
          status: 'Completed',
          primary_theme: reuseClassification.primary_theme,
          theme_id: reuseClassification.theme_id,
          pillar: reuseClassification.pillar,
          sector: reuseClassification.sector,
          business_model: reuseClassification.business_model,
          confidence_score: reuseClassification.confidence_score,
          rationale: `[Reused from previous classification] ${reuseClassification.rationale}`,
          model_used: reuseClassification.model_used,
          website_summary: reuseClassification.website_summary,
          perplexity_research: reuseClassification.perplexity_research,
          context_metadata: {
            ...reuseClassification.context_metadata,
            reused_from_classification_id: reuseClassification.id,
            reused_at: new Date().toISOString(),
            reuse_lookup: { normalizedDomain, companyName }
          }
        })
        .eq('id', classificationId)

      if (!copyError2) {
        await supabase
          .from('classification_batches')
          .update({ status: 'Completed', updated_at: new Date().toISOString() })
          .eq('id', batchId)

        return new Response(
          JSON.stringify({ 
            success: true, 
            classification: reuseClassification,
            reused: true,
            message: 'Reused existing classification matched by website/company name'
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

    // ==================== WEBSITE SCRAPING ====================
    console.log('Scraping company website with Firecrawl')
    
    let websiteContent = ''
    let websiteError = null
    let hasValidWebsite = true
    
    // Check if website is valid before attempting scrape
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

    // ==================== STAGE 0: Climate Relevance Check ====================
    console.log('Stage 0: Quick climate relevance check')
    
    const stage0Prompt = `You are a climate tech investment analyst. Determine if this company is climate-related.

Company: ${companyName}
${hasValidWebsite ? `Website: ${website}` : 'Website: Not provided'}

${business_description ? `Business Description (from SourceScrub):\n${business_description}\n` : ''}
${websiteContent ? `Website Content:\n${websiteContent.substring(0, 8000)}` : hasValidWebsite ? 'Website content unavailable.' : 'No website available - classify based on company name and business description.'}

${!hasValidWebsite ? 'NOTE: No valid website URL was provided. Base your assessment on the company name and business description only.\n' : ''}

A company is climate-related if it:
- Reduces greenhouse gas emissions (decarbonization)
- Enables renewable energy or energy transition
- Improves resource sustainability (water, waste, circular economy)
- Provides climate adaptation or resilience solutions
- Manufactures components/systems for climate solutions
- Provides software/services enabling climate solutions

Respond with a JSON object:
{
  "is_climate_related": true/false,
  "rationale": "brief explanation (1-2 sentences)"
}`

    const stage0Response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: stage0Prompt }
        ],
        response_format: { type: 'json_object' },
      }),
    })

    if (!stage0Response.ok) {
      const errorText = await stage0Response.text()
      throw new Error(`Lovable AI Stage 0 error: ${stage0Response.status} - ${errorText}`)
    }

    const stage0Data = await stage0Response.json()
    const stage0Result = JSON.parse(stage0Data.choices[0].message.content)
    
    console.log('Stage 0 result:', stage0Result)

    // If not climate-related, classify as "Other"
    if (!stage0Result.is_climate_related) {
      console.log('Company not climate-related, classifying as "Other"')
      
      const updateData = {
        status: 'Completed',
        primary_theme: null,
        theme_id: null,
        pillar: 'Other',
        sector: null,
        business_model: null,
        confidence_score: 0.95,
        rationale: `Not climate-related: ${stage0Result.rationale}`,
        model_used: 'gemini-2.5-flash',
        website_summary: websiteContent.substring(0, 1000),
        context_metadata: {
          stage0_climate_check: false,
          stage0_rationale: stage0Result.rationale,
          website_scraped: !!websiteContent,
          scraping_error: websiteError,
          has_valid_website: hasValidWebsite,
        }
      }

      const { error: updateError } = await supabase
        .from('classifications')
        .update(updateData)
        .eq('id', classificationId)

      if (updateError) {
        throw new Error(`Failed to update classification: ${updateError.message}`)
      }

      await supabase
        .from('classification_batches')
        .update({ status: 'Completed', updated_at: new Date().toISOString() })
        .eq('id', batchId)

      console.log(`Classification completed for ${companyName} - classified as Other`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          classification: updateData,
          stages_used: 'Stage 0 only (Out of Scope)'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

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

IMPORTANT: If the company does NOT fit any theme (even after careful analysis), you can classify it as "Other":
- Set pillar to "Other"
- Set theme_id, theme_name, sector, and business_model to null
- Explain why it doesn't fit any theme in the rationale

Respond with a JSON object:
{
  "theme_id": "uuid of the selected theme OR null if Other",
  "theme_name": "theme name OR null if Other",
  "pillar": "pillar name OR 'Other' if no fit",
  "sector": "sector name OR null if Other",
  "business_model": "primary business model from theme's list OR null if Other",
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
3. Gather information on:
   - Business model and revenue streams
   - Products/services offered
   - Market positioning and customers
   - Technology and approach
   - Recent news and developments

Then classify into ONE theme from this taxonomy:
${JSON.stringify(compressedTaxonomy, null, 2)}

IMPORTANT: If after research the company still does NOT fit any theme, you can classify it as "Other":
- Set pillar to "Other"
- Set theme_id, theme_name, sector, and business_model to null
- Explain why it doesn't fit any theme in the rationale

Respond with a JSON object:
{
  "company_verification_passed": ${business_description ? 'true/false (does research match expected business description?)' : 'true'},
  "verification_notes": ${business_description ? '"brief note if verification failed"' : 'null'},
  "theme_id": "uuid of the selected theme OR null if Other",
  "theme_name": "theme name OR null if Other",
  "pillar": "pillar name OR 'Other' if no fit",
  "sector": "sector name OR null if Other",
  "business_model": "primary business model from theme's list OR null if Other",
  "confidence_score": 0.0-1.0 (reduce by 0.3 if company_verification_passed is false),
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
        model: 'google/gemini-2.5-pro',
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

    if (!stage2Response.ok) {
      const errorText = await stage2Response.text()
      console.error('Stage 2 failed:', errorText)
      // Fallback to Stage 1 result if Stage 2 fails
      finalResult = stage1Result
      finalResult.sources_consulted = 'Stage 2 research failed, using website analysis only'
    } else {
      const stage2Data = await stage2Response.json()
      finalResult = JSON.parse(stage2Data.choices[0].message.content)
      console.log('Stage 2 result:', finalResult)
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
      model_used: 'gemini-2.5-pro',
      website_summary: websiteContent.substring(0, 1000),
      perplexity_research: finalResult.sources_consulted || null,
      context_metadata: {
        stage0_climate_check: true,
        stage1_confidence: stage1Result.confidence_score,
        stage2_always_run: true,
        company_verification_passed: finalResult.company_verification_passed !== false,
        verification_notes: finalResult.verification_notes || null,
        website_scraped: !!websiteContent,
        scraping_error: websiteError,
        has_valid_website: hasValidWebsite,
        classified_as_other: finalResult.pillar === 'Other',
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
        stages_used: 'Stage 0 (climate check) + Stage 1 (website) + Stage 2 (Google Search)',
        verification_passed: updateData.context_metadata.company_verification_passed
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
