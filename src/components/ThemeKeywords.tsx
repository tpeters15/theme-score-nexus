import { useState } from "react";
import { Copy, CopyCheck, Hash } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ThemeKeywordsProps {
  keywords: string[];
  themeName: string;
}

export const ThemeKeywords = ({ keywords, themeName }: ThemeKeywordsProps) => {
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const { toast } = useToast();

  const copyKeyword = async (keyword: string) => {
    try {
      await navigator.clipboard.writeText(keyword);
      setCopiedKeyword(keyword);
      setTimeout(() => setCopiedKeyword(null), 2000);
      toast({
        description: `Copied "${keyword}" to clipboard`,
      });
    } catch (error) {
      toast({
        description: "Failed to copy keyword",
        variant: "destructive",
      });
    }
  };

  const copyAllKeywords = async () => {
    try {
      // Format keywords for search platforms: comma-separated, quoted if containing spaces
      const formattedKeywords = keywords
        .map(keyword => keyword.includes(' ') ? `"${keyword}"` : keyword)
        .join(', ');
      
      await navigator.clipboard.writeText(formattedKeywords);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
      toast({
        description: `Copied all ${keywords.length} keywords to clipboard`,
      });
    } catch (error) {
      toast({
        description: "Failed to copy keywords",
        variant: "destructive",
      });
    }
  };

  if (!keywords || keywords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Research Keywords
          </CardTitle>
          <CardDescription>
            Keywords for searching platforms like PitchBook, Crunchbase, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Hash className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Keywords Defined</h3>
            <p className="text-muted-foreground">
              Research keywords have not been compiled for this theme yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Research Keywords
            </CardTitle>
            <CardDescription>
              Click keywords to copy • {keywords.length} keyword{keywords.length !== 1 ? 's' : ''} ready for search platforms
            </CardDescription>
          </div>
          <Button
            onClick={copyAllKeywords}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={copiedAll}
          >
            {copiedAll ? (
              <CopyCheck className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copiedAll ? 'Copied!' : 'Copy All'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
              onClick={() => copyKeyword(keyword)}
            >
              {copiedKeyword === keyword ? (
                <CopyCheck className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1 opacity-60" />
              )}
              {keyword}
            </Badge>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Keywords are formatted for direct use in PitchBook, Crunchbase, and similar platforms
        </div>
      </CardContent>
    </Card>
  );
};