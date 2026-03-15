"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, AlertCircle, Trash2, Loader2, ArrowLeft, ShieldCheck, Calendar, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { saveDocumentData } from "@/lib/actions/vault";
import { getReferenceRange, getValueStatus } from "@/lib/referenceRanges";
import { normalizeUnit, getStandardUnit } from "@/lib/unitConversion";
import { nanoid } from "nanoid";

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
  extractedItems: ExtractedMarker[];
  testDate: string;
  reportType?: string;
  extractionQuality?: string;
  warnings?: string[];
};

const FLAG_OPTIONS = ["normal", "high", "low"] as const;
type FlagOption = typeof FLAG_OPTIONS[number];

function stripeColor(flag: string) {
  if (flag === "high" || flag === "High") return "bg-amber-400";
  if (flag === "low" || flag === "Low") return "bg-red-400";
  return "bg-emerald-400/60";
}

function badgeStyles(flag: string) {
  if (flag === "high" || flag === "High") return "bg-amber-50 text-amber-700 border-amber-200/60";
  if (flag === "low" || flag === "Low") return "bg-red-50 text-red-700 border-red-200/60";
  return "";
}

function FlagToggle({ value, onChange }: { value: string; onChange: (f: FlagOption) => void }) {
  const normalized = value.toLowerCase() as FlagOption;
  return (
    <div className="flex gap-1">
      {FLAG_OPTIONS.map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => onChange(f)}
          className={`px-2.5 py-1 rounded-[8px] text-[10px] font-bold uppercase tracking-wide transition-colors ${
            normalized === f
              ? f === "normal"
                ? "bg-emerald-500 text-white"
                : f === "high"
                ? "bg-amber-500 text-white"
                : "bg-red-500 text-white"
              : "bg-slate-100 text-slate-400 hover:text-slate-600"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

export default function ReviewPage() {
  const router = useRouter();
  const [pendingData, setPendingData] = useState<PendingData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [addingMarker, setAddingMarker] = useState(false);
  const [newMarker, setNewMarker] = useState({ marker: "", value: "", unit: "", flag: "normal" as FlagOption });

  useEffect(() => {
    const saved = sessionStorage.getItem("pendingVaultData");
    if (saved) {
      setPendingData(JSON.parse(saved));
    } else {
      router.replace("/upload");
    }
  }, [router]);

  const handleMarkerNameChange = (id: string, newName: string) => {
    if (!pendingData) return;
    setPendingData({
      ...pendingData,
      extractedItems: pendingData.extractedItems.map((item) =>
        item.id === id ? { ...item, marker: newName } : item
      ),
    });
  };

  const handleValueChange = (id: string, newValue: string) => {
    if (!pendingData) return;
    setPendingData({
      ...pendingData,
      extractedItems: pendingData.extractedItems.map((item) =>
        item.id === id ? { ...item, value: newValue } : item
      ),
    });
  };

  const handleUnitChange = (id: string, newUnit: string) => {
    if (!pendingData) return;
    const normalized = normalizeUnit(newUnit);
    setPendingData({
      ...pendingData,
      extractedItems: pendingData.extractedItems.map((item) =>
        item.id === id ? { ...item, unit: normalized || newUnit } : item
      ),
    });
  };

  const handleFlagChange = (id: string, newFlag: FlagOption) => {
    if (!pendingData) return;
    setPendingData({
      ...pendingData,
      extractedItems: pendingData.extractedItems.map((item) =>
        item.id === id ? { ...item, flag: newFlag } : item
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
    setPendingData({ ...pendingData, testDate: newDate });
  };

  const handleAddMarker = () => {
    if (!pendingData || !newMarker.marker.trim() || !newMarker.value.trim()) {
      toast.error("Marker name and value are required");
      return;
    }
    setPendingData({
      ...pendingData,
      extractedItems: [
        ...pendingData.extractedItems,
        { ...newMarker, id: nanoid(), confidence: 1.0 },
      ],
    });
    setNewMarker({ marker: "", value: "", unit: "", flag: "normal" });
    setAddingMarker(false);
    toast.success("Marker added");
  };

  const handleConfirm = async () => {
    if (!pendingData) return;
    setIsSaving(true);

    const result = await saveDocumentData({
      fileName: pendingData.fileName,
      fileUrl: pendingData.fileUrl,
      extractedItems: pendingData.extractedItems,
      testDate: pendingData.testDate,
      reportType: pendingData.reportType,
    });

    if (!result.success) {
      toast.error(result.error ?? "Failed to archive document.");
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

        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-[24px] font-extrabold text-slate-800 tracking-tight">Verify Report</h1>
          {pendingData.reportType && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
              {pendingData.reportType}
            </span>
          )}
        </div>
        <p className="text-[13px] font-medium text-slate-500 mt-1 truncate">
          {pendingData.extractedItems.length} markers extracted from{" "}
          <span className="font-bold text-slate-700">{pendingData.fileName}</span>
        </p>
        {pendingData.extractionQuality === "fair" && (
          <p className="text-[12px] font-semibold text-amber-600 mt-1">
            ⚠ Extraction quality is fair — please review values carefully.
          </p>
        )}
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
            Review all extracted values. Edit marker names, values, units, or flags directly. Remove incorrect entries or add any that were missed.
          </p>
        </div>

        {/* Marker list */}
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

            {pendingData.extractedItems.map((item) => {
              const ref = getReferenceRange(item.marker);
              const status = ref && item.value ? getValueStatus(parseFloat(item.value), ref, item.unit) : null;
              const isFlagged = item.flag === "high" || item.flag === "High" || item.flag === "low" || item.flag === "Low";
              const standardUnit = getStandardUnit(item.marker);
              const confidence = item.confidence ?? 0.95;
              const lowConfidence = confidence < 0.75;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-[18px] border shadow-sm overflow-hidden flex items-stretch group ${
                    lowConfidence ? "border-amber-200" : "border-slate-100"
                  }`}
                >
                  <div className={`w-1 shrink-0 ${stripeColor(item.flag)}`} />

                  <div className="flex-1 p-4 space-y-2.5">

                    {/* Row 1: marker name input + delete */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.marker}
                        onChange={(e) => handleMarkerNameChange(item.id, e.target.value)}
                        className="flex-1 text-[14px] font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-400 focus:outline-none transition-colors py-0.5"
                        title="Edit marker name"
                      />
                      {lowConfidence && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold shrink-0">
                          Low confidence
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-[8px] transition-colors shrink-0"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Row 2: value input + unit input */}
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={item.value}
                        onChange={(e) => handleValueChange(item.id, e.target.value)}
                        className="w-24 h-9 text-right text-[15px] font-bold text-slate-800 border-slate-200 bg-slate-50 rounded-[10px] focus-visible:ring-1"
                      />
                      {item.unit !== undefined && (
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleUnitChange(item.id, e.target.value)}
                          placeholder={standardUnit}
                          className="w-20 text-[12px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-[8px] px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          title={`Standard unit: ${standardUnit}`}
                        />
                      )}
                      {ref && (
                        <span className="text-[11px] text-slate-400 font-medium ml-1">
                          Ref: {ref.min}–{ref.max === 999 ? "↑" : ref.max} {ref.unit}
                        </span>
                      )}
                    </div>

                    {/* Row 3: flag toggle */}
                    <FlagToggle
                      value={item.flag}
                      onChange={(f) => handleFlagChange(item.id, f)}
                    />

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
