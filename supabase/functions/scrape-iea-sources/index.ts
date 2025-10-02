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

interface FirecrawlResponse {
  success: boolean;
  data?: {
    markdown?: string;
    links?: string[];
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");
    
    if (!firecrawlApiKey) {
      throw new Error("FIRECRAWL_API_KEY not configured. Please add it to edge function secrets.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting IEA source scraping with Firecrawl...");

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
      console.log(`Scraping ${monitor.source_name} with Firecrawl...`);

      try {
        // Use Firecrawl to scrape the page (handles JavaScript rendering)
        const firecrawlResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${firecrawlApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: monitor.base_url,
            formats: ["markdown", "links"],
          }),
        });

        if (!firecrawlResponse.ok) {
          const errorText = await firecrawlResponse.text();
          console.error(`Firecrawl error for ${monitor.source_name}:`, errorText);
          throw new Error(`Firecrawl API error: ${firecrawlResponse.status}`);
        }

        const firecrawlData: FirecrawlResponse = await firecrawlResponse.json();
        console.log(`Firecrawl returned data for ${monitor.source_name}`);

        if (!firecrawlData.success || !firecrawlData.data) {
          throw new Error("Firecrawl did not return successful data");
        }

        // Extract links and markdown from Firecrawl response
        const allLinks = firecrawlData.data.links || [];
        const markdown = firecrawlData.data.markdown || "";
        
        // Filter for relevant IEA links (reports or news)
        const isReportMonitor = monitor.base_url.includes("type=report");
        const relevantLinks = allLinks.filter((link: string) => {
          if (isReportMonitor) {
            return link.includes("/reports/") && link.includes("iea.org");
          } else {
            return link.includes("/news/") && link.includes("iea.org");
          }
        });

        console.log(`Found ${relevantLinks.length} relevant links for ${monitor.source_name}`);

        // Create content hash from markdown for change detection
        const encoder = new TextEncoder();
        const data = encoder.encode(markdown);
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

        // Extract titles and URLs together
        const discoveredUrls: Array<{ url: string; title: string }> = [];
        
        for (const url of relevantLinks) {
          // Try to find title in markdown by looking for the URL
          const urlIndex = markdown.indexOf(url);
          let title = "Untitled";
          
          if (urlIndex !== -1) {
            // Look backwards for a heading or link text
            const beforeUrl = markdown.slice(Math.max(0, urlIndex - 200), urlIndex);
            const headingMatch = beforeUrl.match(/#+\s+([^\n]+)$/);
            const linkTextMatch = beforeUrl.match(/\[([^\]]+)\]\([^\)]*$/);
            
            if (linkTextMatch) {
              title = linkTextMatch[1].trim();
            } else if (headingMatch) {
              title = headingMatch[1].trim();
            } else {
              // Extract from URL as fallback
              const urlParts = url.split("/").filter(p => p);
              title = urlParts[urlParts.length - 1].replace(/-/g, " ").replace(/\.\w+$/, "");
            }
          }

          discoveredUrls.push({ url, title });
        }

        // Get previous URLs to find new ones
        const previousUrls = lastSnapshot?.discovered_urls || [];
        const previousUrlSet = new Set(
          Array.isArray(previousUrls) 
            ? previousUrls.map((u: any) => typeof u === 'string' ? u : u.url)
            : []
        );
        const newUrls = discoveredUrls.filter(u => !previousUrlSet.has(u.url));

        console.log(`Found ${newUrls.length} new URLs for ${monitor.source_name}`);

        // Create signals for new URLs
        for (const urlData of newUrls) {
          const { error: signalError } = await supabase
            .from("signals")
            .insert({
              signal_id: `iea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: urlData.title,
              source: monitor.source_name,
              type: isReportMonitor ? "report" : "news",
              url: urlData.url,
              document_url: urlData.url,
              processing_status: "discovered",
              analysis_priority: isReportMonitor ? 10 : 5,
              description: `Automatically discovered from ${monitor.source_name}`,
            });

          if (signalError) {
            console.error(`Error creating signal for ${urlData.url}:`, signalError);
          } else {
            console.log(`Created signal for: ${urlData.title}`);
          }
        }

        // Save new snapshot
        const { error: snapshotError } = await supabase
          .from("content_snapshots")
          .insert({
            source_monitor_id: monitor.id,
            content_hash: contentHash,
            discovered_urls: discoveredUrls,
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
          totalUrls: discoveredUrls.length,
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

