import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CarbonBriefArticle {
  title: string
  url: string
  content: string
  author: string
  publishedAt: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Starting Carbon Brief Daily scrape...')

    // Fetch the Carbon Brief Daily page
    const response = await fetch('https://www.carbonbrief.org/daily-brief')
    const html = await response.text()
    
    console.log('Fetched Carbon Brief page, extracting content...')

    // Parse HTML with cheerio
    const $ = cheerio.load(html)
    
    // Extract date
    const dateText = $('.dateInput').text().trim()
    let publishedDate = new Date().toISOString()
    if (dateText) {
      // Convert "31.07.2025" format to ISO date
      const dateParts = dateText.split('.')
      if (dateParts.length === 3) {
        const [day, month, year] = dateParts
        publishedDate = new Date(`${year}-${month}-${day}`).toISOString()
      }
    }

    // Extract articles
    const articles: CarbonBriefArticle[] = []
    const headlines: string[] = []
    const contents: string[] = []
    const sources: string[] = []
    const urls: string[] = []

    $('.dailystory .storyheading').each((i, el) => {
      headlines.push($(el).text().trim())
    })

    $('.dailystory .storycont').each((i, el) => {
      contents.push($(el).text().trim())
    })

    $('.dailystory .storycredits').each((i, el) => {
      sources.push($(el).text().trim())
    })

    $('.dailystory .storycredits a').each((i, el) => {
      urls.push($(el).attr('href') || '')
    })

    console.log(`Extracted ${headlines.length} headlines, ${contents.length} content blocks, ${urls.length} URLs`)

    // Process articles
    for (let i = 0; i < headlines.length; i++) {
      const content = contents[i] || ''
      
      // Skip items without substantial content
      if (content.length < 100) continue

      const article: CarbonBriefArticle = {
        title: headlines[i] || '',
        url: urls[i] || '',
        content: content.trim(),
        author: sources[i]?.split(' Read Article')[0] || 'Carbon Brief',
        publishedAt: publishedDate,
      }

      articles.push(article)
    }

    console.log(`Processing ${articles.length} valid articles...`)

    // Insert into raw_signals table
    const signalsToInsert = articles.map((article, index) => ({
      signal_id: `carbon-brief-${Date.now()}-${index}`,
      title: article.title,
      url: article.url,
      description: article.content,
      source: 'Carbon Brief Daily',
      source_type: 'html',
      author: article.author,
      publication_date: article.publishedAt.split('T')[0], // Just the date
      scraped_date: new Date().toISOString(),
    }))

    if (signalsToInsert.length > 0) {
      const { data, error } = await supabase
        .from('raw_signals')
        .insert(signalsToInsert)
        .select()

      if (error) {
        console.error('Error inserting signals:', error)
        throw error
      }

      console.log(`Successfully inserted ${data.length} signals from Carbon Brief`)

      return new Response(
        JSON.stringify({
          success: true,
          articlesFound: articles.length,
          articlesInserted: data.length,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    } else {
      console.log('No valid articles found to insert')
      return new Response(
        JSON.stringify({
          success: true,
          articlesFound: 0,
          articlesInserted: 0,
          message: 'No articles with sufficient content found',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error('Error in scrape-carbon-brief:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
