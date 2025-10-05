import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";

interface Company {
  company_name: string;
  website: string;
}

interface Classification {
  id: string;
  created_at: string;
  status: string;
  primary_theme: string | null;
  confidence_score: number | null;
  company_id: string;
  companies: {
    company_name: string;
    website_domain: string;
  };
}

const BatchClassifier = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [batchName, setBatchName] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [classifications, setClassifications] = useState<Classification[]>([]);

  // Poll classifications every 5 seconds
  useEffect(() => {
    if (!activeBatchId) return;

    const fetchClassifications = async () => {
      const { data, error } = await supabase
        .from("classifications")
        .select(`
          *,
          companies (
            company_name,
            website_domain
          )
        `)
        .eq("batch_id", activeBatchId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching classifications:", error);
        return;
      }

      setClassifications(data as Classification[]);
    };

    fetchClassifications();
    const interval = setInterval(fetchClassifications, 5000);

    return () => clearInterval(interval);
  }, [activeBatchId]);

  const parseCSV = (text: string): Company[] => {
    const lines = text.split("\n").filter(line => line.trim());
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    
    const companyNameIndex = headers.indexOf("company_name");
    const websiteIndex = headers.indexOf("website");

    if (companyNameIndex === -1 || websiteIndex === -1) {
      throw new Error("CSV must contain 'company_name' and 'website' columns");
    }

    return lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      return {
        company_name: values[companyNameIndex],
        website: values[websiteIndex],
      };
    });
  };

  const handleProcessList = async () => {
    if (!csvFile || !batchName || !user) {
      toast({
        title: "Missing information",
        description: "Please provide a batch name and select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Read and parse CSV
      const text = await csvFile.text();
      const companies = parseCSV(text);

      // Create batch record
      const { data: batch, error: batchError } = await supabase
        .from("classification_batches")
        .insert({
          batch_name: batchName,
          user_id: user.id,
          company_count: companies.length,
          status: "Processing",
        })
        .select()
        .single();

      if (batchError) throw batchError;

      setActiveBatchId(batch.id);

      // Get n8n webhook URL from environment variable
      const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || "https://your-n8n-instance.com/webhook-test/classify-companies";

      // Prepare companies with proper structure for n8n workflow
      const companiesForWorkflow = await Promise.all(
        companies.map(async (company) => {
          // Create company record in database first
          const { data: companyRecord, error: companyError } = await supabase
            .from("companies")
            .upsert({
              company_name: company.company_name,
              website_domain: company.website,
              description: "",
            }, {
              onConflict: "website_domain",
              ignoreDuplicates: false,
            })
            .select()
            .single();

          if (companyError) {
            console.error("Error creating company:", companyError);
            return {
              id: crypto.randomUUID(),
              name: company.company_name,
              website: company.website,
              description: "",
            };
          }

          return {
            id: companyRecord.id,
            name: company.company_name,
            website: company.website,
            description: companyRecord.description || "",
          };
        })
      );

      // Send to n8n webhook with proper payload structure
      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "batch",
          batch_id: batch.id,
          companies: companiesForWorkflow,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit to classification service");
      }

      toast({
        title: "Processing started",
        description: `Batch "${batchName}" has been submitted for classification`,
      });

      // Reset form
      setBatchName("");
      setCsvFile(null);
    } catch (error) {
      console.error("Error processing list:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process list",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; className: string }> = {
      Processing: { variant: "default", className: "bg-blue-500" },
      Queued: { variant: "secondary", className: "bg-gray-500" },
      Success: { variant: "default", className: "bg-green-500" },
      Error: { variant: "destructive", className: "" },
    };

    const config = variants[status] || variants.Queued;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Thematic Classification Engine</CardTitle>
          <CardDescription>
            Upload a company list for AI-powered thematic classification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batchName">Batch Name</Label>
              <Input
                id="batchName"
                placeholder="e.g., Q1 2025 Portfolio Review"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="csvFile">CSV File</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground">
                Required columns: company_name and website
              </p>
            </div>

            <Button
              onClick={handleProcessList}
              disabled={isProcessing || !batchName || !csvFile}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Process List
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {activeBatchId && (
        <Card>
          <CardHeader>
            <CardTitle>Classification Results</CardTitle>
            <CardDescription>
              Results update every 5 seconds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Primary Theme</TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Waiting for results...
                    </TableCell>
                  </TableRow>
                ) : (
                  classifications.map((classification) => (
                    <TableRow key={classification.id}>
                      <TableCell className="font-medium">
                        {classification.companies.company_name}
                      </TableCell>
                      <TableCell>{classification.companies.website_domain}</TableCell>
                      <TableCell>{getStatusBadge(classification.status)}</TableCell>
                      <TableCell>
                        {classification.primary_theme || "-"}
                      </TableCell>
                      <TableCell>
                        {classification.confidence_score
                          ? `${(classification.confidence_score * 100).toFixed(0)}%`
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BatchClassifier;
