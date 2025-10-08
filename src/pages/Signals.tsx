import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Signal, Search } from "lucide-react";
import { format } from "date-fns";
import { useProcessedSignals, type ProcessedSignal } from "@/hooks/useProcessedSignals";
import { SignalDetailModal } from "@/components/SignalDetailModal";
import { SignalFilterDemo } from "@/components/ui/signal-filter-demo";
import { SignalsTableView } from "@/components/SignalsTableView";

export default function Signals() {
  const { data: processedSignals, isLoading: loading, error } = useProcessedSignals();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSignal, setSelectedSignal] = useState<ProcessedSignal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<any[]>([]);

  const handleSignalClick = (signal: ProcessedSignal) => {
    setSelectedSignal(signal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSignal(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Signal Intelligence</h1>
            <p className="text-muted-foreground">Real-time market signals and intelligence feeds</p>
          </div>
        </div>
        
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 pt-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Failed to load signals. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get unique sources and types for filters
  const sources = [...new Set(processedSignals?.map(s => s.raw_signal?.source || "") || [])];
  const types = [...new Set(processedSignals?.map(s => s.signal_type_classified || "") || [])];

  // Filter signals based on search and filters
  const filteredSignals = processedSignals?.filter(signal => {
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
  }) || [];

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
          <div>Last updated: {processedSignals?.[0] ? format(new Date(processedSignals[0].processed_timestamp), 'MMM dd, HH:mm') : '-'}</div>
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