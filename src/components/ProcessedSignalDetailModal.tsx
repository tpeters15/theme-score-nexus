import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ExternalLink, 
  Clock, 
  Globe,
  DollarSign,
  FileText,
  Loader2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { ProcessedSignalData } from "@/data/processedSignals";
import type { ProcessedSignal } from "@/hooks/useProcessedSignals";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ThemeMapping {
  theme_id: string;
  theme_name: string;
  relevance_score: number;
  analysis: string;
}

interface ProcessedSignalDetailModalProps {
  signal: ProcessedSignalData | ProcessedSignal | null;
  open?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function ProcessedSignalDetailModal({ 
  signal, 
  open, 
  isOpen, 
  onClose, 
  onOpenChange 
}: ProcessedSignalDetailModalProps) {
  const [themeMappings, setThemeMappings] = useState<ThemeMapping[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  
  const modalOpen = open ?? isOpen ?? false;
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) onOpenChange(newOpen);
    if (!newOpen && onClose) onClose();
  };
  
  // Normalize signal data
  const getSignalProp = (key: string): any => {
    if (!signal) return null;
    // Handle ProcessedSignal type
    if ('raw_signal' in signal) {
      if (key === 'title') return signal.raw_signal?.title;
      if (key === 'source') return signal.raw_signal?.source;
      if (key === 'published_date') return signal.raw_signal?.publication_date;
      if (key === 'source_url' || key === 'url') return signal.raw_signal?.url;
      if (key === 'signal_type') return signal.signal_type_classified;
      if (key === 'deal_size') return signal.extracted_deal_size;
      if (key === 'countries') return signal.countries;
      if (key === 'content_snippet') return signal.content_snippet;
      if (key === 'signal_id') return signal.raw_signal?.signal_id;
      // Calculate days_old from publication_date if needed
      if (key === 'days_old' && signal.raw_signal?.publication_date) {
        const pubDate = new Date(signal.raw_signal.publication_date);
        const now = new Date();
        return Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    }
    // Handle ProcessedSignalData type
    return (signal as any)[key];
  };

  useEffect(() => {
    if (signal && modalOpen) {
      analyzeSignalThemes();
    }
  }, [signal, modalOpen]);

  const analyzeSignalThemes = async () => {
    if (!signal) return;
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-signal-themes', {
        body: { signal }
      });

      if (error) throw error;

      if (data?.mappings) {
        setThemeMappings(data.mappings);
      }
    } catch (error) {
      console.error('Error analyzing signal themes:', error);
      toast({
        title: "Analysis Error",
        description: "Could not analyze theme relevance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!signal) return null;

  const getSourceColor = (source: string) => {
    if (source.includes('Bloomberg')) return "bg-blue-100 text-blue-800 border-blue-200";
    if (source.includes('Reuters')) return "bg-orange-100 text-orange-800 border-orange-200";
    if (source.includes('Financial Times')) return "bg-pink-100 text-pink-800 border-pink-200";
    if (source.includes('Carbon Brief')) return "bg-green-100 text-green-800 border-green-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getTypeColor = (type: string) => {
    if (type === 'regulatory') return "bg-blue-50 text-blue-700 border-blue-200";
    if (type === 'deal_funding') return "bg-purple-50 text-purple-700 border-purple-200";
    if (type === 'market') return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (type === 'news') return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getUrgencyIndicator = (daysOld: number) => {
    if (daysOld === 0) return "bg-red-500";
    if (daysOld <= 2) return "bg-amber-500";
    return "bg-green-500";
  };

  const title = getSignalProp('title');
  const source = getSignalProp('source');
  const signalType = getSignalProp('signal_type');
  const dealSize = getSignalProp('deal_size');
  const publishedDate = getSignalProp('published_date');
  const countries = getSignalProp('countries');
  const daysOld = getSignalProp('days_old');
  const contentSnippet = getSignalProp('content_snippet');
  const sourceUrl = getSignalProp('source_url');
  const signalId = getSignalProp('signal_id');

  return (
    <Dialog open={modalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start gap-3 pr-6">
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getUrgencyIndicator(daysOld || 0)}`} />
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Metadata Section */}
            <div className="space-y-4">
              <div className="flex items-center flex-wrap gap-2">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getSourceColor(source || ''))}
                >
                  {source}
                </Badge>
                {signalType && (
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getTypeColor(signalType))}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    {signalType.replace('_', ' ').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Badge>
                )}
                {dealSize && (
                  <Badge variant="secondary" className="text-xs">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {dealSize}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {publishedDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Published:</span>
                    <span>{format(new Date(publishedDate), 'MMM dd, yyyy')}</span>
                  </div>
                )}
                {countries && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Countries:</span>
                    <span>{countries}</span>
                  </div>
                )}
                {daysOld !== null && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Age:</span>
                    <span>
                      {daysOld === 0 ? 'Today' : daysOld === 1 ? 'Yesterday' : `${daysOld} days ago`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Content Section */}
            {contentSnippet && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Summary</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {contentSnippet}
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* AI Theme Analysis */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Relevant Themes</h3>
              </div>

              {isAnalyzing ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Analyzing theme relevance...</span>
                </div>
              ) : themeMappings.length > 0 ? (
                <div className="space-y-3">
                  {themeMappings.map((mapping) => (
                    <div key={mapping.theme_id} className="border rounded-lg p-4 space-y-2 bg-card">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm">{mapping.theme_name}</h4>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {Math.round(mapping.relevance_score * 100)}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {mapping.analysis}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No strong theme matches identified for this signal.
                </p>
              )}
            </div>

            {/* Source Link */}
            {sourceUrl && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Original Source</h3>
                <Button asChild variant="outline" className="w-fit">
                  <a 
                    href={sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    View Original Article
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}

            {/* Note about source */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="text-muted-foreground">
                This is a processed signal from {source}.
              </p>
            </div>

            {/* Signal ID */}
            {signalId && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Signal ID</h3>
                <code className="text-xs bg-muted px-2 py-1 rounded block w-fit">
                  {signalId}
                </code>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
