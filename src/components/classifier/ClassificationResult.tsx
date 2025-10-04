import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface ClassificationResultProps {
  result: {
    company_name: string;
    website: string;
    primary_theme: string;
    confidence_score: number;
    rationale: string;
    status: string;
  };
}

export const ClassificationResult = ({ result }: ClassificationResultProps) => {
  return (
    <Card className="border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{result.company_name}</CardTitle>
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{result.website}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-1">Primary Theme</p>
          <Badge variant="secondary" className="text-base">
            {result.primary_theme}
          </Badge>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Confidence Score</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${result.confidence_score * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium">
              {(result.confidence_score * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Rationale</p>
          <p className="text-sm text-muted-foreground">{result.rationale}</p>
        </div>
      </CardContent>
    </Card>
  );
};
