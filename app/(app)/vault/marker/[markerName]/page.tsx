import Link from "next/link";
import { ArrowLeft, TrendingUp, Info } from "lucide-react";
import { getBiomarkerHistory } from "@/lib/dal/vault";
import { getReferenceRange, isInRange } from "@/lib/referenceRanges";
import { getUserProfile } from "@/lib/dal/user";
import TrendGraph from "@/components/vault/TrendGraph";

export default async function MarkerTrendPage({
  params,
}: {
  params: Promise<{ markerName: string }>;
}) {
  const resolvedParams = await params;
  const decodedMarkerName = decodeURIComponent(resolvedParams.markerName);

  const [history, userProfile] = await Promise.all([
    getBiomarkerHistory(decodedMarkerName),
    getUserProfile(),
  ]);

  const profile = userProfile
    ? { gender: userProfile.gender as "male" | "female" | "other" | null, age: userProfile.age }
    : undefined;

  const ref = getReferenceRange(decodedMarkerName, profile);

  const numericHistory = history.filter((d) => d.numericValue !== null);
  const latestEntry = numericHistory[0];
  const latestValue = latestEntry?.numericValue ?? null;
  const latestInRange = latestValue !== null && ref ? isInRange(latestValue, ref) : null;

  const unit = numericHistory[0]?.unit ?? (ref?.unit ?? "");

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

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-[14px]">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-800 tracking-tight capitalize leading-tight">
              {decodedMarkerName}
            </h1>
            <p className="text-[12px] font-semibold text-slate-400 mt-0.5">
              {numericHistory.length} data point{numericHistory.length !== 1 ? "s" : ""} recorded
            </p>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-4">

        {/* Current value + status card */}
        {latestValue !== null && (
          <div className={`rounded-[24px] p-5 border ${
            latestInRange === true
              ? "bg-emerald-50 border-emerald-100"
              : latestInRange === false
              ? "bg-amber-50 border-amber-100"
              : "bg-white border-slate-100"
          }`}>
            <p className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-1">Latest Reading</p>
            <div className="flex items-end gap-2">
              <span className="text-[40px] font-extrabold text-slate-800 leading-none tabular-nums">
                {latestValue}
              </span>
              <span className="text-[16px] font-semibold text-slate-400 mb-1">{unit}</span>
            </div>
            {latestInRange !== null && (
              <div className={`flex items-center gap-2 mt-3 text-[13px] font-bold ${latestInRange ? "text-emerald-700" : "text-amber-700"}`}>
                <div className={`w-2 h-2 rounded-full ${latestInRange ? "bg-emerald-500" : "bg-amber-500"}`} />
                {latestInRange ? "Within normal range" : "Outside normal range"}
              </div>
            )}
          </div>
        )}

        {/* Reference range info */}
        {ref ? (
          <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-[10px] flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-800">Standard Reference Range</p>
              <p className="text-[13px] font-semibold text-slate-500 mt-0.5">
                {ref.min}–{ref.max === 999 ? "↑" : ref.max} {ref.unit}
                <span className="ml-2 text-slate-400">({ref.label})</span>
              </p>
              {ref.note && (
                <p className="text-[11px] text-slate-400 font-medium mt-1">{ref.note}</p>
              )}
              <p className="text-[11px] text-slate-400 font-medium mt-2">
                Reference values are general guidelines. Consult your doctor for personalized interpretation.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-[20px] p-4 border border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-[10px] flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-600">No reference range available</p>
              <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                Standard ranges for this marker aren&apos;t in our database yet.
              </p>
            </div>
          </div>
        )}

        {/* Trend chart */}
        <div>
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Trend Over Time</p>
          {numericHistory.length < 2 ? (
            <div className="bg-white rounded-[20px] p-8 border border-dashed border-slate-200 flex flex-col items-center text-center">
              <TrendingUp className="w-8 h-8 text-slate-200 mb-3" />
              <p className="text-[14px] font-bold text-slate-600">Not enough data to plot a trend</p>
              <p className="text-[12px] text-slate-400 font-medium mt-1">
                Upload another report containing {decodedMarkerName} to see how it changes over time.
              </p>
            </div>
          ) : (
            <TrendGraph data={history} referenceRange={ref} />
          )}
        </div>

        {/* Historical data table */}
        {numericHistory.length > 0 && (
          <div>
            <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">History</p>
            <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
              {numericHistory.map((entry, i) => {
                const inRange = ref ? isInRange(entry.numericValue!, ref) : null;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between px-4 py-3.5 ${i < numericHistory.length - 1 ? "border-b border-slate-50" : ""}`}
                  >
                    <div>
                      <p className="text-[13px] font-semibold text-slate-600">
                        {new Date(entry.testDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      {inRange !== null && (
                        <p className={`text-[11px] font-bold mt-0.5 ${inRange ? "text-emerald-500" : "text-red-500"}`}>
                          {inRange ? "Normal" : "Out of range"}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[17px] font-extrabold text-slate-800 tabular-nums">{entry.numericValue}</span>
                      <span className="text-[12px] font-semibold text-slate-400 ml-1">{entry.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
