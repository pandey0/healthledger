"use client";

import { useState, useMemo } from "react";
import VaultFilters from "./VaultFilters";
import VaultList from "./VaultList";

interface VaultDocument {
  id: string;
  fileName: string;
  createdAt: string;
  _count: { extractedData: number };
  extractedData: { id: string }[];
}

interface VaultContentProps {
  documents: VaultDocument[];
}

export default function VaultContent({ documents }: VaultContentProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const availableYears = useMemo(() => {
    const years = new Set(documents.map((d) => new Date(d.createdAt).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [documents]);

  const filteredAndSorted = useMemo(() => {
    let result = [...documents];

    if (selectedYear !== null) {
      result = result.filter((d) => new Date(d.createdAt).getFullYear() === selectedYear);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [documents, selectedYear, sortOrder]);

  return (
    <>
      <VaultFilters
        availableYears={availableYears}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />
      <VaultList documents={filteredAndSorted} />
    </>
  );
}
