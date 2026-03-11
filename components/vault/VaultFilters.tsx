"use client";

import { ArrowUpDown } from "lucide-react";

type SortOrder = "newest" | "oldest";

interface VaultFiltersProps {
  availableYears: number[];
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
}

export default function VaultFilters({
  availableYears,
  selectedYear,
  onYearChange,
  sortOrder,
  onSortChange,
}: VaultFiltersProps) {
  return (
    <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm px-6 py-3 flex items-center justify-between gap-3 border-b border-slate-100">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onYearChange(null)}
          className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all ${
            selectedYear === null
              ? "bg-[#0F1F3D] text-white shadow-sm"
              : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
          }`}
        >
          All
        </button>
        {availableYears.map((year) => (
          <button
            key={year}
            onClick={() => onYearChange(year)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all ${
              selectedYear === year
                ? "bg-[#0F1F3D] text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      <button
        onClick={() => onSortChange(sortOrder === "newest" ? "oldest" : "newest")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold text-slate-500 bg-white border border-slate-200 hover:border-slate-300 transition-all whitespace-nowrap shrink-0"
      >
        <ArrowUpDown className="w-3.5 h-3.5" />
        {sortOrder === "newest" ? "Newest" : "Oldest"}
      </button>
    </div>
  );
}
