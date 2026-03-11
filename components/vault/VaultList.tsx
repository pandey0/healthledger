"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";

interface VaultDocument {
  id: string;
  fileName: string;
  createdAt: string;
  _count: { extractedData: number };
  extractedData: { id: string }[];
}

interface VaultListProps {
  documents: VaultDocument[];
}

export default function VaultList({ documents }: VaultListProps) {
  const grouped = groupByMonth(documents);

  if (documents.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-[14px] text-slate-400 font-medium">No reports match the selected filter.</p>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6 space-y-6 mt-4">
      {grouped.map(({ label, docs }) => (
        <section key={label}>
          <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
            {label}
          </h3>
          <div className="space-y-3">
            {docs.map((doc) => {
              const flaggedCount = doc.extractedData.length;
              const hasAnomalies = flaggedCount > 0;
              const borderColor = hasAnomalies ? "border-l-amber-400" : "border-l-emerald-400";

              return (
                <Link key={doc.id} href={`/vault/${doc.id}`} className="block group outline-none">
                  <div className={`bg-white rounded-[20px] border border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md transition-all duration-200 p-4 flex items-center justify-between gap-4 border-l-[4px] ${borderColor}`}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex flex-col items-center shrink-0 w-12">
                        <span className="text-[20px] font-extrabold text-slate-800 leading-none">
                          {format(new Date(doc.createdAt), "d")}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 uppercase mt-0.5">
                          {format(new Date(doc.createdAt), "MMM")}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                          {doc.fileName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[12px] font-medium text-slate-400">
                            {doc._count.extractedData} markers
                          </span>
                          {hasAnomalies && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-200" />
                              <span className="text-[12px] font-bold text-amber-600">
                                {flaggedCount} flagged
                              </span>
                            </>
                          )}
                          {!hasAnomalies && doc._count.extractedData > 0 && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-200" />
                              <span className="text-[12px] font-medium text-emerald-600">
                                All clear
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function groupByMonth(documents: VaultDocument[]) {
  const groups: { label: string; docs: VaultDocument[] }[] = [];
  const map = new Map<string, VaultDocument[]>();

  for (const doc of documents) {
    const key = format(new Date(doc.createdAt), "MMMM yyyy");
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(doc);
  }

  for (const [label, docs] of map) {
    groups.push({ label, docs });
  }

  return groups;
}
