import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to build an OR filter for ILIKE across multiple fields/keywords
function buildOrIlike(field: string, keywords: string[]) {
  return keywords.map((kw) => `${field}.ilike.%${kw}%`).join(",");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 5 dashboard themes and their keyword heuristics
    const themes = [
      {
        name: "Water Efficiency",
        id: "aa637432-d6c1-47c8-94b8-2bad7e55f5d0",
        keywords: ["water efficiency", "leak", "conservation", "smart meter", "non-revenue water"],
      },
      {
        name: "Smart Water Infrastructure & Analytics",
        id: "c78996a1-6f0b-40fe-b182-b20359576909",
        keywords: ["smart water", "IoT", "analytics", "digital twin", "predictive maintenance", "leak detection"],
      },
      {
        name: "Smart Grid & Demand Response",
        id: "5dadd25d-f602-447a-ab3e-385351a8f188",
        keywords: ["demand response", "smart grid", "VPP", "virtual power plant", "flexibility", "balancing"],
      },
      {
        name: "Industrial & Commercial Energy Efficiency",
        id: "f68542c4-647a-4ff0-b2f1-830d9ee7f99c",
        keywords: ["energy efficiency", "BEMS", "building management", "retrofit", "HVAC", "industrial efficiency"],
      },
      {
        name: "EV Charging Infrastructure",
        id: "59276a29-119b-4412-86ae-4725472eb380",
        keywords: ["EV charging", "charger", "supercharger", "EVSE", "DC fast"],
      },
    ];

    let insertedCount = 0;
    let attempted = 0;
    const errors: Array<{ theme_id: string; error: string }> = [];
    const perTheme: Record<string, number> = {};

    // For each theme, try to find 3 existing processed_signals and upsert
    for (const theme of themes) {
      let chosen: Array<{ id: string; memo_analysis: string | null; content_snippet: string | null }> = [];

      // 1) Find raw_signals by keywords (title/description) and map to processed_signals
      const { data: rawRes, error: rawErr } = await supabase
        .from("raw_signals")
        .select("id,title,description,created_at")
        .order("created_at", { ascending: false, nullsFirst: false })
        .limit(200);

      if (rawErr) {
        console.error("raw_signals query error", rawErr);
      }

      const lowerKws = theme.keywords.map((k) => k.toLowerCase());
      const matchedRawIds = (rawRes ?? [])
        .filter((r) => {
          const hay = `${r.title ?? ""} ${r.description ?? ""}`.toLowerCase();
          return lowerKws.some((kw) => hay.includes(kw));
        })
        .slice(0, 50)
        .map((r) => r.id);

      if (matchedRawIds.length > 0) {
        const { data: ps1, error: ps1Err } = await supabase
          .from("processed_signals")
          .select("id,memo_analysis,content_snippet,processed_timestamp,raw_signal_id")
          .in("raw_signal_id", matchedRawIds)
          .order("processed_timestamp", { ascending: false, nullsFirst: false })
          .limit(10);
        if (ps1Err) {
          console.error("processed_signals by raw_ids error", ps1Err);
        }
        if (ps1) {
          chosen.push(...ps1);
        }
      }

      // 2) Also search processed_signals text fields by keywords
      if (chosen.length < 6) {
        const orMemo = buildOrIlike("memo_analysis", theme.keywords);
        const orSnippet = buildOrIlike("content_snippet", theme.keywords);
        const orFilter = [orMemo, orSnippet].filter(Boolean).join(",");

        if (orFilter) {
          const { data: ps2, error: ps2Err } = await supabase
            .from("processed_signals")
            .select("id,memo_analysis,content_snippet,processed_timestamp")
            .or(orFilter)
            .order("processed_timestamp", { ascending: false, nullsFirst: false })
            .limit(20);
          if (ps2Err) {
            console.error("processed_signals keyword search error", ps2Err);
          }
          if (ps2) {
            chosen.push(...ps2);
          }
        }
      }

      // 3) Fallback: take most recent processed_signals if still not enough
      if (chosen.length < 3) {
        const { data: ps3, error: ps3Err } = await supabase
          .from("processed_signals")
          .select("id,memo_analysis,content_snippet,processed_timestamp")
          .order("processed_timestamp", { ascending: false, nullsFirst: false })
          .limit(10);
        if (ps3Err) {
          console.error("processed_signals recent fallback error", ps3Err);
        }
        if (ps3) {
          chosen.push(...ps3);
        }
      }

      // Deduplicate by id and keep top 3
      const uniq: Record<string, true> = {};
      const finalThree = chosen
        .filter((s) => {
          if (!s?.id) return false;
          if (uniq[s.id]) return false;
          uniq[s.id] = true;
          return true;
        })
        .slice(0, 3);

      perTheme[theme.name] = finalThree.length;
      attempted += finalThree.length;

      // Upsert into theme_signals
      for (let i = 0; i < finalThree.length; i++) {
        const s = finalThree[i];
        const relevance = Math.max(0.8, 0.94 - i * 0.02); // simple descending score
        const ai_analysis = s.memo_analysis ?? s.content_snippet ?? null;

        const { error: upErr } = await supabase
          .from("theme_signals")
          .upsert(
            {
              theme_id: theme.id,
              processed_signal_id: s.id,
              relevance_score: relevance,
              ai_analysis,
            },
            { onConflict: "theme_id,processed_signal_id" }
          );

        if (upErr) {
          console.error("Error upserting theme_signal", theme.name, s.id, upErr);
          errors.push({ theme_id: theme.id, error: upErr.message });
        } else {
          insertedCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: "Dashboard theme signals population complete",
        inserted_count: insertedCount,
        attempted_count: attempted,
        per_theme_counts: perTheme,
        errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
