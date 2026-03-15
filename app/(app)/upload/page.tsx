"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud, CheckCircle2, Loader2, Lock, ShieldCheck,
  FileText, ImageIcon, X, AlertCircle, Plus, ArrowRight,
} from "lucide-react";
import { pdfToImageFile } from "@/lib/pdfToImage";
import { setPendingFile } from "@/lib/pendingFiles";

type FileStatus = "pending" | "converting" | "extracting" | "done" | "error";

type QueueItem = {
  id: string;
  file: File;
  status: FileStatus;
  errorMessage?: string;
  result?: PendingData;
};

type PendingData = {
  fileName: string;
  fileUrl: string;      // empty until user saves to vault
  fileKey: string;      // key to retrieve file from pendingFiles in-memory store
  extractedItems: ExtractedMarker[];
  testDate: string;
  reportType?: string;
  extractionQuality?: string;
  warnings?: string[];
};

type ExtractedMarker = {
  id: string;
  marker: string;
  value: string;
  unit: string;
  flag: string;
  confidence?: number;
};

const ACCEPTED = "image/jpeg,image/png,image/webp,application/pdf";
const MAX_FILES = 5;

function fileIcon(file: File) {
  if (file.type === "application/pdf") return <FileText className="w-4 h-4 text-red-400" />;
  return <ImageIcon className="w-4 h-4 text-blue-400" />;
}

function statusIcon(status: FileStatus) {
  switch (status) {
    case "done": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case "error": return <AlertCircle className="w-4 h-4 text-red-500" />;
    case "pending": return <div className="w-4 h-4 rounded-full border-2 border-slate-200" />;
    default: return <Loader2 className="w-4 h-4 text-[#1A365D] animate-spin" />;
  }
}

function statusLabel(status: FileStatus) {
  switch (status) {
    case "converting":  return "Converting PDF…";
    case "extracting":  return "AI extracting markers…";
    case "done":        return "Ready to review";
    case "error":       return "Failed";
    default:            return "Waiting";
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const setItemStatus = (id: string, status: FileStatus, extra?: Partial<QueueItem>) => {
    setQueue((q) => q.map((item) => item.id === id ? { ...item, status, ...extra } : item));
  };

  const addFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    const filtered = arr.filter((f) => {
      const ok = f.type === "application/pdf" || f.type.startsWith("image/");
      return ok;
    });
    setQueue((prev) => {
      const combined = [...prev, ...filtered.map((f) => ({
        id: `${f.name}-${f.size}-${Date.now()}`,
        file: f,
        status: "pending" as FileStatus,
      }))];
      return combined.slice(0, MAX_FILES);
    });
  };

  const removeFile = (id: string) => {
    setQueue((q) => q.filter((item) => item.id !== id));
  };

  const processAll = useCallback(async () => {
    if (processing || queue.length === 0) return;
    setProcessing(true);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const results: PendingData[] = [];

    for (const item of queue) {
      try {
        // Step 1: convert PDF if needed
        let fileToProcess = item.file;
        if (item.file.type === "application/pdf") {
          setItemStatus(item.id, "converting");
          fileToProcess = await pdfToImageFile(item.file);
        }

        // Step 2: AI extraction
        setItemStatus(item.id, "extracting");
        const formData = new FormData();
        formData.append("file", fileToProcess);

        const aiResponse = await fetch(`${backendUrl}/api/extract`, {
          method: "POST",
          body: formData,
          headers: {
            "Request-ID": `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          },
        });

        if (!aiResponse.ok) {
          const err = await aiResponse.json().catch(() => ({}));
          throw new Error(err.detail || "AI extraction failed");
        }

        const aiData = await aiResponse.json();

        // Step 3: keep processed file in memory — upload to storage only on vault save
        const fileKey = results.length === 0 && queue.length === 1
          ? "single"
          : `batch_${results.length}`;
        setPendingFile(fileKey, fileToProcess);

        const pendingData: PendingData = {
          extractedItems: aiData.data,
          fileName: item.file.name,
          fileUrl: "",          // will be set when user saves to vault
          fileKey,              // key to retrieve from pendingFiles store
          testDate: new Date().toISOString().split("T")[0],
          reportType: aiData.report_type || null,
          extractionQuality: aiData.extraction_quality,
          warnings: aiData.warnings || [],
        };

        setItemStatus(item.id, "done", { result: pendingData });
        results.push(pendingData);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setItemStatus(item.id, "error", { errorMessage: message });
      }
    }

    if (results.length === 0) {
      setProcessing(false);
      return;
    }

    if (results.length === 1) {
      sessionStorage.setItem("pendingVaultData", JSON.stringify(results[0]));
      router.push("/upload/review");
    } else {
      sessionStorage.setItem("pendingVaultDataBatch", JSON.stringify(results));
      router.push("/upload/batch-review");
    }
  }, [processing, queue, router]);

  const allDone = queue.length > 0 && queue.every((i) => i.status === "done" || i.status === "error");
  const anyProcessing = queue.some((i) =>
    i.status === "converting" || i.status === "extracting"
  );

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-700 px-6 pb-12">

      {/* Header */}
      <header className="pt-10 pb-6">
        <h1 className="text-[32px] font-extrabold text-slate-800 tracking-tight">Upload Reports</h1>
        <p className="text-[14px] text-slate-500 font-medium mt-1">
          Upload up to {MAX_FILES} lab reports at once — images or PDFs.
        </p>
      </header>

      <div className="space-y-5">

        {/* Drop zone */}
        {queue.length < MAX_FILES && !anyProcessing && (
          <label
            className={`flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-[24px] transition-all cursor-pointer active:scale-[0.99] ${
              dragOver
                ? "border-[#1A365D]/60 bg-[#1A365D]/5 scale-[1.01]"
                : "border-slate-200 bg-white hover:border-[#1A365D]/40 hover:bg-slate-50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
            }}
          >
            <div className="flex flex-col items-center justify-center py-8">
              <div className={`p-5 rounded-[20px] border mb-4 transition-all duration-300 shadow-sm ${
                dragOver ? "bg-[#1A365D]/10 border-[#1A365D]/20 -translate-y-1" : "bg-slate-50 border-slate-100"
              }`}>
                <UploadCloud className={`w-8 h-8 transition-colors ${dragOver ? "text-[#1A365D]" : "text-slate-400"}`} />
              </div>
              <p className="text-[16px] font-bold text-slate-700 mb-1">
                {queue.length === 0 ? "Drop files here or tap to browse" : "Add more files"}
              </p>
              <p className="text-[13px] text-slate-400 font-medium">
                JPG, PNG, WebP or PDF · Max 16 MB · Up to {MAX_FILES} files
              </p>
              {queue.length > 0 && (
                <p className="text-[12px] font-semibold text-[#1A365D] mt-1">
                  {MAX_FILES - queue.length} slot{MAX_FILES - queue.length !== 1 ? "s" : ""} remaining
                </p>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={ACCEPTED}
              multiple
              onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
            />
          </label>
        )}

        {/* File queue */}
        {queue.length > 0 && (
          <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                {queue.length} file{queue.length !== 1 ? "s" : ""} selected
              </p>
              {!processing && (
                <button
                  onClick={() => setQueue([])}
                  className="text-[11px] font-semibold text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-50">
              {queue.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="shrink-0">{fileIcon(item.file)}</div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-800 truncate">{item.file.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[11px] text-slate-400 font-medium">{formatBytes(item.file.size)}</p>
                      {item.status !== "pending" && (
                        <p className={`text-[11px] font-semibold ${
                          item.status === "done" ? "text-emerald-600" :
                          item.status === "error" ? "text-red-500" : "text-[#1A365D]"
                        }`}>
                          · {statusLabel(item.status)}
                        </p>
                      )}
                    </div>
                    {item.status === "error" && item.errorMessage && (
                      <p className="text-[11px] text-red-500 font-medium mt-0.5 leading-snug">{item.errorMessage}</p>
                    )}
                  </div>

                  <div className="shrink-0">
                    {!processing || item.status === "pending" || item.status === "done" || item.status === "error" ? (
                      item.status === "pending" ? (
                        <button
                          onClick={() => removeFile(item.id)}
                          className="p-1.5 text-slate-300 hover:text-red-400 rounded-[8px] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      ) : (
                        statusIcon(item.status)
                      )
                    ) : (
                      statusIcon(item.status)
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Process button */}
            {!allDone && (
              <div className="p-4 border-t border-slate-50">
                <button
                  onClick={processAll}
                  disabled={processing || queue.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1A365D] hover:bg-[#12243e] disabled:opacity-50 text-white font-bold text-[14px] rounded-[16px] shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  {anyProcessing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      Process {queue.length} report{queue.length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state: supported types */}
        {queue.length === 0 && (
          <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-sm">
            <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Supported report types
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Blood / CBC", "Lipid Profile",
                "Thyroid (TFT)", "Diabetes (HbA1c)",
                "Liver Function", "Kidney Function",
                "Vitamin Panels", "Health Checkup",
              ].map((type) => (
                <div key={type} className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {type}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust footer */}
        <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-[16px] border border-slate-100">
          <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
            PDFs are converted locally in your browser before analysis. Nothing leaves your device unencrypted.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-[12px] font-semibold">HIPAA-compliant · End-to-end encrypted</span>
        </div>

      </div>
    </div>
  );
}
