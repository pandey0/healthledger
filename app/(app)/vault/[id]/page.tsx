import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, Activity, Calendar, TrendingUp, ChevronRight } from "lucide-react";
import { getDocumentById } from "@/lib/dal/vault";
import { getReferenceRange } from "@/lib/referenceRanges";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const document = await getDocumentById(resolvedParams.id);

  if (!document) {
    notFound();
  }

  const anomalies = document.extractedData.filter(
    (d) => d.flag === "high" || d.flag === "low" || d.flag === "High" || d.flag === "Low"
  );

  return (
    <div className="flex flex-col animate-in slide-in-from-right-4 duration-500 pb-12">

      {/* Header */}
      <header className="px-6 pt-8 pb-5 sticky top-0 z-10 bg-[#F4F3F0]/95 backdrop-blur-md">
        <Link
          href="/vault"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vault
        </Link>

        <h1 className="text-[22px] font-extrabold text-slate-800 tracking-tight truncate leading-tight">
          {document.fileName}
        </h1>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(document.createdAt), "MMMM d, yyyy")}
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400">
            <Activity className="w-3.5 h-3.5" />
            {document.extractedData.length} markers
          </div>
        </div>
      </header>

      <main className="px-6 space-y-5">

        {/* Summary row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm">
            <p className="text-[26px] font-extrabold text-slate-800 leading-none">
              {document.extractedData.length}
            </p>
            <p className="text-[12px] text-slate-400 font-bold uppercase tracking-wide mt-1">Biomarkers</p>
          </div>
          <div className={`rounded-[20px] p-4 border shadow-sm ${anomalies.length > 0 ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"}`}>
            <p className={`text-[26px] font-extrabold leading-none ${anomalies.length > 0 ? "text-amber-700" : "text-emerald-700"}`}>
              {anomalies.length}
            </p>
            <p className={`text-[12px] font-bold uppercase tracking-wide mt-1 ${anomalies.length > 0 ? "text-amber-500" : "text-emerald-500"}`}>
              {anomalies.length === 0 ? "All Normal" : "Flagged"}
            </p>
          </div>
        </div>

        {/* View original */}
        <a href={document.fileUrl} target="_blank" rel="noreferrer">
          <div className="flex items-center gap-3 bg-white rounded-[16px] px-4 py-3 border border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
            <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-[14px] font-semibold text-slate-600 flex-1">View Original Document</span>
            <ChevronRight className="w-4 h-4 text-slate-200" />
          </div>
        </a>

        {/* Biomarker list */}
        <div>
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
            Extracted Biomarkers
          </p>

          <div className="space-y-2.5">
            {document.extractedData.map((data) => {
              const ref = data.numericValue !== null ? getReferenceRange(data.markerName) : null;
              const isHigh = data.flag === "high" || data.flag === "High";
              const isLow = data.flag === "low" || data.flag === "Low";
              const isFlagged = isHigh || isLow;

              let statusColor = "bg-emerald-400/70";
              let badgeBg = "";
              let badgeText = "";
              if (isHigh) { statusColor = "bg-amber-400"; badgeBg = "bg-amber-50 text-amber-700 border-amber-200/60"; badgeText = "HIGH"; }
              if (isLow)  { statusColor = "bg-red-400"; badgeBg = "bg-red-50 text-red-700 border-red-200/60"; badgeText = "LOW"; }

              return (
                <Link
                  key={data.id}
                  href={`/vault/marker/${encodeURIComponent(data.markerName)}`}
                  className="block outline-none group"
                >
                  <div className="bg-white rounded-[18px] border border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md transition-all overflow-hidden flex items-stretch">

                    {/* Status stripe */}
                    <div className={`w-1 shrink-0 ${statusColor}`} />

                    <div className="flex-1 p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                          {data.markerName}
                        </p>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {isFlagged && (
                            <span className={`inline-flex items-center px-2 py-0.5 border rounded text-[10px] font-bold uppercase tracking-wider ${badgeBg}`}>
                              {badgeText}
                            </span>
                          )}
                          {ref && (
                            <span className="text-[11px] font-medium text-slate-400">
                              Ref: {ref.min}–{ref.max === 999 ? "↑" : ref.max} {ref.unit}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-[18px] font-extrabold text-slate-800 tabular-nums leading-none">
                            {data.numericValue !== null ? data.numericValue : data.textValue}
                          </p>
                          {data.unit && (
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">
                              {data.unit}
                            </p>
                          )}
                        </div>
                        <TrendingUp className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
                      </div>
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
