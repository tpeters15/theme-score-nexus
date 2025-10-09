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
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { ProcessedSignalData } from "@/data/processedSignals";

interface ProcessedSignalDetailModalProps {
  signal: ProcessedSignalData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProcessedSignalDetailModal({ signal, isOpen, onClose }: ProcessedSignalDetailModalProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start gap-3 pr-6">
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getUrgencyIndicator(signal.days_old)}`} />
            <DialogTitle className="text-xl">{signal.title}</DialogTitle>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Metadata Section */}
            <div className="space-y-4">
              <div className="flex items-center flex-wrap gap-2">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getSourceColor(signal.source))}
                >
                  {signal.source}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getTypeColor(signal.signal_type))}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {signal.signal_type.replace('_', ' ')}
                </Badge>
                {signal.deal_size && (
                  <Badge variant="secondary" className="text-xs">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {signal.deal_size}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Published:</span>
                  <span>{format(new Date(signal.published_date), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Countries:</span>
                  <span>{signal.countries}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Age:</span>
                  <span>
                    {signal.days_old === 0 ? 'Today' : signal.days_old === 1 ? 'Yesterday' : `${signal.days_old} days ago`}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Content Section */}
            {signal.content_snippet && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Summary</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {signal.content_snippet}
                  </p>
                </div>
              </div>
            )}

            {/* Note about source */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="text-muted-foreground">
                This is a processed signal from {signal.source}. For the full original article and additional details, please visit the source website.
              </p>
            </div>

            {/* Signal ID */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Signal ID</h3>
              <code className="text-xs bg-muted px-2 py-1 rounded block w-fit">
                {signal.signal_id}
              </code>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
