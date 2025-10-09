import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Signal, Search } from "lucide-react";
import { format } from "date-fns";
import { useProcessedSignals, type ProcessedSignal } from "@/hooks/useProcessedSignals";
import { SignalDetailModal } from "@/components/SignalDetailModal";
import { SignalFilterDemo } from "@/components/ui/signal-filter-demo";
import { SignalsTableView } from "@/components/SignalsTableView";

// Mock data for visualization
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
    signal_id: "sig_1758626143238_0",
    original_id: "pitchbook-1758626143142-b6srq7og8",
    title: "PricewaterhouseCoopers (Norway) - Acquisition",
    company: "PricewaterhouseCoopers (Norway)",
    location: "Norway",
    industry: "Accounting, Audit and Tax Services (B2B)",
    deal_type: "acquisition",
    published_date: "2025-09-23T11:14:43Z",
    source: "PitchBook Alert",
    content: "To be acquired by IK Partners for an undisclosed amount with anticipated close date of 15-Sep-2025."
  },
  {
    signal_id: "sig_1758626143238_1",
    original_id: "pitchbook-1758626143143-dl0k77ieq-tise",
    title: "Tise - Exit",
    company: "Tise",
    location: "Oslo, Norway",
    industry: "Information Services (B2C)",
    deal_type: "exit",
    published_date: "2025-09-23T11:14:43Z",
    source: "PitchBook Alert",
    content: "Developer of a mobile marketplace designed to sell and discover second-hand fashion, interior, and furniture."
  },
  {
    signal_id: "sig_1758626143238_2",
    original_id: "pitchbook-1758626143143-ngpp900i7-happn",
    title: "Happn - Exit",
    company: "Happn",
    location: "Paris, France",
    industry: "Social/Platform Software",
    deal_type: "exit",
    published_date: "2025-09-23T11:14:43Z",
    source: "PitchBook Alert",
    content: "Developer of a location-based dating application designed to help people contact each other."
  },
  {
    signal_id: "sig_1758625783207_0",
    original_id: "pitchbook-1758625783120-z994fuxo2-akacia",
    title: "Akacia",
    company: "Akacia",
    location: "Hauteville-les-Dijon, France",
    industry: "Construction and Engineering",
    deal_type: "transaction",
    published_date: "2025-09-23T11:08:49Z",
    source: "PitchBook Alert",
    content: "Received £6.93M from Elevation Capital Partners with close date of 18-Sep-2025."
  },
  {
    signal_id: "sig_1758625783207_1",
    original_id: "pitchbook-1758625783120-fbcedtayg",
    title: "Freightliner Group - Acquisition",
    company: "Freightliner Group",
    location: "Birmingham, United Kingdom",
    industry: "Logistics",
    deal_type: "acquisition",
    published_date: "2025-09-23T11:08:49Z",
    source: "PitchBook Alert",
    content: "To be acquired for an undisclosed amount with anticipated close date of 22-Sep-2025."
  },
  {
    signal_id: "sig_1758625663215_0",
    original_id: "pitchbook-1758625663110-8011gvl7m-msi-nord",
    title: "MSI Nord - Acquisition",
    company: "MSI Nord",
    location: "Mons En Baroeul, France",
    industry: "IT Consulting and Outsourcing",
    deal_type: "acquisition",
    published_date: "2025-09-23T11:07:04Z",
    source: "PitchBook Alert",
    content: "Was acquired for an undisclosed amount with close date of 19-Sep-2025."
  },
  {
    signal_id: "sig_1758621873680_0",
    original_id: "https://www.climatechangenews.com",
    title: "UN climate chief says new national plans will fall short on emissions cuts",
    company: "UN Climate",
    location: "Global",
    industry: "Climate Policy",
    deal_type: "news",
    published_date: "2025-09-23T00:00:00.000Z",
    source: "Carbon Brief Daily",
    content: "Countries' new national climate plans (NDCs) for 2035 are expected to be too weak to meet global goals."
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
    signal_id: "sig_1758621873680_2",
    original_id: "https://www.politico.eu",
    title: "UK Lib Dems ditch flagship 2045 net-zero policy",
    company: "Liberal Democrats",
    location: "United Kingdom",
    industry: "Climate Policy",
    deal_type: "news",
    published_date: "2025-09-23T00:00:00.000Z",
    source: "Carbon Brief Daily",
    content: "The Liberal Democrats have scrapped their 2045 net-zero target and aligned with the Labour government's 2050 goal."
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

export default function Signals() {
  const { data: processedSignals, isLoading: loading, error } = useProcessedSignals();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSignal, setSelectedSignal] = useState<ProcessedSignal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<any[]>([]);

  // Map mock data to ProcessedSignal format
  const mockProcessedSignals: ProcessedSignal[] = useMemo(() => {
    return MOCK_SIGNALS_DATA.map((mock, index) => ({
      id: mock.signal_id,
      raw_signal_id: mock.original_id,
      signal_type_classified: mock.deal_type,
      content_snippet: mock.content,
      processed_timestamp: mock.published_date,
      memo_analysis: `${mock.company} in ${mock.location} - ${mock.industry}`,
      credibility_score: Math.floor(Math.random() * 3) + 8, // Random score 8-10
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

  // Use mock data instead of fetched data
  const signals = mockProcessedSignals;

  const handleSignalClick = (signal: ProcessedSignal) => {
    setSelectedSignal(signal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSignal(null);
  };

  // Get unique sources and types for filters
  const sources = [...new Set(signals.map(s => s.raw_signal?.source || ""))];
  const types = [...new Set(signals.map(s => s.signal_type_classified || ""))];

  // Filter signals based on search and filters
  const filteredSignals = signals.filter(signal => {
    const matchesSearch = !searchQuery || 
      signal.raw_signal?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signal.content_snippet?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signal.raw_signal?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signal.raw_signal?.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply active filters
    const matchesFilters = filters.length === 0 || filters.every(filter => {
      if (!filter.value || filter.value.length === 0) return true;
      
      switch (filter.type) {
        case 'Source':
          return filter.value.some((val: string) => 
            signal.raw_signal?.source.toLowerCase().includes(val.toLowerCase())
          );
        case 'Type':
          return filter.value.some((val: string) => 
            signal.signal_type_classified?.toLowerCase().includes(val.toLowerCase())
          );
        case 'Author':
          return filter.value.some((val: string) => 
            signal.raw_signal?.author?.toLowerCase().includes(val.toLowerCase())
          );
        default:
          return true;
      }
    });
    
    return matchesSearch && matchesFilters;
  });

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'PitchBook Alert': return "bg-orange-100 text-orange-800 border-orange-200";
      case 'Bloomberg Green': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'Carbon Brief Daily': return "bg-green-100 text-green-800 border-green-200";
      case 'Financial Times': return "bg-pink-100 text-pink-800 border-pink-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email_alert': return "bg-purple-100 text-purple-800 border-purple-200";
      case 'rss': return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case 'html': return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto px-6 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Signal className="h-8 w-8 text-primary" />
            </div>
            Signal Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time market signals and intelligence feeds from {sources.length} sources
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>{filteredSignals.length} signals</div>
          <div>Last updated: {signals[0] ? format(new Date(signals[0].processed_timestamp), 'MMM dd, HH:mm') : '-'}</div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search signals by title, description, or source..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <SignalFilterDemo filters={filters} onFiltersChange={setFilters} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signals Table */}
      <SignalsTableView 
        signals={filteredSignals}
        onSignalClick={handleSignalClick}
      />

      <SignalDetailModal 
        signal={selectedSignal}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}