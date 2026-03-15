import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, Activity, Calendar } from "lucide-react";
import { getDocumentById } from "@/lib/dal/vault";
import { getReportTypeColor } from "@/lib/reportTypes";
import DeleteDocumentButton from "@/components/vault/DeleteDocumentButton";
import EditableMarkerList from "@/components/vault/EditableMarkerList";

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

  const markers = document.extractedData.map((d) => ({
    id: d.id,
    markerName: d.markerName,
    numericValue: d.numericValue,
    textValue: d.textValue,
    unit: d.unit,
    flag: d.flag ?? "normal",
  }));

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

        <div className="flex items-start gap-2 flex-wrap">
          <h1 className="text-[22px] font-extrabold text-slate-800 tracking-tight truncate leading-tight">
            {document.fileName}
          </h1>
          {document.reportType && (
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 mt-0.5 ${getReportTypeColor(document.reportType)}`}>
              {document.reportType}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(document.reportDate), "MMMM d, yyyy")}
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
          </div>
        </a>

        {/* Editable biomarker list */}
        <EditableMarkerList markers={markers} />

        {/* Delete report */}
        <div className="pt-2 pb-6">
          <DeleteDocumentButton documentId={document.id} />
        </div>

      </main>
    </div>
  );
}
