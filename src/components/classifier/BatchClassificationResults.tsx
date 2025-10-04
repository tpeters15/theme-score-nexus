import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface Classification {
  id: string;
  primary_theme: string;
  confidence_score: number;
  rationale: string;
  status: string;
  company_id: string;
}

interface BatchClassificationResultsProps {
  batchId: string;
}

export const BatchClassificationResults = ({ batchId }: BatchClassificationResultsProps) => {
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassifications = async () => {
      const { data, error } = await supabase
        .from("classifications")
        .select("*")
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
      <CardHeader>
        <CardTitle>Classification Results</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Primary Theme</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Rationale</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classifications.map((classification) => (
              <TableRow key={classification.id}>
                <TableCell>{getStatusBadge(classification.status)}</TableCell>
                <TableCell>{classification.primary_theme || "-"}</TableCell>
                <TableCell>
                  {classification.confidence_score
                    ? `${(classification.confidence_score * 100).toFixed(0)}%`
                    : "-"}
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {classification.rationale || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
