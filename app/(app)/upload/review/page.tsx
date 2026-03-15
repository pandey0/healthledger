"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, AlertCircle, Trash2, Loader2, ArrowLeft, ShieldCheck, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { saveDocumentData } from "@/lib/actions/vault";
import { getReferenceRange } from "@/lib/referenceRanges";

type ExtractedMarker = {
  id: string;
  marker: string;
  value: string;
  unit: string;
  flag: string;
};

type PendingData = {
  fileName: string;
  fileUrl: string;
  extractedItems: ExtractedMarker[];
  testDate: string;
};

function flagColors(flag: string) {
  if (flag === "high" || flag === "High") return { stripe: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200/60", label: "HIGH" };
  if (flag === "low" || flag === "Low")   return { stripe: "bg-red-400",   badge: "bg-red-50 text-red-700 border-red-200/60",     label: "LOW" };
  return { stripe: "bg-emerald-400/60", badge: "", label: "" };
}

export default function ReviewPage() {
  const router = useRouter();
  const [pendingData, setPendingData] = useState<PendingData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("pendingVaultData");
    if (saved) {
      setPendingData(JSON.parse(saved));
    } else {
      router.replace("/upload");
    }
  }, [router]);

  const handleValueChange = (id: string, newValue: string) => {
    if (!pendingData) return;
    setPendingData({
      ...pendingData,
      extractedItems: pendingData.extractedItems.map((item) =>
        item.id === id ? { ...item, value: newValue } : item
      ),
    });
  };

  const handleDelete = (id: string) => {
    if (!pendingData) return;
    setPendingData({
      ...pendingData,
      extractedItems: pendingData.extractedItems.filter((item) => item.id !== id),
    });
  };

  const handleDateChange = (newDate: string) => {
    if (!pendingData) return;
    setPendingData({
      ...pendingData,
      testDate: newDate,
    });
  };

  const handleConfirm = async () => {
    if (!pendingData) return;
    setIsSaving(true);

    const result = await saveDocumentData({
      fileName: pendingData.fileName,
      fileUrl: pendingData.fileUrl,
      extractedItems: pendingData.extractedItems,
      testDate: pendingData.testDate,
    });

    if (!result.success) {
      alert(result.error || "Failed to archive document.");
      setIsSaving(false);
      return;
    }

    sessionStorage.removeItem("pendingVaultData");
    router.push("/vault");
  };

  if (!pendingData) return null;

  const flaggedCount = pendingData.extractedItems.filter(
    (i) => i.flag === "high" || i.flag === "low" || i.flag === "High" || i.flag === "Low"
  ).length;

  return (
    <div className="flex flex-col animate-in slide-in-from-right-4 duration-500 pb-44 md:pb-40">

      {/* Header */}
      <header className="px-6 pt-8 pb-5 sticky top-0 z-10 bg-[#F4F3F0]/95 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-[24px] font-extrabold text-slate-800 tracking-tight">Verify Report</h1>
        <p className="text-[13px] font-medium text-slate-500 mt-1 truncate">
          {pendingData.extractedItems.length} markers extracted from{" "}
          <span className="font-bold text-slate-700">{pendingData.fileName}</span>
        </p>
      </header>

      <main className="px-6 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm">
            <p className="text-[26px] font-extrabold text-slate-800 leading-none">{pendingData.extractedItems.length}</p>
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mt-1">Markers found</p>
          </div>
          <div className={`rounded-[20px] p-4 border shadow-sm ${flaggedCount > 0 ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"}`}>
            <p className={`text-[26px] font-extrabold leading-none ${flaggedCount > 0 ? "text-amber-700" : "text-emerald-700"}`}>{flaggedCount}</p>
            <p className={`text-[12px] font-bold uppercase tracking-wide mt-1 ${flaggedCount > 0 ? "text-amber-500" : "text-emerald-500"}`}>
              {flaggedCount === 0 ? "All normal" : "Flagged"}
            </p>
          </div>
        </div>

        {/* Test date picker */}
        <div className="bg-white rounded-[16px] px-4 py-3 border border-slate-100 shadow-sm">
          <label className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Test Date</p>
              <input
                type="date"
                value={pendingData.testDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full text-[14px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-[10px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A365D]/20"
              />
            </div>
          </label>
        </div>

        {/* View original */}
        <a href={pendingData.fileUrl} target="_blank" rel="noreferrer">
          <div className="flex items-center gap-3 bg-white rounded-[16px] px-4 py-3 border border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-[14px] font-semibold text-slate-600 flex-1">View Original Document</span>
          </div>
        </a>

        {/* Instruction */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-[16px] px-4 py-3">
          <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[12px] text-blue-700 font-medium leading-relaxed">
            Review extracted values before saving. Tap any value to correct it. Swipe or tap the trash icon to remove a marker.
          </p>
        </div>

        {/* Marker list */}
        <div>
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Extracted Markers</p>
          <div className="space-y-2.5">
            {pendingData.extractedItems.map((item) => {
              const colors = flagColors(item.flag);
              const isFlagged = colors.label !== "";
              const ref = getReferenceRange(item.marker);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-[18px] border border-slate-100 shadow-sm overflow-hidden flex items-stretch group"
                >
                  {/* Status stripe */}
                  <div className={`w-1 shrink-0 ${colors.stripe}`} />

                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-3">

                      {/* Marker info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-slate-800 truncate">{item.marker}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {item.unit && (
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                              {item.unit}
                            </span>
                          )}
                          {isFlagged && (
                            <span className={`inline-flex items-center px-2 py-0.5 border rounded text-[10px] font-bold uppercase tracking-wider ${colors.badge}`}>
                              {colors.label}
                            </span>
                          )}
                          {ref && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              Ref: {ref.min}–{ref.max === 999 ? "↑" : ref.max} {ref.unit}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Value input + delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Input
                          type="text"
                          value={item.value}
                          onChange={(e) => handleValueChange(item.id, e.target.value)}
                          className="w-20 h-9 text-right text-[15px] font-bold text-slate-800 border-slate-200 bg-slate-50 rounded-[10px] focus-visible:ring-1"
                        />
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-[10px] transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Floating confirm bar */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 pt-4 pb-8 md:pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-3xl mx-auto space-y-3">
          <button
            onClick={handleConfirm}
            disabled={isSaving || pendingData.extractedItems.length === 0}
            className="w-full h-13 py-3.5 bg-[#1A365D] hover:bg-[#12243e] disabled:opacity-50 text-white font-bold text-[15px] rounded-[16px] shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving to Vault...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Archive {pendingData.extractedItems.length} Markers to Vault
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-[11px] font-semibold text-slate-400">Encrypted and stored securely</p>
          </div>
        </div>
      </div>

    </div>
  );
}
