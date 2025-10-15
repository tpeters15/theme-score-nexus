import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Signal, Search } from "lucide-react";
import { format } from "date-fns";
import { PROCESSED_SIGNALS_DATA, ProcessedSignalData } from "@/data/processedSignals";
import { SignalFilterDemo } from "@/components/ui/signal-filter-demo";
import { SignalsTableView } from "@/components/SignalsTableView";
import { ImportProcessedSignalsCSV } from "@/components/ImportProcessedSignalsCSV";

export default function Signals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSignal, setSelectedSignal] = useState<ProcessedSignalData | null>(null);
  const [filters, setFilters] = useState<any[]>([]);

  const signals = PROCESSED_SIGNALS_DATA;

  const handleSignalClick = (signal: ProcessedSignalData) => {
    setSelectedSignal(signal);
    // You can open a modal here if needed
    console.log("Signal clicked:", signal);
  };

  // Get unique sources and types for filters
  const sources = [...new Set(signals.map(s => s.source))];
  const types = [...new Set(signals.map(s => s.signal_type))];

  // Filter signals based on search and filters
  const filteredSignals = signals.filter(signal => {
    const matchesSearch = !searchQuery || 
      signal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signal.content_snippet?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signal.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signal.countries.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply active filters
    const matchesFilters = filters.length === 0 || filters.every(filter => {
      if (!filter.value || filter.value.length === 0) return true;
      
      switch (filter.type) {
        case 'Source':
          return filter.value.some((val: string) => 
            signal.source.toLowerCase().includes(val.toLowerCase())
          );
        case 'Type':
          return filter.value.some((val: string) => 
            signal.signal_type.toLowerCase().includes(val.toLowerCase())
          );
        case 'Country':
          return filter.value.some((val: string) => 
            signal.countries.toLowerCase().includes(val.toLowerCase())
          );
        default:
          return true;
      }
    });
    
    return matchesSearch && matchesFilters;
  });

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
        <div className="flex items-center gap-4">
          <ImportProcessedSignalsCSV />
          <div className="text-right text-sm text-muted-foreground">
            <div>{filteredSignals.length} signals</div>
            <div>Last updated: {signals[0] ? format(new Date(signals[0].published_date), 'MMM dd, HH:mm') : '-'}</div>
          </div>
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
                  placeholder="Search signals by title, description, source, or country..."
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
    </div>
  );
}
