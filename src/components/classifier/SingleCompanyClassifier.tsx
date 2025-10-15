import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { ClassificationResult } from "./ClassificationResult";

interface Classification {
  id: string;
  primary_theme: string;
  theme_id?: string;
  sector?: string;
  pillar?: string;
  confidence_score: number;
  rationale: string;
  status: string;
  company_name: string;
  website: string;
  website_summary?: string;
  perplexity_research?: string;
}

export const SingleCompanyClassifier = () => {
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Classification | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentClassificationId, setCurrentClassificationId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleClassify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim() || !website.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both company name and website",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      // Normalize domain and create or get existing company record
      const domain = (() => {
        try {
          const u = new URL(website);
          return u.hostname.replace(/^www\./, '');
        } catch {
          return website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        }
      })();

      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .upsert(
          { company_name: companyName, website_domain: domain },
          { onConflict: "website_domain", ignoreDuplicates: false },
        )
        .select()
        .single();

      if (companyError) throw companyError;

      // Create batch record
      const { data: batchData, error: batchError } = await supabase
        .from("classification_batches")
        .insert({
          batch_name: `Single: ${companyName}`,
          company_count: 1,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Get taxonomy version
      const { data: latestTheme } = await supabase
        .from("taxonomy_themes")
        .select("version")
        .order("version", { ascending: false })
        .limit(1)
        .single();

      // Create classification record
      const { data: classificationData, error: classificationError } = await supabase
        .from("classifications")
        .insert({
          company_id: companyData.id,
          batch_id: batchData.id,
          source_system: "dashboard",
          classification_type: "initial",
          taxonomy_version: latestTheme?.version || 1,
          status: "Pending",
        })
        .select()
        .single();

      if (classificationError) throw classificationError;

      setCurrentClassificationId(classificationData.id);

      // Call Lovable AI classification edge function
      const { data: functionData, error: functionError } = await supabase.functions.invoke('classify-company', {
        body: {
          companyId: companyData.id,
          companyName: companyName,
          website: website,
          batchId: batchData.id,
          classificationId: classificationData.id,
        }
      });

      if (functionError) {
        throw new Error(`Classification failed: ${functionError.message}`);
      }

      if (!functionData.success) {
        throw new Error(functionData.error || 'Classification failed');
      }

      // Fetch final result
      const { data: finalData } = await supabase.from("classifications").select("*").eq("id", classificationData.id).single();

      if (finalData) {
        setResult({
          ...finalData,
          company_name: companyName,
          website: website,
        });
      }

      setIsProcessing(false);
      setCurrentClassificationId(null);

      // Show different toast message if classification was reused
      if (functionData.reused) {
        toast({
          title: "Classification Reused",
          description: "This company was already classified. Using existing results to avoid duplicates.",
        });
      } else {
        toast({
          title: "Classification Complete",
          description: `Classified using ${functionData.stages_used}`,
        });
      }

      /* ============== N8N WORKFLOW (DEACTIVATED - kept for reference) ==============
      // Send to n8n webhook
      const webhookUrl = "https://towerbrook.app.n8n.cloud/webhook/classify-single-company";
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classification_id: classificationData.id,
          company_id: companyData.id,
          company_name: companyName,
          website: website,
          domain: website
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .split("/")[0],
          source_system: "dashboard",
          taxonomy_version: latestTheme?.version || 1,
        }),
      });

      toast({
        title: "Classification Started",
        description: "Your company is being analyzed. Results will appear below.",
      });

      setCurrentClassificationId(classificationData.id);

      // Poll for results
      const interval = setInterval(async () => {
        const { data } = await supabase.from("classifications").select("*").eq("id", classificationData.id).single();

        if (data?.status === "Completed") {
          clearInterval(interval);
          setPollInterval(null);
          setResult({
            ...data,
            company_name: companyName,
            website: website,
          });
          setIsProcessing(false);
          setCurrentClassificationId(null);
        } else if (data?.status === "Failed") {
          clearInterval(interval);
          setPollInterval(null);
          setIsProcessing(false);
          setCurrentClassificationId(null);
          toast({
            title: "Classification Failed",
            description: "The classification workflow encountered an error. Please try again.",
            variant: "destructive",
          });
        }
      }, 3000);

      setPollInterval(interval);

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(interval);
        setPollInterval(null);
        setIsProcessing(false);
        setCurrentClassificationId(null);
        toast({
          title: "Classification Timeout",
          description: "The classification is taking longer than expected. Please check back later.",
          variant: "destructive",
        });
      }, 300000);
      ============== END N8N WORKFLOW ============== */
    } catch (error: any) {
      console.error("Error classifying company:", error);
      toast({
        title: "Classification Failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    setIsProcessing(false);
    setCurrentClassificationId(null);
    toast({
      title: "Classification Cancelled",
      description: "The classification has been cancelled.",
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleClassify} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input
            id="company-name"
            placeholder="e.g., Tesla, Inc."
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://example.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isProcessing} className="flex-1">
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Classify Company"
            )}
          </Button>

          {isProcessing && (
            <Button type="button" variant="outline" onClick={handleCancel} className="px-4">
              Cancel
            </Button>
          )}
        </div>
      </form>

      {result && <ClassificationResult result={result} />}
    </div>
  );
};
