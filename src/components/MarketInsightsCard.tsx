import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Signal, ExternalLink, Clock, Eye } from "lucide-react";
import { format } from "date-fns";
import { useRecentProcessedSignals, type ProcessedSignal } from "@/hooks/useProcessedSignals";
import { useState, useMemo } from "react";
import { SignalDetailModal } from "@/components/SignalDetailModal";

// Mock data for signal highlights
const MOCK_SIGNALS_DATA = [
  {
    signal_id: "sig_1758626263287_0",
    original_id: "pitchbook-1758626263199-uinu0ctnp-collision-repair",
    title: "Collision Repair - Acquisition",
    company: "Collision Repair",
    location: "Bellshill, United Kingdom",
    industry: "Road",
    deal_type: "acquisition",
    published_date: "2025-09-23T11:16:47Z",
    source: "PitchBook Alert",
    content: "Collision Repair was acquired for an undisclosed amount with close date of 19-Sep-2025. Provider of automotive body repair services."
  },
  {
    signal_id: "sig_1758621873680_1",
    original_id: "https://www.reuters.com",
    title: "US judge rules Trump cannot block Rhode Island offshore wind project",
    company: "Ørsted",
    location: "Rhode Island, USA",
    industry: "Renewable Energy",
    deal_type: "news",
    published_date: "2025-09-23T00:00:00.000Z",
    source: "Carbon Brief Daily",
    content: "Federal judge ruled that Danish offshore wind developer Ørsted can restart work on its $6.2bn Revolution Wind project."
  },
  {
    signal_id: "sig_1758621663476_0",
    original_id: "https://www.bloomberg.com/eu-deforestation",
    title: "EU Proposes Another Delay to Landmark Deforestation Law",
    company: "European Commission",
    location: "European Union",
    industry: "Environmental Policy",
    deal_type: "news",
    published_date: "2025-09-23T09:40:37.000Z",
    source: "Bloomberg Green",
    content: "The European Commission will seek to again delay the implementation of its landmark law to tackle deforestation."
  },
  {
    signal_id: "sig_1758621663476_1",
    original_id: "https://www.bloomberg.com/australia-battery",
    title: "Australian Government Strikes Battery Offtake Deal",
    company: "Snowy Hydro Ltd.",
    location: "Australia",
    industry: "Energy Storage",
    deal_type: "news",
    published_date: "2025-09-23T08:57:50.000Z",
    source: "Bloomberg Green",
    content: "Snowy Hydro struck a deal to use a battery being developed by a BlackRock Inc. unit."
  }
];

export function SignalHighlightsCard() {
  const { data: dbSignals, isLoading: loading } = useRecentProcessedSignals(4);
  const [selectedSignal, setSelectedSignal] = useState<ProcessedSignal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Map mock data to ProcessedSignal format
  const mockProcessedSignals: ProcessedSignal[] = useMemo(() => {
    return MOCK_SIGNALS_DATA.map((mock, index) => ({
      id: mock.signal_id,
      raw_signal_id: mock.original_id,
      signal_type_classified: mock.deal_type,
      content_snippet: mock.content,
      processed_timestamp: mock.published_date,
      memo_analysis: `${mock.company} in ${mock.location} - ${mock.industry}`,
      credibility_score: Math.floor(Math.random() * 3) + 8,
      raw_signal: {
        id: mock.signal_id,
        signal_id: mock.signal_id,
        original_id: mock.original_id,
        url: mock.original_id.startsWith('http') ? mock.original_id : undefined,
        title: mock.title,
        description: mock.content,
        source: mock.source,
        source_type: mock.deal_type === 'news' ? 'rss' : 'email_alert',
        author: mock.company,
        scraped_date: mock.published_date,
        created_at: mock.published_date,
        publication_date: mock.published_date
      }
    }));
  }, []);

  const openModal = (signal: ProcessedSignal) => { setSelectedSignal(signal); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setSelectedSignal(null); };

  // Use mock data instead of database signals
  const recentSignals = mockProcessedSignals;

  const getCategoryColor = (signal: ProcessedSignal) => {
    // Determine category based on source and content
    const source = signal.raw_signal?.source || "";
    if (source.includes('PitchBook')) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    } else if (source.includes('Bloomberg') || source.includes('Financial Times')) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    } else if (source.includes('Carbon Brief') || source.includes('Climate')) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getSourceColor = (source: string) => {
    switch (true) {
      case source.includes('PitchBook'): return "bg-orange-100 text-orange-800";
      case source.includes('Bloomberg'): return "bg-blue-100 text-blue-800";
      case source.includes('Carbon Brief'): return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyIndicator = (signal: ProcessedSignal) => {
    // Determine urgency based on recency and source type
    const hoursOld = Math.floor((Date.now() - new Date(signal.processed_timestamp).getTime()) / (1000 * 60 * 60));
    if (hoursOld < 6) return "bg-red-500";
    if (hoursOld < 24) return "bg-amber-500";
    return "bg-green-500";
  };

  const getTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
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
            key={signal.id}
            className="relative p-3 rounded-lg border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200 group cursor-pointer"
            onClick={() => openModal(signal)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${getUrgencyIndicator(signal)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-medium text-sm leading-snug">{signal.raw_signal?.title || "Untitled"}</div>
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
                  {signal.content_snippet || signal.raw_signal?.description}
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-0.5 h-auto ${getCategoryColor(signal)}`}
                    >
                      {signal.raw_signal?.source.includes('PitchBook') ? 'Investment' : 
                       signal.raw_signal?.source.includes('Carbon Brief') ? 'Policy' : 'Market Intel'}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs px-2 py-0.5 h-auto ${getSourceColor(signal.raw_signal?.source || "")}`}
                    >
                      {signal.raw_signal?.source}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{getTimestamp(signal.processed_timestamp)}</span>
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
        
        <SignalDetailModal signal={selectedSignal} isOpen={isModalOpen} onClose={closeModal} />
      </CardContent>
    </Card>
  );
}