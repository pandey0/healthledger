"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, FileText, AlertCircle, Trash2, Loader2,
  ArrowLeft, ShieldCheck, Calendar, Plus, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { genUploader } from "uploadthing/client";
import { saveDocumentData } from "@/lib/actions/vault";
import { getReferenceRange, getValueStatus } from "@/lib/referenceRanges";
import { normalizeUnit, getStandardUnit } from "@/lib/unitConversion";
import { getPendingFile, clearPendingFile } from "@/lib/pendingFiles";
import { nanoid } from "nanoid";

const { uploadFiles } = genUploader();

type ExtractedMarker = {
  id: string;
  marker: string;
  value: string;
  unit: string;
  flag: string;
  confidence?: number;
};

type PendingData = {
  fileName: string;
  fileUrl: string;
  fileKey?: string;
  extractedItems: ExtractedMarker[];
  testDate: string;
  reportType?: string;
  extractionQuality?: string;
  warnings?: string[];
};

type FlagOption = "normal" | "high" | "low";
const FLAG_OPTIONS: FlagOption[] = ["normal", "high", "low"];

function stripeColor(flag: string) {
  if (flag === "high" || flag === "High") return "bg-amber-400";
  if (flag === "low" || flag === "Low") return "bg-red-400";
  return "bg-emerald-400/60";
}

function FlagToggle({ value, onChange }: { value: string; onChange: (f: FlagOption) => void }) {
  const norm = value.toLowerCase() as FlagOption;
  return (
    <div className="flex gap-1">
      {FLAG_OPTIONS.map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => onChange(f)}
          className={`px-2.5 py-1 rounded-[8px] text-[10px] font-bold uppercase tracking-wide transition-colors ${
            norm === f
              ? f === "normal" ? "bg-emerald-500 text-white"
              : f === "high"   ? "bg-amber-500 text-white"
              :                  "bg-red-500 text-white"
              : "bg-slate-100 text-slate-400 hover:text-slate-600"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

export default function BatchReviewPage() {
  const router = useRouter();
  const [batch, setBatch] = useState<PendingData[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [savingAll, setSavingAll] = useState(false);
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set());
  const [addingMarker, setAddingMarker] = useState(false);
  const [newMarker, setNewMarker] = useState({ marker: "", value: "", unit: "", flag: "normal" as FlagOption });

  useEffect(() => {
    const raw = sessionStorage.getItem("pendingVaultDataBatch");
    if (raw) {
      setBatch(JSON.parse(raw));
    } else {
      router.replace("/upload");
    }
  }, [router]);

  if (!batch) return null;

  const active = batch[activeIndex];

  const updateActive = (updates: Partial<PendingData>) => {
    setBatch((prev) => {
      if (!prev) return prev;
      return prev.map((item, i) => i === activeIndex ? { ...item, ...updates } : item);
    });
  };

  const updateMarker = (id: string, updates: Partial<ExtractedMarker>) => {
    updateActive({
      extractedItems: active.extractedItems.map((m) => m.id === id ? { ...m, ...updates } : m),
    });
  };

  const deleteMarker = (id: string) => {
    updateActive({ extractedItems: active.extractedItems.filter((m) => m.id !== id) });
  };

  const handleAddMarker = () => {
    if (!newMarker.marker.trim() || !newMarker.value.trim()) {
      toast.error("Marker name and value are required");
      return;
    }
    updateActive({
      extractedItems: [...active.extractedItems, { ...newMarker, id: nanoid(), confidence: 1.0 }],
    });
    setNewMarker({ marker: "", value: "", unit: "", flag: "normal" });
    setAddingMarker(false);
    toast.success("Marker added");
  };

  const saveReport = async (index: number): Promise<boolean> => {
    const report = batch![index];
    let fileUrl = report.fileUrl;

    // Upload to storage only when user saves to vault
    if (!fileUrl && report.fileKey) {
      const file = getPendingFile(report.fileKey);
      if (!file) {
        toast.error(`File for "${report.fileName}" is no longer available. Please re-upload.`);
        return false;
      }
      try {
        const utResponse = await uploadFiles("medicalReport", { files: [file] });
        fileUrl = utResponse[0].url;
        clearPendingFile(report.fileKey);
      } catch {
        toast.error(`Failed to upload "${report.fileName}". Please try again.`);
        return false;
      }
    }

    const result = await saveDocumentData({
      fileName: report.fileName,
      fileUrl,
      extractedItems: report.extractedItems,
      testDate: report.testDate,
      reportType: report.reportType,
    });
    return result.success;
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    let saved = 0;
    const newSaved = new Set(savedIndices);

    for (let i = 0; i < batch.length; i++) {
      if (savedIndices.has(i)) { saved++; continue; }
      const ok = await saveReport(i);
      if (ok) { newSaved.add(i); saved++; }
      else { toast.error(`Failed to save "${batch[i].fileName}"`); }
    }

    setSavedIndices(newSaved);

    if (saved === batch.length) {
      sessionStorage.removeItem("pendingVaultDataBatch");
      toast.success(`${saved} report${saved !== 1 ? "s" : ""} saved to vault`);
      router.push("/vault");
    } else {
      toast.error("Some reports failed to save. Fix errors and try again.");
    }
    setSavingAll(false);
  };

  const flaggedCount = active.extractedItems.filter(
    (i) => i.flag === "high" || i.flag === "low" || i.flag === "High" || i.flag === "Low"
  ).length;

  return (
    <div className="flex flex-col animate-in slide-in-from-right-4 duration-500 pb-44 md:pb-40">

      {/* Header */}
      <header className="px-6 pt-8 pb-4 sticky top-0 z-10 bg-[#F4F3F0]/95 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[22px] font-extrabold text-slate-800 tracking-tight">Verify Reports</h1>
          <span className="text-[12px] font-bold text-slate-400">
            {activeIndex + 1} / {batch.length}
          </span>
        </div>

        {/* Report tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {batch.map((report, i) => (
            <button
              key={i}
              onClick={() => { setActiveIndex(i); setAddingMarker(false); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-[12px] text-[12px] font-bold whitespace-nowrap transition-all shrink-0 ${
                i === activeIndex
                  ? "bg-[#1A365D] text-white shadow-sm"
                  : savedIndices.has(i)
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {savedIndices.has(i) && <CheckCircle2 className="w-3 h-3" />}
              <span className="max-w-[120px] truncate">{report.fileName}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm">
            <p className="text-[26px] font-extrabold text-slate-800 leading-none">{active.extractedItems.length}</p>
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mt-1">Markers found</p>
          </div>
          <div className={`rounded-[20px] p-4 border shadow-sm ${flaggedCount > 0 ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"}`}>
            <p className={`text-[26px] font-extrabold leading-none ${flaggedCount > 0 ? "text-amber-700" : "text-emerald-700"}`}>{flaggedCount}</p>
            <p className={`text-[12px] font-bold uppercase tracking-wide mt-1 ${flaggedCount > 0 ? "text-amber-500" : "text-emerald-500"}`}>
              {flaggedCount === 0 ? "All normal" : "Flagged"}
            </p>
          </div>
        </div>

        {/* Quality warning */}
        {active.extractionQuality === "fair" && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-[16px] px-4 py-3">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[12px] text-amber-700 font-medium leading-relaxed">
              Extraction quality is fair — please review values carefully.
            </p>
          </div>
        )}

        {/* Test date */}
        <div className="bg-white rounded-[16px] px-4 py-3 border border-slate-100 shadow-sm">
          <label className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Test Date</p>
              <input
                type="date"
                value={active.testDate}
                onChange={(e) => updateActive({ testDate: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                className="w-full text-[14px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-[10px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A365D]/20"
              />
            </div>
          </label>
        </div>

        {/* View original */}
        <a href={active.fileUrl} target="_blank" rel="noreferrer">
          <div className="flex items-center gap-3 bg-white rounded-[16px] px-4 py-3 border border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-[14px] font-semibold text-slate-600 flex-1 truncate">{active.fileName}</span>
          </div>
        </a>

        {/* Instruction */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-[16px] px-4 py-3">
          <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[12px] text-blue-700 font-medium leading-relaxed">
            Edit marker names, values, units, or flags. Remove incorrect entries or add missing ones. Repeat for each report tab above.
          </p>
        </div>

        {/* Markers */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Extracted Markers</p>
            <button
              onClick={() => setAddingMarker(true)}
              className="flex items-center gap-1 text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add marker
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Add marker form */}
            {addingMarker && (
              <div className="bg-blue-50 rounded-[18px] border border-blue-200 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold text-blue-700">Add missing marker</p>
                  <button onClick={() => setAddingMarker(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Marker name (e.g. Hemoglobin)"
                  value={newMarker.marker}
                  onChange={(e) => setNewMarker({ ...newMarker, marker: e.target.value })}
                  className="w-full text-[14px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Value"
                    value={newMarker.value}
                    onChange={(e) => setNewMarker({ ...newMarker, value: e.target.value })}
                    className="flex-1 text-[14px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={newMarker.unit}
                    onChange={(e) => setNewMarker({ ...newMarker, unit: e.target.value })}
                    className="w-24 text-[14px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Flag</p>
                  <FlagToggle value={newMarker.flag} onChange={(f) => setNewMarker({ ...newMarker, flag: f })} />
                </div>
                <button
                  onClick={handleAddMarker}
                  className="w-full py-2.5 bg-[#1A365D] text-white text-[13px] font-bold rounded-[12px] hover:bg-[#12243e] transition-colors"
                >
                  Add to List
                </button>
              </div>
            )}

            {active.extractedItems.map((item) => {
              const ref = getReferenceRange(item.marker);
              const standardUnit = getStandardUnit(item.marker);
              const confidence = item.confidence ?? 0.95;
              const lowConfidence = confidence < 0.75;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-[18px] border shadow-sm overflow-hidden flex items-stretch ${
                    lowConfidence ? "border-amber-200" : "border-slate-100"
                  }`}
                >
                  <div className={`w-1 shrink-0 ${stripeColor(item.flag)}`} />
                  <div className="flex-1 p-4 space-y-2.5">
                    {/* Name + delete */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.marker}
                        onChange={(e) => updateMarker(item.id, { marker: e.target.value })}
                        className="flex-1 text-[14px] font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-400 focus:outline-none transition-colors py-0.5"
                      />
                      {lowConfidence && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold shrink-0">Low confidence</span>
                      )}
                      <button
                        onClick={() => deleteMarker(item.id)}
                        className="p-1.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-[8px] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Value + unit */}
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={item.value}
                        onChange={(e) => updateMarker(item.id, { value: e.target.value })}
                        className="w-24 h-9 text-right text-[15px] font-bold text-slate-800 border-slate-200 bg-slate-50 rounded-[10px] focus-visible:ring-1"
                      />
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => {
                          const norm = normalizeUnit(e.target.value);
                          updateMarker(item.id, { unit: norm || e.target.value });
                        }}
                        placeholder={standardUnit}
                        className="w-20 text-[12px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-[8px] px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                      {ref && (
                        <span className="text-[11px] text-slate-400 font-medium ml-1">
                          Ref: {ref.min}–{ref.max === 999 ? "↑" : ref.max} {ref.unit}
                        </span>
                      )}
                    </div>

                    {/* Flag toggle */}
                    <FlagToggle
                      value={item.flag}
                      onChange={(f) => updateMarker(item.id, { flag: f })}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-report navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => { setActiveIndex((i) => Math.max(0, i - 1)); setAddingMarker(false); }}
            disabled={activeIndex === 0}
            className="flex items-center gap-1 text-[13px] font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          {activeIndex < batch.length - 1 ? (
            <button
              onClick={() => { setActiveIndex((i) => Math.min(batch.length - 1, i + 1)); setAddingMarker(false); }}
              className="flex items-center gap-1 text-[13px] font-semibold text-[#1A365D] hover:text-[#12243e] transition-colors"
            >
              Next report
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[12px] font-semibold text-emerald-600">All reports reviewed ✓</span>
          )}
        </div>

      </main>

      {/* Floating save bar */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 pt-4 pb-8 md:pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-3xl mx-auto space-y-3">
          <button
            onClick={handleSaveAll}
            disabled={savingAll}
            className="w-full py-3.5 bg-[#1A365D] hover:bg-[#12243e] disabled:opacity-50 text-white font-bold text-[15px] rounded-[16px] shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {savingAll ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Saving to Vault…</>
            ) : (
              <><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Save All {batch.length} Reports to Vault</>
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
