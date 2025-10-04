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

    console.log('Starting Carbon Brief articles scrape...')

    // Fetch the Carbon Brief main articles page
    const response = await fetch('https://www.carbonbrief.org/category/articles/')
    const html = await response.text()
    
    console.log('Fetched Carbon Brief articles page, extracting content...')

    // Parse HTML with cheerio
    const $ = cheerio.load(html)
    
    const articles: CarbonBriefArticle[] = []

    // Extract articles from the main articles feed
    $('.post').each((index, element) => {
      const $post = $(element)
      
      // Get title and URL
      const $titleLink = $post.find('h2.entry-title a, h3.entry-title a')
      const title = $titleLink.text().trim()
      const url = $titleLink.attr('href') || ''
      
      // Get excerpt/description
      const description = $post.find('.entry-summary p, .entry-content p').first().text().trim()
      
      // Get author
      const author = $post.find('.author a, .by-author a').text().trim() || 'Carbon Brief'
      
      // Get published date
      const dateText = $post.find('time.entry-date, .published').attr('datetime') || 
                       $post.find('.entry-date').text().trim()
      let publishedDate = new Date().toISOString()
      if (dateText) {
        try {
          publishedDate = new Date(dateText).toISOString()
        } catch (e) {
          console.log('Could not parse date:', dateText)
        }
      }
      
      // Skip if essential data is missing
      if (!title || !url || description.length < 50) {
        console.log('Skipping article with insufficient data:', title)
        return
      }

      // Only include Carbon Brief's own articles (not external links)
      if (url.includes('carbonbrief.org')) {
        articles.push({
          title,
          url,
          content: description,
          author,
          publishedAt: publishedDate,
        })
      }
    })

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
