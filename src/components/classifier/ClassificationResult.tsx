import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

interface ClassificationResultProps {
  result: {
    company_name: string;
    website: string;
    primary_theme: string;
    theme_id?: string;
    sector?: string;
    pillar?: string;
    confidence_score: number;
    rationale: string;
    status: string;
    website_summary?: string;
    perplexity_research?: string;
    research_summary?: string;
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
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Pillar</p>
            <Badge variant="outline" className="text-sm">
              {result.pillar || 'N/A'}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Sector</p>
            <Badge variant="outline" className="text-sm">
              {result.sector || 'N/A'}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Theme</p>
            {result.theme_id ? (
              <Link to={`/theme/${result.theme_id}`}>
                <Badge variant="secondary" className="text-sm cursor-pointer hover:bg-secondary/80 transition-colors">
                  {result.primary_theme}
                </Badge>
              </Link>
            ) : (
              <Badge variant="secondary" className="text-sm">
                {result.primary_theme}
              </Badge>
            )}
          </div>
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

        <div>
          <p className="text-sm font-medium mb-1">Sources Used</p>
          <div className="flex flex-wrap gap-2">
            {result.website_summary && (
              <Badge variant="outline" className="text-xs">
                Website Analysis
              </Badge>
            )}
            {result.perplexity_research && (
              <Badge variant="outline" className="text-xs">
                Web Research
              </Badge>
            )}
            {!result.website_summary && !result.perplexity_research && (
              <span className="text-sm text-muted-foreground">No sources recorded</span>
            )}
          </div>
        </div>

        {result.research_summary && (
          <div>
            <p className="text-sm font-medium mb-2">Research Summary</p>
            <div className="bg-muted/50 rounded-lg p-4 text-sm prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-muted-foreground leading-relaxed">
                {result.research_summary}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
