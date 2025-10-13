import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, CheckCircle2, XCircle, Clock } from "lucide-react";
import { BatchClassificationResults } from "./BatchClassificationResults";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Company {
  company_name: string;
  website: string;
  business_description?: string;
}

interface ProcessingStats {
  total: number;
  completed: number;
  reused: number;
  newClassifications: number;
  failed: number;
}

export const FileUploadClassifier = () => {
  const [batchName, setBatchName] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [stats, setStats] = useState<ProcessingStats>({
    total: 0,
    completed: 0,
    reused: 0,
    newClassifications: 0,
    failed: 0,
  });
  const { toast } = useToast();

  const parseCSV = (text: string): Company[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/\s+/g, '_'));

    const companyNameIndex = headers.indexOf("company_name");
    const websiteIndex = headers.indexOf("website");
    const descriptionIndex = headers.indexOf("business_description");

    if (companyNameIndex === -1 || websiteIndex === -1) {
      throw new Error("CSV must have 'Company Name' (or 'company_name') and 'Website' (or 'website') columns");
    }

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const company: Company = {
        company_name: values[companyNameIndex],
        website: values[websiteIndex],
      };
      
      // Include business description if available
      if (descriptionIndex !== -1 && values[descriptionIndex]) {
        company.business_description = values[descriptionIndex];
      }
      
      return company;
    });
  };

  const normalizeDomain = (url: string): string => {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }
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

      // Initialize stats
      setStats({
        total: companies.length,
        completed: 0,
        reused: 0,
        newClassifications: 0,
        failed: 0,
      });

      const user = (await supabase.auth.getUser()).data.user;

      // Create batch
      const { data: batchData, error: batchError } = await supabase
        .from("classification_batches")
        .insert({
          batch_name: batchName,
          company_count: companies.length,
          user_id: user?.id,
          status: 'Processing',
        })
        .select()
        .single();

      if (batchError) throw batchError;
      setActiveBatchId(batchData.id);

      // Get taxonomy version
      const { data: latestTheme } = await supabase
        .from('taxonomy_themes')
        .select('version')
        .order('version', { ascending: false })
        .limit(1)
        .single();

      const taxonomyVersion = latestTheme?.version || 1;

      // Phase 3: Bulk pre-screening - check for existing companies
      const normalizedDomains = companies.map(c => normalizeDomain(c.website));
      const { data: existingCompanies } = await supabase
        .from('companies')
        .select(`
          id,
          website_domain,
          company_name,
          classifications!inner(*)
        `)
        .in('website_domain', normalizedDomains)
        .eq('classifications.status', 'Completed')
        .order('classifications.created_at', { ascending: false });

      const existingMap = new Map();
      existingCompanies?.forEach(company => {
        if (!existingMap.has(company.website_domain)) {
          existingMap.set(company.website_domain, company);
        }
      });

      toast({
        title: "Processing Batch",
        description: `Found ${existingMap.size} existing classifications. Processing ${companies.length} companies...`,
      });

      // Process each company
      for (let i = 0; i < companies.length; i++) {
        const company = companies[i];
        const domain = normalizeDomain(company.website);

        try {
          // Upsert company
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

          // Create classification record
          const { data: classification, error: classError } = await supabase
            .from("classifications")
            .insert({
              company_id: companyData.id,
              batch_id: batchData.id,
              source_system: 'dashboard',
              classification_type: 'initial',
              taxonomy_version: taxonomyVersion,
              status: "Queued",
            })
            .select()
            .single();

          if (classError) throw classError;

          // Call classify-company edge function
          const { data: result, error: fnError } = await supabase.functions.invoke(
            'classify-company',
            {
              body: {
                company_name: company.company_name,
                website: company.website,
                classification_id: classification.id,
                batch_id: batchData.id,
                business_description: company.business_description,
              },
            }
          );

          if (fnError) {
            console.error(`Error classifying ${company.company_name}:`, fnError);
            setStats(prev => ({
              ...prev,
              completed: prev.completed + 1,
              failed: prev.failed + 1,
            }));
          } else {
            const wasReused = result?.reused || false;
            setStats(prev => ({
              ...prev,
              completed: prev.completed + 1,
              reused: wasReused ? prev.reused + 1 : prev.reused,
              newClassifications: wasReused ? prev.newClassifications : prev.newClassifications + 1,
            }));
          }
        } catch (error) {
          console.error(`Error processing ${company.company_name}:`, error);
          setStats(prev => ({
            ...prev,
            completed: prev.completed + 1,
            failed: prev.failed + 1,
          }));
        }

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Update batch status
      await supabase
        .from("classification_batches")
        .update({ status: 'Completed' })
        .eq('id', batchData.id);

      toast({
        title: "Batch Complete",
        description: `Processed ${companies.length} companies. ${stats.reused} reused, ${stats.newClassifications} newly classified.`,
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
            Required: company_name, website. Optional: business_description (improves accuracy)
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

      {isProcessing && stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress: {stats.completed} / {stats.total}</span>
                <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
              </div>
              <Progress value={(stats.completed / stats.total) * 100} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Reused: {stats.reused}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.total > 0 ? Math.round((stats.reused / stats.total) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">New: {stats.newClassifications}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.total > 0 ? Math.round((stats.newClassifications / stats.total) * 100) : 0}%
                  </p>
                </div>
              </div>

              {stats.failed > 0 && (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">Failed: {stats.failed}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeBatchId && <BatchClassificationResults batchId={activeBatchId} />}
    </div>
  );
};
