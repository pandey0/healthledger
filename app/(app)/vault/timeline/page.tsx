import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Activity, CheckCircle2, AlertTriangle, TrendingUp, FileText } from "lucide-react";
import { getHealthTimeline } from "@/lib/dal/vault";
import { getReportTypeColor } from "@/lib/reportTypes";

export default async function TimelinePage() {
  const timeline = await getHealthTimeline();

  if (timeline.length === 0) {
    return (
      <div className="flex flex-col animate-in fade-in duration-700 pb-12">
        <header className="px-6 pt-8 pb-5">
          <Link href="/vault" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Vault
          </Link>
          <h1 className="text-[28px] font-extrabold text-slate-800 tracking-tight">Health Timeline</h1>
        </header>
        <div className="px-6 flex flex-col items-center text-center mt-8">
          <Activity className="w-12 h-12 text-slate-200 mb-4" />
          <p className="text-[16px] font-bold text-slate-600">No reports yet</p>
          <p className="text-[13px] text-slate-400 font-medium mt-1">Upload lab reports to build your health timeline.</p>
          <Link href="/upload" className="mt-6 bg-[#1A365D] text-white font-bold px-6 py-3.5 rounded-[16px] text-[14px] hover:bg-[#12243e] transition-all">
            Upload Report
          </Link>
        </div>
      </div>
    );
  }

  // Group timeline entries by year
  const byYear = timeline.reduce<Record<number, typeof timeline>>((acc, entry) => {
    const year = new Date(entry.reportDate).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(entry);
    return acc;
  }, {});

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  // Overall health score
  const totalMarkers = timeline.reduce((s, e) => s + e.totalMarkers, 0);
  const totalNormal = timeline.reduce((s, e) => s + e.normalCount, 0);
  const healthScore = totalMarkers > 0 ? Math.round((totalNormal / totalMarkers) * 100) : 0;

  return (
    <div className="flex flex-col animate-in fade-in duration-700 pb-12">

      <header className="px-6 pt-8 pb-5 sticky top-0 z-10 bg-[#F4F3F0]/95 backdrop-blur-md">
        <Link href="/vault" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Vault
        </Link>
        <h1 className="text-[28px] font-extrabold text-slate-800 tracking-tight">Health Timeline</h1>
        <p className="text-[13px] text-slate-500 font-medium mt-1">{timeline.length} reports across {years.length} year{years.length !== 1 ? "s" : ""}</p>
      </header>

      <main className="px-6 space-y-5">

        {/* Overall health summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm">
            <p className="text-[22px] font-extrabold text-slate-800 leading-none">{timeline.length}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-1">Reports</p>
          </div>
          <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm">
            <p className="text-[22px] font-extrabold text-slate-800 leading-none">{totalMarkers}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-1">Biomarkers</p>
          </div>
          <div className={`rounded-[20px] p-4 border shadow-sm ${healthScore >= 80 ? "bg-emerald-50 border-emerald-100" : healthScore >= 60 ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100"}`}>
            <p className={`text-[22px] font-extrabold leading-none ${healthScore >= 80 ? "text-emerald-700" : healthScore >= 60 ? "text-amber-700" : "text-red-700"}`}>
              {healthScore}%
            </p>
            <p className={`text-[11px] font-bold uppercase tracking-wide mt-1 ${healthScore >= 80 ? "text-emerald-500" : healthScore >= 60 ? "text-amber-500" : "text-red-500"}`}>
              Normal
            </p>
          </div>
        </div>

        {/* Timeline by year */}
        {years.map((year) => (
          <div key={year}>
            <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">{year}</p>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-slate-100" />

              <div className="space-y-3">
                {byYear[year].map((entry, i) => {
                  const isHealthy = entry.flaggedCount === 0;
                  const typeColors = getReportTypeColor(entry.reportType);

                  return (
                    <Link key={entry.id} href={`/vault/${entry.id}`} className="block">
                      <div className="flex items-start gap-4">
                        {/* Timeline dot */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                          isHealthy
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-amber-50 border-amber-200"
                        }`}>
                          {isHealthy
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            : <AlertTriangle className="w-4 h-4 text-amber-500" />
                          }
                        </div>

                        {/* Card */}
                        <div className="flex-1 bg-white rounded-[20px] border border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md transition-all p-4 overflow-hidden">
                          {/* Date + report type */}
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[13px] font-bold text-slate-500">
                              {format(new Date(entry.reportDate), "MMM d, yyyy")}
                            </p>
                            {entry.reportType && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors}`}>
                                {entry.reportType}
                              </span>
                            )}
                          </div>

                          {/* File name */}
                          <p className="text-[14px] font-bold text-slate-800 truncate mb-2">
                            {entry.fileName}
                          </p>

                          {/* Stats row */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[12px] font-semibold text-slate-500">{entry.totalMarkers} markers</span>
                            </div>
                            {entry.flaggedCount > 0 && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-amber-400" />
                                <span className="text-[12px] font-bold text-amber-600">{entry.flaggedCount} flagged</span>
                              </div>
                            )}
                            {isHealthy && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span className="text-[12px] font-bold text-emerald-600">All normal</span>
                              </div>
                            )}
                          </div>

                          {/* Key markers preview */}
                          {entry.keyMarkers.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-50 flex flex-wrap gap-2">
                              {entry.keyMarkers.map((m) => (
                                <div key={m.name} className={`flex items-center gap-1 px-2 py-1 rounded-[8px] text-[11px] font-semibold ${
                                  m.flag === "high" || m.flag === "low"
                                    ? "bg-amber-50 text-amber-700 border border-amber-100"
                                    : "bg-slate-50 text-slate-600 border border-slate-100"
                                }`}>
                                  <span>{m.name}</span>
                                  {m.value !== null && (
                                    <span className="opacity-70">{m.value}{m.unit ? ` ${m.unit}` : ""}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

      </main>
    </div>
  );
}
