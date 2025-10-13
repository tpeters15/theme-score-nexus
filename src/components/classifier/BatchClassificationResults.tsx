import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Classification {
  id: string;
  primary_theme: string;
  confidence_score: number;
  rationale: string;
  status: string;
  company_id: string;
  pillar: string;
  sector: string;
  business_model: string;
  context_metadata: any;
  updated_at: string;
  company?: {
    company_name: string;
    website_domain: string;
  };
  theme?: {
    name: string;
    sector: {
      name: string;
      pillar: {
        name: string;
      };
    };
  };
}

interface BatchClassificationResultsProps {
  batchId: string;
}

export const BatchClassificationResults = ({ batchId }: BatchClassificationResultsProps) => {
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClassifications = async () => {
      const { data, error } = await supabase
        .from("classifications")
        .select(`
          *,
          company:companies(company_name, website_domain),
          theme:taxonomy_themes(
            name,
            sector:taxonomy_sectors(
              name,
              pillar:taxonomy_pillars(name)
            )
          )
        `)
        .eq("batch_id", batchId)
        .order("created_at", { ascending: false });

      if (data) {
        setClassifications(data);
      }
      setLoading(false);
    };

    fetchClassifications();

    // Poll every 5 seconds for updates
    const interval = setInterval(fetchClassifications, 5000);

    return () => clearInterval(interval);
  }, [batchId]);

  const handleExportCSV = async () => {
    try {
      const csvRows = classifications.map(c => ({
        company_name: c.company?.company_name || '',
        website: c.company?.website_domain || '',
        pillar: c.theme?.sector?.pillar?.name || c.pillar || '',
        sector: c.theme?.sector?.name || c.sector || '',
        primary_theme: c.theme?.name || c.primary_theme || '',
        business_model: c.business_model || '',
        confidence_score: c.confidence_score ? (c.confidence_score * 100).toFixed(0) + '%' : '',
        rationale: c.rationale || '',
        status: c.status,
        classified_at: new Date(c.updated_at).toLocaleString(),
        was_reused: c.context_metadata?.reused_from_classification_id ? 'Yes' : 'No'
      }));

      const headers = ['Company Name', 'Website', 'Pillar', 'Sector', 'Primary Theme', 'Business Model', 'Confidence Score', 'Rationale', 'Status', 'Classified At', 'Was Reused'];
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => 
          Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `batch-${batchId}-results.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "CSV exported successfully",
        description: `Downloaded results for ${classifications.length} companies`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to generate CSV file",
        variant: "destructive",
      });
    }
  };

  const getConfidenceBadgeVariant = (score: number) => {
    if (score >= 0.85) return "default";
    if (score >= 0.70) return "secondary";
    return "destructive";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge variant="default">Completed</Badge>;
      case "Processing":
        return <Badge variant="secondary">Processing</Badge>;
      case "Failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Queued</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Classification Results ({classifications.length} companies)</CardTitle>
        <Button onClick={handleExportCSV} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Pillar</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Theme</TableHead>
                <TableHead>Business Model</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="max-w-xs">Rationale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classifications.map((classification) => (
                <TableRow key={classification.id}>
                  <TableCell className="font-medium">
                    {classification.company?.company_name || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {classification.company?.website_domain || "-"}
                  </TableCell>
                  <TableCell>
                    {classification.theme?.sector?.pillar?.name || classification.pillar || "-"}
                  </TableCell>
                  <TableCell>
                    {classification.theme?.sector?.name || classification.sector || "-"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {classification.theme?.name || classification.primary_theme || "-"}
                  </TableCell>
                  <TableCell>
                    {classification.business_model || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {classification.confidence_score ? (
                        <Badge variant={getConfidenceBadgeVariant(classification.confidence_score)}>
                          {(classification.confidence_score * 100).toFixed(0)}%
                        </Badge>
                      ) : (
                        "-"
                      )}
                      {classification.context_metadata?.reused_from_classification_id && (
                        <Badge variant="outline" className="text-xs">Reused</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(classification.status)}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm">
                    {classification.rationale || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
