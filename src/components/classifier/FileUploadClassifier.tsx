import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";
import { BatchClassificationResults } from "./BatchClassificationResults";

interface Company {
  company_name: string;
  website: string;
}

export const FileUploadClassifier = () => {
  const [batchName, setBatchName] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const { toast } = useToast();

  const parseCSV = (text: string): Company[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());

    const companyNameIndex = headers.indexOf("company_name");
    const websiteIndex = headers.indexOf("website");

    if (companyNameIndex === -1 || websiteIndex === -1) {
      throw new Error("CSV must have 'company_name' and 'website' columns");
    }

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      return {
        company_name: values[companyNameIndex],
        website: values[websiteIndex],
      };
    });
  };

  const handleProcessList = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!csvFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!batchName.trim()) {
      toast({
        title: "Missing Batch Name",
        description: "Please enter a name for this batch",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const text = await csvFile.text();
      const companies = parseCSV(text);

      const user = (await supabase.auth.getUser()).data.user;

      // Create batch
      const { data: batchData, error: batchError } = await supabase
        .from("classification_batches")
        .insert({
          batch_name: batchName,
          company_count: companies.length,
          user_id: user?.id,
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Get taxonomy version
      const { data: latestTheme } = await supabase
        .from('taxonomy_themes')
        .select('version')
        .order('version', { ascending: false })
        .limit(1)
        .single();

      const taxonomyVersion = latestTheme?.version || 1;

      // Create company records and classifications
      const companyRecords = [];
      for (const company of companies) {
        const domain = company.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .upsert(
            {
              company_name: company.company_name,
              website_domain: domain,
            },
            { onConflict: 'website_domain', ignoreDuplicates: false }
          )
          .select()
          .single();

        if (companyError) throw companyError;

        const { data: classification } = await supabase
          .from("classifications")
          .insert({
            company_id: companyData.id,
            batch_id: batchData.id,
            source_system: 'dashboard',
            classification_type: 'initial',
            taxonomy_version: taxonomyVersion,
            status: "Pending",
          })
          .select()
          .single();

        companyRecords.push({
          classification_id: classification?.id,
          company_id: companyData.id,
          company_name: company.company_name,
          website: company.website,
          domain: domain,
          source_system: 'dashboard',
          taxonomy_version: taxonomyVersion
        });
      }

      // Send to n8n
      const webhookUrl = "https://towerbrook.app.n8n.cloud/webhook/dealcloud-classifier";
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_id: batchData.id,
          classifications: companyRecords,
        }),
      });

      setActiveBatchId(batchData.id);

      toast({
        title: "Batch Started",
        description: `Processing ${companies.length} companies from CSV...`,
      });

      // Reset form
      setBatchName("");
      setCsvFile(null);
    } catch (error: any) {
      console.error("Error processing CSV:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleProcessList} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-batch-name">Batch Name</Label>
          <Input
            id="csv-batch-name"
            placeholder="e.g., Q1 2025 Portfolio Review"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="csv-file">CSV File</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            disabled={isProcessing}
          />
          <p className="text-sm text-muted-foreground">
            CSV must include columns: company_name, website
          </p>
        </div>

        <Button type="submit" disabled={isProcessing || !csvFile} className="w-full">
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing CSV...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload and Classify
            </>
          )}
        </Button>
      </form>

      {activeBatchId && <BatchClassificationResults batchId={activeBatchId} />}
    </div>
  );
};
