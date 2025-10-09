import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Signal, ExternalLink, Clock, Eye } from "lucide-react";
import { PROCESSED_SIGNALS_DATA, ProcessedSignalData } from "@/data/processedSignals";
import { useState } from "react";
import { ProcessedSignalDetailModal } from "@/components/ProcessedSignalDetailModal";

export function SignalHighlightsCard() {
  const [selectedSignal, setSelectedSignal] = useState<ProcessedSignalData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const recentSignals = PROCESSED_SIGNALS_DATA.slice(0, 4);

  const openModal = (signal: ProcessedSignalData) => { 
    setSelectedSignal(signal); 
    setIsModalOpen(true); 
  };
  
  const closeModal = () => { 
    setIsModalOpen(false); 
    setSelectedSignal(null); 
  };

  const getCategoryColor = (signal: ProcessedSignalData) => {
    const type = signal.signal_type;
    if (type === 'regulatory') return "bg-blue-50 text-blue-700 border-blue-200";
    if (type === 'deal_funding') return "bg-purple-50 text-purple-700 border-purple-200";
    if (type === 'market') return "bg-emerald-50 text-emerald-700 border-emerald-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getSourceColor = (source: string) => {
    if (source.includes('Bloomberg')) return "bg-blue-100 text-blue-800";
    if (source.includes('Reuters')) return "bg-orange-100 text-orange-800";
    if (source.includes('Financial Times')) return "bg-pink-100 text-pink-800";
    return "bg-gray-100 text-gray-800";
  };

  const getUrgencyIndicator = (daysOld: number) => {
    if (daysOld === 0) return "bg-red-500";
    if (daysOld <= 2) return "bg-amber-500";
    return "bg-green-500";
  };

  const getTimestamp = (daysOld: number) => {
    if (daysOld === 0) return "Today";
    if (daysOld === 1) return "Yesterday";
    return `${daysOld}d ago`;
  };

  return (
    <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-lg bg-blue-500/10">
            <Signal className="h-4 w-4 text-blue-600" />
          </div>
          Signal Highlights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentSignals.map((signal) => (
          <div
            key={signal.signal_id}
            className="relative p-3 rounded-lg border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200 group cursor-pointer"
            onClick={() => openModal(signal)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${getUrgencyIndicator(signal.days_old)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-medium text-sm leading-snug">{signal.title}</div>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                    onClick={(e) => { e.stopPropagation(); openModal(signal); }}
                    aria-label="View details"
                    type="button"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-xs text-muted-foreground mb-2 leading-relaxed line-clamp-2">
                  {signal.content_snippet}
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-0.5 h-auto ${getCategoryColor(signal)}`}
                    >
                      {signal.signal_type.replace('_', ' ')}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs px-2 py-0.5 h-auto ${getSourceColor(signal.source)}`}
                    >
                      {signal.source}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{getTimestamp(signal.days_old)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <Button variant="ghost" size="sm" className="w-full text-xs mt-3 h-8" asChild>
          <a href="/signals">
            View All Signals
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </CardContent>

      <ProcessedSignalDetailModal 
        signal={selectedSignal}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </Card>
  );
}