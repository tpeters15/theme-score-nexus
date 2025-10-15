import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessedSignalRow {
  signal_id: string
  signal_type: string
  countries: string
  content_snippet: string
  week_processed: string
  days_old_when_processed: string
  extracted_deal_size: string
  content_length: string
  has_pitchbook_data: string
  processed_timestamp: string
}

function parseCSV(text: string): ProcessedSignalRow[] {
  const lines = text.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim().replace(/^\uFEFF/, '')) // Remove BOM
  
  return lines.slice(1).map(line => {
    // Handle CSV with quoted fields that may contain commas
    const values: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    
    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    return row
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const csvText = await file.text()
    const rows = parseCSV(csvText)
    
    console.log(`Processing ${rows.length} rows from CSV`)

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const row of rows) {
      try {
        // Find the raw_signal by signal_id
        const { data: rawSignal, error: lookupError } = await supabase
          .from('raw_signals')
          .select('id')
          .eq('signal_id', row.signal_id)
          .single()

        if (lookupError || !rawSignal) {
          errors.push(`Signal ID ${row.signal_id}: No matching raw_signal found`)
          errorCount++
          continue
        }

        // Parse countries - can be comma or semicolon separated
        let countries = null
        if (row.countries && row.countries.trim() && row.countries !== 'null') {
          const separator = row.countries.includes(';') ? ';' : ','
          countries = row.countries.split(separator).map((c: string) => c.trim()).filter(Boolean)
        }

        // Parse has_pitchbook_data
        const hasPitchbookData = row.has_pitchbook_data?.toLowerCase() === 'yes' || 
                                 row.has_pitchbook_data?.toLowerCase() === 'true' ||
                                 row.has_pitchbook_data === '1'

        // Insert into processed_signals
        const { error: insertError } = await supabase
          .from('processed_signals')
          .insert({
            raw_signal_id: rawSignal.id,
            signal_type_classified: row.signal_type || null,
            countries: countries,
            content_snippet: row.content_snippet || null,
            week_processed: row.week_processed || null,
            days_old_when_processed: row.days_old_when_processed ? parseInt(row.days_old_when_processed) : null,
            extracted_deal_size: row.extracted_deal_size || null,
            content_length: row.content_length ? parseInt(row.content_length) : null,
            has_pitchbook_data: hasPitchbookData,
            processed_timestamp: row.processed_timestamp || new Date().toISOString(),
          })

        if (insertError) {
          errors.push(`Signal ID ${row.signal_id}: ${insertError.message}`)
          errorCount++
        } else {
          successCount++
        }
      } catch (err) {
        errors.push(`Signal ID ${row.signal_id}: ${err.message}`)
        errorCount++
      }
    }

    console.log(`Import complete: ${successCount} succeeded, ${errorCount} failed`)

    return new Response(
      JSON.stringify({
        success: true,
        total: rows.length,
        successCount,
        errorCount,
        errors: errors.slice(0, 10), // Return first 10 errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Import error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
