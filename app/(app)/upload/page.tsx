"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle2, Loader2, Lock, ShieldCheck } from "lucide-react";
import { genUploader } from "uploadthing/client";

const { uploadFiles } = genUploader();

type Status = "idle" | "extracting" | "uploading" | "success";

const steps = [
  { key: "extracting", label: "Analyzing document", desc: "AI is reading your report" },
  { key: "uploading", label: "Securing in vault", desc: "Encrypting and storing" },
  { key: "success", label: "Analysis complete", desc: "Preparing review screen..." },
];

export default function UploadPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string>("");

  const handleSmartUpload = async (selectedFile: File) => {
    setFileName(selectedFile.name);

    try {
      setStatus("extracting");
      const formData = new FormData();
      formData.append("file", selectedFile);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const aiResponse = await fetch(`${backendUrl}/api/extract`, {
        method: "POST",
        body: formData,
        headers: {
          "Request-ID": `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json().catch(() => ({}));
        const errorDetail = errorData.detail || "Could not read this document. Please ensure it is a valid report.";
        throw new Error(errorDetail);
      }

      const aiData = await aiResponse.json();

      // Check extraction quality
      if (aiData.extraction_quality === "poor") {
        const proceed = confirm(
          "⚠️ The extraction quality is low. Some biomarkers may be inaccurate. Continue anyway?"
        );
        if (!proceed) {
          setStatus("idle");
          return;
        }
      }

      setStatus("uploading");

      const utResponse = await uploadFiles("medicalReport", {
        files: [selectedFile],
      });

      const permanentFileUrl = utResponse[0].url;

      sessionStorage.setItem(
        "pendingVaultData",
        JSON.stringify({
          extractedItems: aiData.data,
          fileName: selectedFile.name,
          fileUrl: permanentFileUrl,
          testDate: new Date().toISOString().split('T')[0],
          reportType: aiData.report_type || null,
          extractionQuality: aiData.extraction_quality,
          warnings: aiData.warnings || [],
          requestId: aiData.request_id,
        })
      );

      setStatus("success");
      setTimeout(() => router.push("/upload/review"), 1200);
    } catch (error: unknown) {
      setStatus("idle");
      const message = error instanceof Error ? error.message : "An error occurred. Please try again or use a clearer image.";
      alert(message);
    }
  };

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-700 px-6 pb-12">

      {/* Header */}
      <header className="pt-10 pb-8">
        <h1 className="text-[32px] font-extrabold text-slate-800 tracking-tight">Upload Report</h1>
        <p className="text-[14px] text-slate-500 font-medium mt-1">
          Add a lab report to your vault for AI-powered analysis.
        </p>
      </header>

      {/* Idle — Drop zone */}
      {status === "idle" && (
        <div className="space-y-5">
          <label className="flex flex-col items-center justify-center w-full min-h-[220px] border-2 border-dashed border-slate-200 rounded-[24px] bg-white hover:border-[#1A365D]/40 hover:bg-slate-50 transition-all cursor-pointer group active:scale-[0.99]">
            <div className="flex flex-col items-center justify-center py-10">
              <div className="p-5 bg-slate-50 rounded-[20px] border border-slate-100 mb-5 group-hover:bg-[#1A365D]/5 group-hover:-translate-y-1 transition-all duration-300 shadow-sm">
                <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-[#1A365D] transition-colors" />
              </div>
              <p className="text-[16px] font-bold text-slate-700 mb-1">Tap to select document</p>
              <p className="text-[13px] text-slate-400 font-medium">JPG, PNG, or WebP · Max 4MB</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleSmartUpload(e.target.files[0]);
                }
              }}
            />
          </label>

          {/* Supported report types */}
          <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-sm">
            <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Supported report types
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Blood / CBC",
                "Lipid Profile",
                "Thyroid (TFT)",
                "Diabetes (HbA1c)",
                "Liver Function",
                "Kidney Function",
                "Vitamin Panels",
                "Health Checkup",
              ].map((type) => (
                <div key={type} className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {type}
                </div>
              ))}
            </div>
          </div>

          {/* Trust footer */}
          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-[16px] border border-slate-100">
            <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
              Your documents are processed using secure, stateless infrastructure.
              Data is encrypted at rest and in transit.
            </p>
          </div>
        </div>
      )}

      {/* Processing state */}
      {status !== "idle" && (
        <div className="flex flex-col items-center py-12">

          {/* Status icon */}
          <div className="w-20 h-20 rounded-[24px] bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-6">
            {status === "success" ? (
              <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            ) : (
              <Loader2 className="w-9 h-9 text-[#1A365D] animate-spin" />
            )}
          </div>

          {/* Step indicator */}
          <div className="w-full max-w-xs space-y-3 mb-8">
            {steps.map((step, i) => {
              const isActive = status === step.key;
              const isDone =
                (status === "uploading" && step.key === "extracting") ||
                (status === "success" && (step.key === "extracting" || step.key === "uploading"));

              return (
                <div key={step.key} className={`flex items-center gap-3 transition-opacity ${isActive || isDone ? "opacity-100" : "opacity-30"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold transition-colors ${isDone ? "bg-emerald-500 text-white" : isActive ? "bg-[#1A365D] text-white" : "bg-slate-100 text-slate-400"}`}>
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-slate-800">{step.label}</p>
                    {isActive && <p className="text-[12px] text-slate-400 font-medium">{step.desc}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[13px] text-slate-400 font-medium text-center max-w-[200px] truncate">
            {fileName}
          </p>
        </div>
      )}

      {/* Security badge — idle only, bottom */}
      {status === "idle" && (
        <div className="mt-auto pt-6 flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-[12px] font-semibold">HIPAA-compliant · End-to-end encrypted</span>
        </div>
      )}

    </div>
  );
}
