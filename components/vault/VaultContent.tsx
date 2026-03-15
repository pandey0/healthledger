"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import VaultFilters from "./VaultFilters";
import VaultList from "./VaultList";

const PAGE_SIZE = 10;

interface VaultDocument {
  id: string;
  fileName: string;
  createdAt: string;
  reportType: string | null;
  _count: { extractedData: number };
  extractedData: { id: string; markerName: string; flag: string | null }[];
}

interface VaultContentProps {
  documents: VaultDocument[];
}

export default function VaultContent({ documents }: VaultContentProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const availableYears = useMemo(() => {
    const years = new Set(documents.map((d) => new Date(d.createdAt).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [documents]);

  const availableTypes = useMemo(() => {
    const types = new Set(documents.map((d) => d.reportType).filter(Boolean));
    return Array.from(types) as string[];
  }, [documents]);

  const filteredAndSorted = useMemo(() => {
    let result = [...documents];

    // Year filter
    if (selectedYear !== null) {
      result = result.filter((d) => new Date(d.createdAt).getFullYear() === selectedYear);
    }

    // Report type filter
    if (selectedType !== null) {
      result = result.filter((d) => d.reportType === selectedType);
    }

    // Flagged only filter
    if (flaggedOnly) {
      result = result.filter((d) => d.extractedData.some((e) => e.flag === "high" || e.flag === "low"));
    }

    // Text search: match filename OR marker names
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((d) => {
        if (d.fileName.toLowerCase().includes(q)) return true;
        if (d.reportType?.toLowerCase().includes(q)) return true;
        if (d.extractedData.some((e) => e.markerName.toLowerCase().includes(q))) return true;
        return false;
      });
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [documents, selectedYear, selectedType, flaggedOnly, searchQuery, sortOrder]);

  const hasActiveFilters = flaggedOnly || selectedType !== null || searchQuery.trim() !== "";

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [selectedYear, selectedType, flaggedOnly, searchQuery, sortOrder]);

  const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE);
  const paginated = filteredAndSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      {/* Search bar */}
      <div className="px-6 mb-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports or biomarkers..."
            className="w-full pl-10 pr-10 py-3 bg-white rounded-[16px] border border-slate-100 shadow-sm text-[14px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-300 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Report type chips */}
      {availableTypes.length > 0 && (
        <div className="px-6 mb-1">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {availableTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                  selectedType === type
                    ? "bg-[#1A365D] text-white"
                    : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {type}
              </button>
            ))}
            <button
              onClick={() => setFlaggedOnly(!flaggedOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                flaggedOnly
                  ? "bg-amber-500 text-white"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Flagged only
            </button>
          </div>
        </div>
      )}

      {/* If no report types, still show flagged toggle */}
      {availableTypes.length === 0 && (
        <div className="px-6 mb-1">
          <button
            onClick={() => setFlaggedOnly(!flaggedOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
              flaggedOnly
                ? "bg-amber-500 text-white"
                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Flagged only
          </button>
        </div>
      )}

      <VaultFilters
        availableYears={availableYears}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      {/* Active filter summary */}
      {hasActiveFilters && (
        <div className="px-6 pt-3 pb-1 flex items-center justify-between">
          <p className="text-[12px] font-semibold text-slate-500">
            {filteredAndSorted.length} of {documents.length} reports
          </p>
          <button
            onClick={() => { setSearchQuery(""); setFlaggedOnly(false); setSelectedType(null); }}
            className="text-[12px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      <VaultList documents={paginated} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <p className="text-[12px] font-semibold text-slate-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-[10px] bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-300 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-[10px] text-[13px] font-bold transition-all ${
                  p === page
                    ? "bg-[#1A365D] text-white"
                    : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-[10px] bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-300 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
