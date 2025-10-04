"use client";

import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Search, Filter, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export type DataTableColumn<T> = {
  key: keyof T;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  getFilterValue?: (row: T) => string;
};

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  itemsPerPage?: number;
  showPagination?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  className,
  searchable = true,
  searchPlaceholder = "Search...",
  itemsPerPage = 10,
  showPagination = true,
  striped = false,
  hoverable = true,
  bordered = true,
  compact = false,
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [filterSearch, setFilterSearch] = useState<Record<string, string>>({});

  // Get unique values for each filterable column
  const getUniqueColumnValues = (column: DataTableColumn<T>): string[] => {
    const values = data.map(row => {
      if (column.getFilterValue) {
        return column.getFilterValue(row);
      }
      return String(row[column.key] || '');
    }).filter(Boolean);
    return Array.from(new Set(values)).sort();
  };

  // Filter data based on search and column filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Global search
    if (search) {
      filtered = filtered.filter((row) =>
        columns.some((column) => {
          const value = row[column.key];
          return value?.toString().toLowerCase().includes(search.toLowerCase());
        }),
      );
    }

    // Column filters (multiselect)
    Object.entries(columnFilters).forEach(([key, selectedValues]) => {
      if (selectedValues && selectedValues.length > 0) {
        const column = columns.find(col => String(col.key) === key);
        filtered = filtered.filter((row) => {
          let rowValue: string;
          if (column?.getFilterValue) {
            rowValue = column.getFilterValue(row);
          } else {
            rowValue = String(row[key as keyof T] || '');
          }
          return selectedValues.includes(rowValue);
        });
      }
    });

    return filtered;
  }, [data, search, columnFilters, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;

    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage, showPagination]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const toggleColumnFilter = (key: string, value: string) => {
    setColumnFilters((prev) => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      
      return {
        ...prev,
        [key]: updated.length > 0 ? updated : [],
      };
    });
    setCurrentPage(1);
  };

  const clearColumnFilter = (key: string) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const setColumnFilterSearch = (key: string, value: string) => {
    setFilterSearch((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getFilteredColumnValues = (column: DataTableColumn<T>) => {
    const allValues = getUniqueColumnValues(column);
    const searchTerm = filterSearch[String(column.key)]?.toLowerCase() || '';
    
    if (!searchTerm) return allValues;
    
    return allValues.filter(value => 
      value.toLowerCase().includes(searchTerm)
    );
  };
  if (loading) {
    return (
      <div className={cn("w-full bg-card rounded-2xl ", className)}>
        <div className="animate-pulse p-6">
          {/* Search skeleton */}
          {searchable && <div className="mb-6 h-11 bg-muted rounded-2xl"></div>}
          {/* Table skeleton */}
          <div className="border border-border  overflow-hidden">
            <div className="bg-muted/30 h-14"></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-14 border-t border-border bg-card"
              ></div>
            ))}
          </div>
          {/* Pagination skeleton */}
          <div className="mt-6 flex justify-between items-center">
            <div className="h-4 bg-muted rounded w-48"></div>
            <div className="flex gap-2">
              <div className="h-9 w-20 bg-muted rounded-2xl"></div>
              <div className="h-9 w-9 bg-muted rounded-2xl"></div>
              <div className="h-9 w-9 bg-muted rounded-2xl"></div>
              <div className="h-9 w-16 bg-muted rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full bg-card rounded-2xl",
        bordered && "border border-border",
        className,
      )}
    >
      {/* Search and Filters */}
      {searchable && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-b border-border">
          <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-input rounded-2xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>
        </div>
      )}
      {/* Table */}
      <div
        className={cn(
          "overflow-x-auto overflow-y-auto bg-muted/30 h-[600px]",
          searchable ? "rounded-b-2xl" : "rounded-2xl",
        )}
        style={{ scrollbarGutter: 'stable both-edges' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-full table-fixed">
            <thead className="bg-muted/30">
              <tr>
                {" "}
                {columns.map((column) => {
                  const activeFilterCount = columnFilters[String(column.key)]?.length || 0;
                  
                  return (
                    <th
                      key={String(column.key)}
                      className={cn(
                        "text-left font-medium bg-muted/30 h-14",
                        compact ? "px-4 py-3" : "px-6 py-4",
                      )}
                      style={column.width ? { width: column.width } : undefined}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div 
                          className={cn(
                            "flex items-center gap-2 min-w-0 flex-1 h-12",
                            column.sortable && "cursor-pointer hover:text-foreground transition-colors group"
                          )}
                          onClick={() => column.sortable && handleSort(column.key)}
                        >
                          <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate whitespace-nowrap">
                            {column.header}
                          </span>
                          {column.sortable && (
                            <div className="flex flex-col flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                              <ChevronUp
                                className={cn(
                                  "h-3.5 w-3.5 -mb-1",
                                  sortConfig.key === column.key &&
                                    sortConfig.direction === "asc"
                                    ? "text-primary opacity-100"
                                    : "text-muted-foreground",
                                )}
                              />
                              <ChevronDown
                                className={cn(
                                  "h-3.5 w-3.5",
                                  sortConfig.key === column.key &&
                                    sortConfig.direction === "desc"
                                    ? "text-primary opacity-100"
                                    : "text-muted-foreground",
                                )}
                              />
                            </div>
                          )}
                        </div>
                        {column.filterable && (
                          <Popover onOpenChange={(open) => {
                            if (!open) {
                              setColumnFilterSearch(String(column.key), '');
                            }
                          }}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                                className={cn(
                                  "h-7 w-7 p-0 flex-shrink-0 relative",
                                  activeFilterCount > 0 ? "text-primary hover:text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                <Filter className="h-3.5 w-3.5" />
                                <Badge 
                                  variant="default" 
                                  className={cn(
                                    "absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] font-semibold",
                                    activeFilterCount > 0 ? "" : "opacity-0"
                                  )}
                                  aria-hidden={activeFilterCount === 0}
                                >
                                  {activeFilterCount || 0}
                                </Badge>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent 
                              className="w-64 p-0 bg-popover border border-border shadow-lg z-50" 
                              align="start"
                              onOpenAutoFocus={(e) => e.preventDefault()}
                            >
                              <div className="p-3 border-b border-border bg-muted/30">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-foreground">Filter</span>
                                  {activeFilterCount > 0 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        clearColumnFilter(String(column.key));
                                      }}
                                      className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                      Clear all
                                    </Button>
                                  )}
                                </div>
                                <div className="relative">
                                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                  <Input
                                    placeholder="Search..."
                                    value={filterSearch[String(column.key)] || ''}
                                    onChange={(e) => setColumnFilterSearch(String(column.key), e.target.value)}
                                    className="h-8 pl-8 text-xs bg-background"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                              <div className="max-h-64 overflow-y-auto p-1">
                                {getFilteredColumnValues(column).length === 0 ? (
                                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                    No options found
                                  </div>
                                ) : (
                                  getFilteredColumnValues(column).map((value) => {
                                    const isChecked = columnFilters[String(column.key)]?.includes(value) || false;
                                    return (
                                      <div
                                        key={value}
                                        className={cn(
                                          "flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer transition-colors",
                                          isChecked ? "bg-primary/10" : "hover:bg-accent"
                                        )}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleColumnFilter(String(column.key), value);
                                        }}
                                      >
                                        <div className={cn(
                                          "h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-all",
                                          isChecked 
                                            ? "bg-primary border-primary" 
                                            : "border-input bg-background"
                                        )}>
                                          {isChecked && <Check className="h-3 w-3 text-primary-foreground" />}
                                        </div>
                                        <span className="text-sm flex-1 truncate">
                                          {value}
                                        </span>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                              {activeFilterCount > 0 && (
                                <div className="p-2 border-t border-border bg-muted/30">
                                  <div className="text-xs text-muted-foreground px-1">
                                    {activeFilterCount} selected
                                  </div>
                                </div>
                              )}
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>{" "}
            <tbody className="bg-card" style={{ minHeight: '500px' }}>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className={cn(
                      "text-center text-muted-foreground bg-card",
                      compact ? "px-4 py-12" : "px-6 py-16",
                    )}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2" style={{ minHeight: '500px' }}>
                      <div className="text-4xl">📊</div>
                      <div className="font-medium">{emptyMessage}</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    className={cn(
                      "border-t border-border bg-card transition-colors",
                      striped && index % 2 === 0 && "bg-muted/20",
                      hoverable && "hover:bg-muted/30",
                      onRowClick && "cursor-pointer",
                    )}
                    onClick={() => onRowClick?.(row, index)}
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={cn(
                          "text-sm text-foreground align-middle",
                          compact ? "px-4 py-3" : "px-6 py-4",
                        )}
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : String(row[column.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>{" "}
        </div>
      </div>
      {/* Pagination */}
      {showPagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card border-t border-border min-h-[56px]">
          <div className="text-sm text-muted-foreground order-2 sm:order-1 whitespace-nowrap">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, sortedData.length)} of{" "}
            {sortedData.length} results
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            {totalPages > 1 ? (
              <>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-input rounded-2xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const pageNumber =
                      currentPage <= 3
                        ? i + 1
                        : currentPage >= totalPages - 2
                          ? totalPages - 4 + i
                          : currentPage - 2 + i;

                    if (pageNumber < 1 || pageNumber > totalPages) return null;

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={cn(
                          "px-3 py-2 text-sm border border-input rounded-2xl hover:bg-muted transition-colors",
                          currentPage === pageNumber &&
                            "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
                        )}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-input rounded-2xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 invisible">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled
                  className="px-3 py-2 text-sm border border-input rounded-2xl"
                >
                  Previous
                </button>
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: 1 }).map((_, i) => (
                    <button key={i} className="px-3 py-2 text-sm border border-input rounded-2xl">
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => prev)}
                  disabled
                  className="px-3 py-2 text-sm border border-input rounded-2xl"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
