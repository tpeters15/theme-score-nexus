import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SourceMonitor {
  id: string;
  source_name: string;
  base_url: string;
  scraping_config: {
    selectors?: {
      title?: string;
      date?: string;
      url?: string;
    };
  };
  last_checked_at: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting IEA source scraping...");

    // Get active source monitors
    const { data: monitors, error: monitorsError } = await supabase
      .from("source_monitors")
      .select("*")
      .eq("status", "active");

    if (monitorsError) {
      console.error("Error fetching monitors:", monitorsError);
      throw monitorsError;
    }

    console.log(`Found ${monitors?.length || 0} active monitors`);

    const results = [];

    for (const monitor of monitors as SourceMonitor[]) {
      console.log(`Scraping ${monitor.source_name}...`);

      try {
        // Fetch the page content
        const response = await fetch(monitor.base_url);
        const html = await response.text();

        // Create a simple hash of the content
        const encoder = new TextEncoder();
        const data = encoder.encode(html);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Get the last snapshot for this monitor
        const { data: lastSnapshot } = await supabase
          .from("content_snapshots")
          .select("*")
          .eq("source_monitor_id", monitor.id)
          .order("checked_at", { ascending: false })
          .limit(1)
          .single();

        // Extract URLs from the page (simple regex-based extraction)
        const urls = extractUrls(html, monitor.base_url);

        let newUrls = urls;
        if (lastSnapshot) {
          const lastUrls = lastSnapshot.discovered_urls as string[];
          newUrls = urls.filter(url => !lastUrls.includes(url));
        }

        console.log(`Found ${newUrls.length} new URLs for ${monitor.source_name}`);

        // Create new signals for each new URL
        for (const url of newUrls) {
          const title = extractTitle(html, url) || `New ${monitor.source_name} item`;
          
          const { error: signalError } = await supabase
            .from("signals")
            .insert({
              signal_id: `iea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title,
              source: monitor.source_name,
              type: monitor.source_name.includes("Report") ? "report" : "news",
              url,
              document_url: url,
              processing_status: "discovered",
              analysis_priority: monitor.source_name.includes("Report") ? 10 : 5,
              description: `Automatically discovered from ${monitor.source_name}`,
            });

          if (signalError) {
            console.error(`Error creating signal for ${url}:`, signalError);
          } else {
            console.log(`Created signal for: ${title}`);
          }
        }

        // Save new snapshot
        const { error: snapshotError } = await supabase
          .from("content_snapshots")
          .insert({
            source_monitor_id: monitor.id,
            content_hash: contentHash,
            discovered_urls: urls,
          });

        if (snapshotError) {
          console.error("Error saving snapshot:", snapshotError);
        }

        // Update last_checked_at
        await supabase
          .from("source_monitors")
          .update({ last_checked_at: new Date().toISOString() })
          .eq("id", monitor.id);

        results.push({
          monitor: monitor.source_name,
          newUrls: newUrls.length,
          totalUrls: urls.length,
        });

      } catch (error) {
        console.error(`Error scraping ${monitor.source_name}:`, error);
        results.push({
          monitor: monitor.source_name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    console.log("Scraping complete:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in scrape-iea-sources:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function extractUrls(html: string, baseUrl: string): string[] {
  const urls: string[] = [];
  const domain = new URL(baseUrl).origin;
  
  // Extract report URLs
  const reportMatches = html.matchAll(/href="(\/reports\/[^"]+)"/g);
  for (const match of reportMatches) {
    urls.push(`${domain}${match[1]}`);
  }
  
  // Extract news URLs
  const newsMatches = html.matchAll(/href="(\/news\/[^"]+)"/g);
  for (const match of newsMatches) {
    urls.push(`${domain}${match[1]}`);
  }
  
  // Remove duplicates
  return [...new Set(urls)];
}

function extractTitle(html: string, url: string): string | null {
  // Try to find title near the URL link
  const urlEscaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`<a[^>]*href="${urlEscaped}"[^>]*>([^<]+)</a>`, 'i');
  const match = html.match(pattern);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return null;
}
