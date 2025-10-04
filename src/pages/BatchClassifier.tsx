import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CompanyData {
  company_name: string;
  website: string;
}

interface Classification {
  id: string;
  company_id: string;
  batch_id: string;
  status: string;
  primary_theme: string | null;
  confidence_score: number | null;
  created_at: string;
}

interface ClassificationWithCompany extends Classification {
  company_name?: string;
  website?: string;
}

const BatchClassifier = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [batchName, setBatchName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [classifications, setClassifications] = useState<ClassificationWithCompany[]>([]);

  // Poll classifications table every 5 seconds when we have an active batch
  useEffect(() => {
    if (!activeBatchId) return;

    const fetchClassifications = async () => {
      const { data, error } = await supabase
        .from("classifications")
        .select(`
          id,
          company_id,
          batch_id,
          status,
          primary_theme,
          confidence_score,
          created_at
        `)
        .eq("batch_id", activeBatchId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching classifications:", error);
        return;
      }

      // Fetch company details for each classification
      if (data && data.length > 0) {
        const companyIds = data.map((c) => c.company_id);
        const { data: companies, error: companyError } = await supabase
          .from("companies")
          .select("id, company_name, website_domain")
          .in("id", companyIds);

        if (!companyError && companies) {
          const enrichedData = data.map((classification) => {
            const company = companies.find((c) => c.id === classification.company_id);
            return {
              ...classification,
              company_name: company?.company_name || "Unknown",
              website: company?.website_domain || "",
            };
          });
          setClassifications(enrichedData);
        }
      }
    };

    fetchClassifications();
    const interval = setInterval(fetchClassifications, 5000);

    return () => clearInterval(interval);
  }, [activeBatchId]);

  const parseCSV = (text: string): CompanyData[] => {
    const lines = text.trim().split("\n");
    const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
    
    const nameIndex = headers.findIndex((h) => h.includes("company") && h.includes("name"));
    const websiteIndex = headers.findIndex((h) => h.includes("website"));

    if (nameIndex === -1 || websiteIndex === -1) {
      throw new Error("CSV must contain 'company_name' and 'website' columns");
    }

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      return {
        company_name: values[nameIndex] || "",
        website: values[websiteIndex] || "",
      };
    }).filter(row => row.company_name && row.website);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!batchName || !file || !user) {
      toast({
        title: "Missing information",
        description: "Please provide a batch name and upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Read and parse CSV
      const text = await file.text();
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

      // Process companies and create classification records
      for (const company of companies) {
        // Check if company exists, if not create it
        const { data: existingCompany } = await supabase
          .from("companies")
          .select("id")
          .eq("website_domain", company.website)
          .single();

        let companyId: string;

        if (existingCompany) {
          companyId = existingCompany.id;
        } else {
          const { data: newCompany, error: companyError } = await supabase
            .from("companies")
            .insert({
              company_name: company.company_name,
              website_domain: company.website,
            })
            .select()
            .single();

          if (companyError) throw companyError;
          companyId = newCompany.id;
        }

        // Create classification record
        await supabase.from("classifications").insert({
          company_id: companyId,
          batch_id: batch.id,
          status: "Queued",
        });
      }

      // TODO: Make API call to n8n webhook
      // const webhookUrl = "YOUR_N8N_WEBHOOK_URL";
      // await fetch(webhookUrl, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     batch_id: batch.id,
      //     companies: companies,
      //   }),
      // });

      toast({
        title: "Batch submitted",
        description: `Processing ${companies.length} companies...`,
      });

      // Reset form
      setBatchName("");
      setFile(null);
    } catch (error) {
      console.error("Error processing batch:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process batch",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Queued: "secondary",
      Processing: "default",
      Success: "default",
      Error: "destructive",
    };

    const colors: Record<string, string> = {
      Queued: "bg-gray-500",
      Processing: "bg-blue-500",
      Success: "bg-green-500",
      Error: "bg-red-500",
    };

    return (
      <Badge variant={variants[status] || "default"} className={colors[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Batch Classifier</h1>
        <p className="text-muted-foreground">
          Upload company lists for AI-powered thematic classification
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thematic Classification Engine</CardTitle>
          <CardDescription>
            Upload a CSV file with company names and websites for automated classification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batch-name">Batch Name</Label>
              <Input
                id="batch-name"
                placeholder="e.g., Q1 2025 Prospect List"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="csv-file">CSV File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={isProcessing}
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Required columns: company_name and website
              </p>
            </div>

            <Button type="submit" disabled={isProcessing || !batchName || !file}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process List"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {activeBatchId && (
        <Card>
          <CardHeader>
            <CardTitle>Classification Results</CardTitle>
            <CardDescription>Real-time classification progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
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
                        No classifications yet...
                      </TableCell>
                    </TableRow>
                  ) : (
                    classifications.map((classification) => (
                      <TableRow key={classification.id}>
                        <TableCell className="font-medium">
                          {classification.company_name}
                        </TableCell>
                        <TableCell>{classification.website}</TableCell>
                        <TableCell>{getStatusBadge(classification.status)}</TableCell>
                        <TableCell>{classification.primary_theme || "-"}</TableCell>
                        <TableCell>
                          {classification.confidence_score
                            ? `${Math.round(classification.confidence_score * 100)}%`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BatchClassifier;
